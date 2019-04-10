<?php
/**
 * file.php - Php interface to file system as a service
 *
 * Author Remy Lalanne
 * Copyright 2005-2014 Remy Lalanne
 */
session_start();

include_once "lib/http_service.php";
#include_once "FileSystem/lib.file.php";

damas_service::init_http();
damas_service::accessGranted();


if( !arg("cmd") )
{
	header("HTTP/1.1: 400 Bad Request");
	echo "Bad command";
	exit;
}

function checkfilefound( $path )
{
	if( ! file_exists( $path ) )
	{
		header("HTTP/1.1: 404 Not Found");
		echo "The file ". $path . " was not found";
		exit;
	}
}

switch( arg("cmd") )
{
	case "sha1":
		checkfilefound( $assetsLCL . arg("path") );
		$sha1 = sha1_file( $assetsLCL . arg("path") );
		if( $sha1 === false )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "sha1_file( ". $assetsLCL . arg("path") . " ) returned FALSE";
			exit;
		}
		echo $sha1;
		break;
	case "df":
		checkfilefound( $assetsLCL . arg("path") );
		echo json_encode( array(
			'total' => disk_total_space( $assetsLCL . arg("path") ),
			'free' => disk_free_space( $assetsLCL . arg("path") )
		));
		break;
	case "diskfreespace":
		checkfilefound( $assetsLCL . arg("path") );
		echo json_encode( disk_free_space( $assetsLCL . arg("path") ) );
		break;
	case "disktotalspace":
		checkfilefound( $assetsLCL . arg("path") );
		echo json_encode( disk_total_space( $assetsLCL . arg("path") ) );
		break;
	case "stat":
		checkfilefound( $assetsLCL . arg("path") );
		echo json_encode( lstat( $assetsLCL . arg("path") ) );
		break;
	case "single_sha1":
		$ret = filesingle_sha1($assetsLCL.arg("path"), $assetsLCL);
		if (!$ret)
			$err = $ERR_FILE_NOT_FOUND;
		break;
	case "list":
		if (!file_exists($assetsLCL.arg("path")))
			$err = $ERR_FILE_NOT_FOUND;
		$ret = filelist($assetsLCL.arg("path"), $assetsLCL);
		//if (!$ret)
			//$err = $ERR_FILE_EMPTYDIR;
		break;
	case "mkdir":
		if ( !is_writable($assetsLCL.arg("path")) ){
			$err = $ERR_FILE_PERMISSION;
			break;
		}
		if ( file_exists($assetsLCL.arg("path")) ){
			$err = $ERR_FILE_EXISTS;
			break;
		}
		mkdir($assetsLCL.arg("path"));
	case "copyfiles":
		if (!in_array(auth_get_class(),array("admin", "supervisor","dirprod"))){ $err = $ERR_PERMISSION; break; }
	
		if(!file_exists($assetsLCL.arg("path"))){ $err = $ERR_FILE_NOT_FOUND; break; }
	
		if(!file_exists($assetsLCL.arg("target")))
		{
			$ret = createDirs($assetsLCL.arg("target"));
			if(!$ret){ $err = $ERR_FILE_PERMISSION; break; }
		}

		$ret = deleteFiles($assetsLCL.arg("target"));
		if(!$ret){ $err = $ERR_FILE_PERMISSION; break; }

		$ret = copyFiles($assetsLCL.arg("path"),$assetsLCL.arg("target"));
		if(!$ret){ $err = $ERR_FILE_PERMISSION; break; }
		
		break;
	case "spider":
		$ret = spider($assetsLCL.arg("path"), $assetsLCL);
		if (!$ret)
			$err = $ERR_FILE_NOT_FOUND;
		break;
	case "touch":
		if (!in_array(auth_get_class(),array("admin", "supervisor","dirprod"))){ $err = $ERR_PERMISSION; break; }
		$ret = touch($assetsLCL.arg("path"));
		if (!$ret)
			$err = $ERR_FILE_PERMISSION;
		break;
	#case "rm":
	#case "mv":
	#case "mkdir":
	#case "touch":
	#case "chmod":
	#case "chgroup":
	case "fileSave":
		$ret = asset_save(arg("id"), arg("path"), arg("comment"));
		if (!$ret)
			$err = $ERR_ASSET_UPDATE;
		break;
	case "fileUpload":
		$path = $_FILES['file']['tmp_name'];
		if(!is_uploaded_file($path))
			$err = $ERR_FILE_UPLOAD;
		else {
			if(!move_uploaded_file($path, $assetsLCL.arg("path")."/".utf8_encode($_FILES['file']['name'])))
			//if(!move_uploaded_file($path, $assetsLCL.arg("path")."/".$_FILES['file']['name']))
				$err = $ERR_FILE_UPLOAD;
		}
		break;
	case "fileUpload2":
		include_once "../App/damas-xml.php";
		$path = $_FILES['file']['tmp_name'];
		if(!is_uploaded_file($path))
			$err = $ERR_ASSET_UPDATE;
		else{
			if(!move_uploaded_file($path, $assetsLCL.arg("path")."/".$_FILES['file']['name']))
				$err = $ERR_ASSET_UPDATE;
			else{
				//$new_id = model::createNode( $id, "dam:file", $_FILES['file']['name'] );
				$new_id = model::createNode( $id, "dam:file" );
				model::setkey( $new_id, 'name', $_FILES['file']['name'] );
			}
		}
		break;
	default:
		$err = $ERR_COMMAND;
}
?>
