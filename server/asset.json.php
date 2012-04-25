<?php
/**
 * Author Remy Lalanne
 * Copyright (c) 2005-2011 Remy Lalanne
 */
session_start();
header('Content-type: application/json');

include_once "service1.php"; //error_code()
include_once "../php/DAM.php";
include_once "../php/data_model_1.json.php";
include_once "App/lib.user.php";

include_once "FileVersion/lib.asset.php";
include_once "FileSystem/lib.file.php";

$cmd = arg("cmd");
$ret = false;

$init = null;
$init = damas_service::init();
if ( !is_null($init) ) {
	header("HTTP/1.1: ".$init);
	echo $init;
	exit;
}

if (!$cmd ) {
	header("HTTP/1.1: 400 Bad Request");
	echo "Bad command";
	exit;
}

if ( !accessGranted() ) {
	header("HTTP/1.1: 403 Forbidden");
	echo "User authentification required";
	exit;
}

if (!allowed("asset::".$cmd)) {
	header("HTTP/1.1: 405 Method Not Allowed");
	echo "Permission denied";
	exit;
}

switch( $cmd )
{
	case "getElementById":
		$id = model::searchKey('id', arg('id'));
		$id = $id[0];
		$ret = model_json::node($id, 1, $NODE_TAG | $NODE_PRM);
		if( !$ret ) {
			header('HTTP/1.1: 404 Not Found');
			echo "Node not found";
			exit;
			//$err = $ERR_NODE_ID;
		}
		break;
	case "time":
		if( ! model::setKey( arg("id"), "time", time() ) ) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			echo "Node update failed";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		$ret = true;
		break;
	case "write":
		$ret = DAM::write( arg("id"), arg("text") );
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on create");
			echo "Node create failed";
			exit;
			//$err = $ERR_NODE_CREATE;
		}
		break;
	case "lock":
		if( model::hastag( arg("id"), "lock" ) ) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			echo "Node update failed, already lock";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		$ret = model::tag( arg("id"), 'lock' );
		$ret &= model::setKey( arg("id"), "lock_user", getUser() );
		$ret &= model::setKey( arg("id"), 'lock_text', arg("comment") );
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Asset Not Lock");
			echo "Error during locking";
			exit;
			//$err = $ERR_ASSET_LOCK;
		}
		break;
	case "unlock":
		if( asset_ismylock( arg("id") ) )
		{
			$ret = model::untag( arg("id"), 'lock' );
			model::removeKey( arg("id"), 'lock_user' );
			model::removeKey( arg("id"), 'lock_text' );
			break;
		}
		header("HTTP/1.1: 304 Not Modified Error on update");
		echo "Node update failed";
		exit;
		//$err = $ERR_NODE_UPDATE;
	case "upload_set_image":
		if( is_uploaded_file( $_FILES['file']['tmp_name'] ) )
		{
			$extension = pathinfo( $_FILES['file']['name'], PATHINFO_EXTENSION );
			if( move_uploaded_file( $_FILES['file']['tmp_name'], $assetsLCL . '/.damas/images/' . arg("id") . '.' . $extension ) )
			{
				model::setKey( arg("id"), 'image', '/.damas/images/' . arg("id") . '.' . $extension );
				break;
			}
		}
		header("HTTP/1.1: 304 Not Modified Asset Not updated");
		echo "Error during asset update";
		exit;
		//$err = $ERR_ASSET_UPDATE;
	case "upload_create_asset":
		if( is_uploaded_file( $_FILES['file']['tmp_name'] ) )
		{
			$file = model::getKey( arg( 'id' ), 'dir' ) . '/' . $_FILES['file']['name'];
			if( move_uploaded_file( $_FILES['file']['tmp_name'], $assetsLCL . $file ) )
			{
				$id = model::createNode( arg( 'id' ), "asset" );
				model::setKey( $id, 'file', $file );
				model::setKey( $id, 'text', arg( 'message' ) );
				model::setKey( $id, 'user', getUser() );
				model::setKey( $id, 'time', time() );
				$ret = model_json::node( $id, 1, $NODE_TAG | $NODE_PRM );
				break;
			}
		}
		header("HTTP/1.1: 304 Not Modified Error on create");
		echo "Node create failed";
		exit;
		//$err = $ERR_NODE_CREATE;
	case "upload":
		if( model::hastag( arg( 'id' ), 'lock' ) )
		{
			if( model::getKey( arg( 'id' ), 'lock_user' ) != getUser() )
			{
				header("HTTP/1.1: 304 Not Modified Asset Not updated");
				echo sprintf( "asset is locked for the user %s",
					model::getKey( arg( 'id' ), 'lock_user' ) );
				exit;
				//$err = $ERR_ASSET_UPDATE;
			}
		}
		$path = $_FILES['file']['tmp_name'];
		if( !is_uploaded_file( $path ) )
		{
			header("HTTP/1.1: 304 Not Modified Asset Not updated");
			echo "Error on update, is_uploaded_file() error";
			exit;
			//$err = $ERR_ASSET_UPDATE;
		}
		if( !assets::asset_upload( arg("id"), $path, arg("message") ) )
		{
			header("HTTP/1.1: 304 Not Modified Asset Not updated");
			echo sprintf( "<error>Permission denied to copy %s to %s</error>",
				$path,
				$assetsLCL . model::getKey( arg( 'id' ), 'file' ) );
			exit;
			//$err = $ERR_ASSET_UPDATE;
		}
		break;
	case "version_backup":
		$id = assets::version_backup( arg("id") );
		if( !$id ) {
			header('HTTP/1.1: 304 Not Modified Error on create');
			echo "Node create failed";
			exit;
			//$err = $ERR_NODE_CREATE;
		}
		$ret = model_json::node( $id, 1, $NODE_TAG | $NODE_PRM );
		break;
	case "version_increment":
		$ret = assets::version_increment( arg("id"), arg("message") );
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Asset Not updated");
			echo "Error during asset's version increment";
			exit;
			//$err = $ERR_ASSET_UPDATE;
		}
		break;
	case "version_increment2":
		$ret = assets::version_increment2( arg("id"), arg("message") );
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Asset Not updated");
			echo "Error during asset's version increment";
			exit;
			//$err = $ERR_ASSET_UPDATE;
		}
		break;
	case "recycle":
		$ret = DAM::recycle( arg('id') );
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on move");
			echo "Node move failed";
			exit;
			//$err = $ERR_NODE_MOVE;
		}
		break;
	case "empty_trashcan":
		$ret = DAM::empty_trashcan();
		if (!$ret) {
			header('HTTP/1.1: 404 Not Found');
			echo "Node not found";
			exit;
			//$err = $ERR_NODE_ID;
		}
		break;
	default:
		header("HTTP/1.1: 400 Bad Request");
		echo "Bad command";
		exit;
}

damas_service::log_event();

echo json_encode($ret);

?>
