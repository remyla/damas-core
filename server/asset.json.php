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
	case "settings":
		//echo json_encode( ini_get_all( null, false ) ); // debug only
		// helper from php.net:
		function return_bytes($val)
		{
			$val = trim($val);
			$last = strtolower($val[strlen($val)-1]);
			switch($last) {
				// The 'G' modifier is available since PHP 5.1.0
				case 'g':
					$val *= 1024;
				case 'm':
					$val *= 1024;
				case 'k':
					$val *= 1024;
			}
			return $val;
		}
		echo json_encode( array(
			'post_max_size' => return_bytes( ini_get('post_max_size') ),
			'upload_max_filesize' => return_bytes( ini_get('upload_max_filesize') ),
			'max_file_uploads' => intval( ini_get('max_file_uploads') )
		));
		break;
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
		//
		// Error handling - must be successful for every file, else we abort
		//
		$error_detected = false;
		$msg = '';
		foreach( $_FILES as $file )
		{
			if( $file['error'] != 0 )
			{
				$error_detected = true;
				$msg .= $file['name'] . ': ';
				switch ($file['error']) {
					case UPLOAD_ERR_INI_SIZE:
						$msg .= 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
						break;
					case UPLOAD_ERR_FORM_SIZE:
						$msg .= 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
						break;
					case UPLOAD_ERR_PARTIAL:
						$msg .= 'The uploaded file was only partially uploaded';
						break;
					case UPLOAD_ERR_NO_FILE:
						$msg .= 'No file was uploaded';
						break;
					case UPLOAD_ERR_NO_TMP_DIR:
						$msg .= 'Missing a temporary folder';
						break;
					case UPLOAD_ERR_CANT_WRITE:
						$msg .= 'Failed to write file to disk';
						break;
					case UPLOAD_ERR_EXTENSION:
						$msg .= 'File upload stopped by extension';
						break;
					default:
						$msg .= 'Unknown upload error';
						break;
				} 
				$msg .= '. ';
				continue;
			}
			if( ! is_uploaded_file( $file['tmp_name'] ) )
			{
				$error_detected = true;
				$msg .= $file['name'] . ": is_uploaded_file returned false. Possible break attempt";
				continue;
			}
		}
		if( $error_detected )
		{
			header("HTTP/1.1: 409 Conflict");
			echo $msg . '. No change made.';
			exit;
		}
		foreach( $_FILES as $file )
		{
			// we are in a dir
			if( !is_writable( $assetsLCL . model::getKey( arg( 'id' ), 'dir' ) ) )
			{
				$error_detected = true;
				$msg .= model::getKey( arg( 'id' ), 'dir' ) . " is not writable. ";
			}
			$path = model::getKey( arg( 'id' ), 'dir' ) . '/' . $file['name'];
			$id =  array_shift( model::find( array( 'file' => $path ) ) );
			if( $id )
			{
				// replacement checks
				switch( model::getKey( arg('id'), 'mode' ) )
				{
					case '1':
					default:
						if( !is_writable( $assetsLCL . assets::getbackupfolder( $id ) ) )
						{
							$error_detected = true;
							$msg .= assets::getbackupfolder( $id ) . " is not writable. ";
						}
						if( file_exists( $assetsLCL . assets::getbackuppath( $id ) ) )
						{
							$error_detected = true;
							$msg .= assets::getbackuppath( $id ) . " exists. ";
						}
						if( !is_writable( $assetsLCL . model::getKey( $id, 'file' ) ) )
						{
							$error_detected = true;
							$msg .= model::getKey( $id, 'file' ) . " is not writable. ";
						}
						break;
				}
			}
		}
		if( $error_detected )
		{
			header("HTTP/1.1: 409 Conflict");
			echo $msg . 'No change made.';
			exit;
		}
		//
		// Perform the file(s) creation / replacement
		//
		foreach( $_FILES as $file )
		{
			$path = model::getKey( arg( 'id' ), 'dir' ) . '/' . $file['name'];
			$id =  array_shift( model::find( array( 'file' => $path ) ) );
			if( $id )
			{
				// replacement
				switch( model::getKey( $id, 'mode' ) )
				{
					case '2':
						$newid = assets::version_increment2( $id, "new version uploaded" );
						if( !$newid )
						{
							$error_detected = true;
							$msg .= model::getKey( $id, 'file' ) . " increment2 failed. ";
							continue;
						}
						if( !move_uploaded_file( $file['tmp_name'], $assetsLCL . model::getKey( $newid, 'file' ) ) )
						{
							$error_detected = true;
							$msg .= model::getKey( $id, 'file' ) . " move_uploaded_file failed (enough space?). ";
							continue;
						}
						break;
					case '1':
					default:
						$new_id = assets::version_backup( $id );
						if( !$new_id )
						{
							$error_detected = true;
							$msg .= model::getKey( $id, 'file' ) . " backup failed. ";
							continue;
						}
						if( !move_uploaded_file( $file['tmp_name'], $assetsLCL . model::getKey( $id, 'file' ) ) )
						{
							unlink( $assetsLCL . model::getKey( $new_id, 'file' ) );
							model::removeNode( $new_id );
							$error_detected = true;
							$msg .= model::getKey( $id, 'file' ) . " move_uploaded_file failed (enough space?). ";
							continue;
						}
						if( !assets::version_increment( $id, "new version uploaded" ) )
						{
							$error_detected = true;
							$msg .= model::getKey( $id, 'file' ) . " increment failed. ";
							continue;
						}
						model::setKey( $id, 'bytes', $file['size'] );
						break;
				}
				/*
				if( !assets::asset_upload( $asset, $file['tmp_name'], "new version uploaded" ) )
				{
					header("HTTP/1.1: 304 Not Modified Asset Not updated");
					echo json_encode('The file upload failed, the asset was not updated');
					exit;
				}
				*/
			}
			else
			{
				// creation
				if( move_uploaded_file( $file['tmp_name'], $assetsLCL . $path ) )
				{
					$asset = model::createNode( arg( 'id' ), "asset" );
					model::setKey( $asset, 'file', $path );
					model::setKey( $asset, 'text', 'initial version uploaded' );
					model::setKey( $asset, 'user', getUser() );
					model::setKey( $asset, 'time', time() );
					model::setKey( $asset, 'bytes', $file['size'] );
				}
				else
				{
					$error_detected = true;
					$msg .= $path . "move_uploaded_file failed (enough space?). ";
					continue;
				}
			}
/*
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
*/
		}
		if( $error_detected )
		{
			header("HTTP/1.1: 409 Conflict");
			echo $msg . 'No change made.';
			exit;
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
		if( model::getKey( arg( 'id' ), 'lock' ) && model::getKey( arg( 'id' ), 'lock' ) != getUser() )
		{
			//
			// HTTP errors don't work with ajaxupload - we send error 200 then a response != true
			//header("HTTP/1.1: 304 Not Modified Asset Not updated");
			//
			echo json_encode( 'The asset is locked, and was not updated' );
			exit;
		}
		$path = $_FILES['file']['tmp_name'];
		if( !is_uploaded_file( $path ) )
		{
			//
			// HTTP errors don't work with ajaxupload - we send error 200 then a response != true
			//header("HTTP/1.1: 304 Not Modified Asset Not updated");
			//
			//echo "is_uploaded_file returned false. Possible break attempt";
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
		$path = model::getKey( arg('id'), 'file' );
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
