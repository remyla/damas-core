<?php
/**
 * JSON web service of DAMAS (damas-software.org)
 *
 * Copyright 2005-2012 Remy Lalanne
 *
 * This file is part of damas-core.
 *
 * damas-core is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * damas-core is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with damas-core.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

session_start();

include_once "service.php";
include_once "../php/data_model_1.json.php";
include_once "../php/DAM.php";
include_once "asset.php";
include_once "FileSystem/lib.file.php";

damas_service::init_http();
damas_service::accessGranted();
damas_service::allowed( "asset::" . arg("cmd") );

$ret = false;
header('Content-type: application/json');

switch( arg("cmd") )
{
	case "filecheck":
		if( ! file_exists( $assetsLCL . model::getKey( arg("id"), 'file' ) ) )
		{
			header("HTTP/1.1: 404 Not Found");
			echo "File " . model::getKey( arg("id"), 'file' ) . " not found";
			exit;
		}
		if( ! is_readable( $assetsLCL . model::getKey( arg("id"), 'file' ) ) )
		{
			header("HTTP/1.1: 403 Forbidden");
			echo "The file is not readable";
			exit;
		}
		if( ! is_null( arg('sha1') ) )
		{
			if( sha1_file( $assetsLCL . model::getKey( arg("id"), 'file' ) ) !== arg('sha1') )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "The sha1 checksum does not match";
				exit;
			}
		}
		$ret = true;
		break;
	case "time":
		if( ! model::setKey( arg("id"), "time", time() ) ) {
			header("HTTP/1.1: 304 Not Modified Could not update time");
			echo "Could not update time";
			exit;
		}
		$ret = true;
		break;
	case "write":
		$id = DAM::write( arg("id"), arg("text") );
		if( !$id )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the creation of the message";
			exit;
		}
		$ret = model_json::node( $id, 1, $NODE_TAG | $NODE_PRM );
		break;
	case "lock":
		//if( model::hastag( arg("id"), "lock" ) ) {
		if( model::getKey( $id, 'lock' ) )
		{
			header("HTTP/1.1: 304 Not Modified - Asset is already locked");
			exit;
		}
		//$ret &= model::setKey( arg("id"), "lock", getUser() );
		//$ret = model::tag( arg("id"), 'lock' );
		//$ret &= model::setKey( arg("id"), 'lock_text', arg("comment") );
		if ( ! model::setKey( arg("id"), "lock", getUser() ) )
		{
			header("HTTP/1.1: 304 Not Modified - Asset lock failure");
			exit;
		}
		break;
	case "unlock":
		if( getUser() == model::getKey( arg('id'), 'lock' ) )
		{
			model::removeKey( arg("id"), 'lock' );
			//$ret = model::untag( arg("id"), 'lock' );
			//model::removeKey( arg("id"), 'lock_text' );
			break;
		}
		header("HTTP/1.1: 304 Not Modified - Not locked by " . getUser() );
		exit;
	case "upload_set_image":
		//
		// this is the content type required by ajaxupload.js
		//
		header('Content-type: application/javascript');
		if( is_uploaded_file( $_FILES['file']['tmp_name'] ) )
		{
			$extension = pathinfo( $_FILES['file']['name'], PATHINFO_EXTENSION );
			if( move_uploaded_file( $_FILES['file']['tmp_name'], $assetsLCL . '/upload/' . arg("id") . '.' . $extension ) )
			{
				$ret = model::setKey( arg("id"), 'image', '/upload/' . arg("id") . '.' . $extension );
				//
				// The result must be true for ajaxupload.js
				//
				$ret = true;
				break;
			}
		}
		//
		// HTTP errors don't work with ajaxupload - we send error 200 then a response != true
		//header("HTTP/1.1: 304 Not Modified Asset Not updated");
		//
		echo json_encode( 'The file upload failed, the image was not updated' );
		exit;
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
				//
				// The result must be true for ajaxupload.js
				//
				$ret = true;
				break;
			}
		}
		//
		// HTTP errors don't work with ajaxupload - we send error 200 then a response != true
		//header("HTTP/1.1: 304 Not Modified Error on create");
		//
		echo json_encode( 'The file upload failed, the asset was not created' );
		exit;
	case "upload":
		if( model::hastag( arg( 'id' ), 'lock' ) )
		{
			if( model::getKey( arg( 'id' ), 'lock_user' ) != getUser() )
			{
				//
				// HTTP errors don't work with ajaxupload - we send error 200 then a response != true
				//header("HTTP/1.1: 304 Not Modified Asset Not updated");
				//
				echo json_encode( 'The asset is locked, and was not updated' );
				exit;
			}
		}
		$path = $_FILES['file']['tmp_name'];
		if( !is_uploaded_file( $path ) )
		{
			//
			// HTTP errors don't work with ajaxupload - we send error 200 then a response != true
			//header("HTTP/1.1: 304 Not Modified Asset Not updated");
			//
			echo json_encode( 'The file upload failed, the asset was not updated' );
			exit;
		}
		if( !assets::asset_upload( arg("id"), $path, arg("message") ) )
		{
			//
			// HTTP errors don't work with ajaxupload - we send error 200 then a response != true
			//header("HTTP/1.1: 304 Not Modified Asset Not updated");
			//
			echo json_encode( 'The file upload failed, the asset was not updated' );
			exit;
		}
		//
		// The result must be true for ajaxupload.js
		//
		$ret = true;
		break;
	case "version_backup":
		$id = assets::version_backup( arg("id") );
		if( !$id ) {
			header('HTTP/1.1: 304 Not Modified Error on create');
			exit;
		}
		$ret = model_json::node( $id, 1, $NODE_TAG | $NODE_PRM );
		break;
	case "version_increment":
		$ret = assets::version_increment( arg("id"), arg("message") );
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Asset Not updated");
			exit;
		}
		break;
	case "version_increment2":
		$ret = assets::version_increment2( arg("id"), arg("message") );
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Asset Not updated");
			exit;
		}
		break;
	case "recycle":
		$ret = DAM::recycle( arg('id') );
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Could not move element to trash");
			exit;
		}
		break;
	case "empty_trashcan":
		$ret = DAM::empty_trashcan();
		if (!$ret) {
			header('HTTP/1.1: 404 Not Found');
			exit;
		}
		break;
	default:
		header("HTTP/1.1: 400 Bad Request");
		exit;
}

damas_service::log_event();

echo json_encode($ret);

?>
