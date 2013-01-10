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

header('Content-type: application/json');

switch( arg("cmd") )
{
	case "filecheck":
		if( model::getKey( arg('id'), 'file' ) )
		{
			$path = model::getKey( arg('id'), 'file' );
		}
		if( model::getKey( arg('id'), 'dir' ) )
		{
			$path = model::getKey( arg('id'), 'dir' );
		}
		if( ! file_exists( $assetsLCL . $path ) )
		{
			header("HTTP/1.1: 404 Not Found");
			echo "File " . $path . " not found";
			exit;
		}
		if( ! is_readable( $assetsLCL . $path ) )
		{
			header("HTTP/1.1: 403 Forbidden");
			echo "The file is not readable";
			exit;
		}
		if( ! is_null( arg('sha1') ) )
		{
			if( sha1_file( $assetsLCL . $path ) !== arg('sha1') )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "The sha1 checksum does not match";
				exit;
			}
		}
		echo json_encode( true );
		break;
	case "time":
		if( ! model::setKey( arg("id"), "time", time() ) ) {
			header("HTTP/1.1: 304 Not Modified Could not update time");
			echo "Could not update time";
			exit;
		}
		echo json_encode( true );
		break;
	case "write":
		$id = DAM::write( arg("id"), arg("text") );
		if( !$id )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the creation of the message";
			exit;
		}
		echo json_encode( model_json::node( $id, 1, $NODE_TAG | $NODE_PRM ) );
		break;
	case "lock":
		if( model::getKey( arg("id"), 'lock' ) )
		{
			header("HTTP/1.1: 304 Not Modified - Asset is already locked");
			exit;
		}
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
				echo json_encode( true );
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
		foreach( $_FILES as $file )
		{
			if( $file['error'] != 0 )
			{
				header("HTTP/1.1: 409 Conflict");
				echo $file['name'] . ' was not uploaded: ';
				switch ($file['error']) {
					case UPLOAD_ERR_INI_SIZE:
						echo 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
						break;
					case UPLOAD_ERR_FORM_SIZE:
						echo 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
						break;
					case UPLOAD_ERR_PARTIAL:
						echo 'The uploaded file was only partially uploaded';
						break;
					case UPLOAD_ERR_NO_FILE:
						echo 'No file was uploaded';
						break;
					case UPLOAD_ERR_NO_TMP_DIR:
						echo 'Missing a temporary folder';
						break;
					case UPLOAD_ERR_CANT_WRITE:
						echo 'Failed to write file to disk';
						break;
					case UPLOAD_ERR_EXTENSION:
						echo 'File upload stopped by extension';
						break;
					default:
						echo 'Unknown upload error';
						break;
				} 
				echo '. ';
				continue;
			}
			if( ! is_uploaded_file( $file['tmp_name'] ) )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "is_uploaded_file returned false. Possible break attempt";
				exit;
			}
			$path = model::getKey( arg( 'id' ), 'dir' ) . '/' . $file['name'];
			// overwrite an existing file!
			if( move_uploaded_file( $file['tmp_name'], $assetsLCL . $path ) )
			{
				$asset = false;
				$assets = model::find( array( 'file' => $path ) );
				foreach( $assets as $a )
				{
					if( model::parent($a) == arg('id') )
					{
						$asset = $a;
					}
				}
				if( ! $asset )
				{
					$asset = model::createNode( arg( 'id' ), "asset" );
					model::setKey( $asset, 'file', $path );
					model::setKey( $asset, 'text', arg( 'message' ) );
				}
				model::setKey( $asset, 'user', getUser() );
				model::setKey( $asset, 'time', time() );
				//$ret += model_json::node( $id, 1, $NODE_TAG | $NODE_PRM );
			}
			else
			{
				header("HTTP/1.1: 304 Not Modified Error on create");
				echo "move_uploaded_file failed. enough space?";
				exit;
			}
		}
		break;

/*

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
*/
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
		echo json_encode( true );
		break;
	case "version_backup":
		$id = assets::version_backup( arg("id") );
		if( !$id )
		{
			header('HTTP/1.1: 304 Not Modified Error on create');
			exit;
		}
		echo json_encode( model_json::node( $id, 1, $NODE_TAG | $NODE_PRM ) );
		break;
	case "version_increment":
		if( ! assets::version_increment( arg("id"), arg("message") ) )
		{
			header("HTTP/1.1: 304 Not Modified Asset Not updated");
			exit;
		}
		echo json_encode( true );
		break;
	case "version_increment2":
		if( ! assets::version_increment2( arg("id"), arg("message") ) )
		{
			header("HTTP/1.1: 304 Not Modified Asset Not updated");
			exit;
		}
		echo json_encode( true );
		break;
	case "recycle":
		if( ! DAM::recycle( arg('id') ) )
		{
			header("HTTP/1.1: 304 Not Modified Could not move element to trash");
			exit;
		}
		echo json_encode( true );
		break;
	case "empty_trashcan":
		if( ! $ret = DAM::empty_trashcan() )
		{
			header('HTTP/1.1: 404 Not Found');
			exit;
		}
		echo json_encode( true );
		break;
	default:
		header("HTTP/1.1: 400 Bad Request");
		exit;
}
damas_service::log_event();
?>
