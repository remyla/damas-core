<?php
/**
 * Data model Php web service of DAMAS software (damas-software.org)
 *
 * output = JSON
 * errors = HTTP
 *
 * Author Remy Lalanne
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

damas_service::init_http();
damas_service::accessGranted();
damas_service::allowed( "model::" . arg("cmd") );

if( !arg("cmd") )
{
	header("HTTP/1.1: 400 Bad Request"); 
	echo "Bad command";
	exit;
}

header('Content-type: application/json');

$ret = false;

switch( arg("cmd") )
{
	case "createNode":
		if( is_null( arg('id') ) || is_null( arg('type') ) )
		{
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		$id = model::createNode( arg("id"), arg("type") );
		if( !$id )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "createNode Error, please change your values";
			exit;
		}
		echo json_encode( model_json::node( $id, 1, $NODE_TAG | $NODE_PRM ) );
		break;
	case "duplicate":
		if( is_null( arg('id') ) )
		{
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		$id = model::copyBranch( arg("id"), false );
		if( !$id )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "copyBranch Error, please change your values";
			exit;
		}
		echo json_encode( model_json::node( $id, 1, $NODE_TAG | $NODE_PRM ) );
		break;
	case "move":
		if( is_null( arg('id') ) || is_null( arg('target') ) )
		{
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
/* move dir or file to dir - incomplete - case : node dir /animatic move to / does a conflict
		if( model::getKey( arg("target"), "dir" ) )
		{
			if( model::getKey( arg("id"), "file" ) || model::getKey( arg("id"), "dir" ) )
			{
				$oldpath = null;
				$newpath = null;
				if( model::getKey( arg("id"), "file" ) )
				{
					$oldpath = model::getKey( arg("id"), "file" );
				}
				if( model::getKey( arg("id"), "dir" ) )
				{
					$oldpath = model::getKey( arg("id"), "dir" );
				}
				$newpath = model::getKey( arg("target"), "dir" ) . "/" . basename( $oldpath );
				if( file_exists( $assetsLCL . $newpath ) )
				{
					header("HTTP/1.1: 409 Conflict");
					echo "move error, file exists";
					exit;
				}
				if( ! rename( $assetsLCL . $oldpath, $assetsLCL . $newpath ) )
				{
					header("HTTP/1.1: 409 Conflict");
					echo "file rename error, move aborted";
					exit;
				}
				model::setKeys( arg("id"), $oldpath, $newpath );
			}
		}
*/
/*
		// move file to dir
		if( model::getKey( arg("id"), "file" ) && model::getKey( arg("target"), "dir" ) )
		{
			$newfile = model::getKey( arg("target"), "dir" ) . "/" . basename( model::getKey( arg("id"), "file" ) );
			if( file_exists( $assetsLCL . $newfile ) )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "move error, file exists";
				exit;
			}
			if( ! rename( $assetsLCL . model::getKey( arg("id"), "file" ), $assetsLCL . $newfile ) )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "file rename error, move aborted";
				exit;
			}
			model::setKey( arg("id"), "file", $newfile );
		}
*/
		if( !model::move( arg("id"), arg("target") ) )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "move Error, please change your values";
			exit;
		}
		break;
	case "removeNode":
		if( is_null( arg('id') ) )
		{
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		if( !model::removeNode( arg("id") ) )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "removeNode Error, please change your values";
			exit;
		}
		break;
	case "setKey":
		if( is_null( arg('id') ) || is_null( arg('name') ) || is_null( arg('value') ) )
		{
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		/* EXPERIMENTAL
		$ids = explode( ",", arg("id") );
		if( $ids )
		{
			foreach( $ids as $id )
			{
				model::setKey( $id, arg("name"), arg("value") );
			}
		}
		*/

		// TRIGGER unique keys
		if( arg("name") == 'id' || arg("name") == 'file' || arg("name") == 'dir' || arg("name") == 'username' )
		{
			if( sizeof( model::find( array( arg("name") => arg("value") ) ) ) !== 0 )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "Key exists";
				exit;
			}
		}
		$value = model::getKey( arg("id"), arg("name") );
		// TRIGGER file rename
		if( arg("name") == 'file' && $value )
		{
			if( ! rename( $assetsLCL . $value, $assetsLCL . arg("value") ) )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "File rename error, please change values";
				exit;
			}
		}
		// TRIGGER dir rename
		if( arg("name") == 'dir' && $value )
		{
			if( ! rename( $assetsLCL . $value, $assetsLCL . arg("value") ) )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "Directory rename error, please change values";
				exit;
			}
			$query = sprintf( "UPDATE `key` SET value = REPLACE( value,'%s','%s') WHERE value LIKE '%s%%' AND name='file';",
						$value, arg("value"), $value );
			$res = mysql_query( $query );
			$query = sprintf( "UPDATE `key` SET value = REPLACE( value,'%s','%s') WHERE value LIKE '%s%%' AND name='dir';",
						$value, arg("value"), $value );
			$res = mysql_query( $query );
		}
		// TRIGGER END
		if( !model::setKey( arg("id"), arg("name"), arg("value") ) )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "setKey Error, please change your values";
			exit;
		}
		// TRIGGER dir mkdir
		if( arg("name") == 'dir' && ! $value  )
		{
			if( ! mkdir( $assetsLCL . arg("value"), 0755, true ) )
			{
				header("HTTP/1.1: 409 Conflict");
				echo "Directory creation error, please change values";
				exit;
			}
		}
		// TRIGGER END
		break;
	case "removeKey":
		if( is_null( arg('id') ) || is_null( arg('name') ) )
		{
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		if( !model::removeKey( arg("id"), arg("name") ) )
		{
			header("HTTP/1.1: 409 Conflict");
			echo "removeKey Error, please change your values";
			exit;
		}
		break;
	case "tag":
		if( is_null( arg('id') ) || is_null( arg('name') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::tag( arg("id"), arg("name") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "tag Error, please change your values";
			exit;
		}
		break;
	case "untag":
		if( is_null( arg('id') ) || is_null( arg('name') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::untag( arg("id"), arg("name") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "untag Error, please change your values";
			exit;
		}
		break;
	case "link":
		if( is_null( arg('src') ) || is_null( arg('tgt') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::link( arg("src"), arg("tgt") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "link Error, please change your values";
			exit;
		}
		break;
	case "unlink":
		if( is_null( arg('id') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::unlink( arg("id") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "Unlink Error, please change your values";
			exit;
		}
		break;
	case "setType":
		if( is_null( arg('id') ) || is_null( arg('type') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( ! model::setType( arg("id"), arg("type") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "setType Error, please change your values";
			exit;
		}
		break;
	case "setTags":
		if( is_null( arg('id') ) || is_null( arg('tags') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::setTags( arg("id"), arg("tags") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "setTags Error, please change your values";
			exit;
		}
		break;
	case "setKeys":
		if( is_null( arg('id') ) || is_null( arg('old') ) || is_null( arg('new') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::setKeys( arg("id"), arg("old"), arg("new") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "setKeys Error, please change your values";
			exit;
		}
		break;

	/**
	 *
	 * json output functions
	 * model_json namespace 
	 *
	 */

	case "ancestors":
		if( is_null( arg('id') ) )
		{
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		echo json_encode( model_json::multi( model::ancestors( arg('id') ) ) );
		break;
	case "branch":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		$ret = model_json::node( arg('id'), 0, $NODE_TAG | $NODE_PRM);
		if( !$ret )
		{
			header('HTTP/1.1: 404 Not Found');
			exit;
		}
		echo json_encode( $ret );
		break;
	case "children":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		// Here we implemented the children method to return indexes for performance, keeping the backward compatibility
		if( arg("int") === '1' )
			echo json_encode( model::children( arg('id') ) );
		else
			echo json_encode( model_json::multi( model::children( arg('id') ) ) );
		break;
	case "find":
		$a = $_GET + $_POST;
		unset( $a['cmd'] );
		echo json_encode( model::find( $a ) );
		break;
	case "findSQL":
		if( is_null( arg('query') ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		# Forbidden SQL manipulation keywords
		if( stripos( arg('query'), 'ALTER' ) ||
			stripos( arg('query'), 'CALL' ) ||
			stripos( arg('query'), 'CREATE' ) ||
			stripos( arg('query'), 'DELETE' ) ||
			//stripos( arg('query'), 'DO' ) || // interferes to much
			stripos( arg('query'), 'DROP' ) ||
			stripos( arg('query'), 'HANDLER' ) ||
			stripos( arg('query'), 'INSERT' ) ||
			stripos( arg('query'), 'LOAD' ) ||
			stripos( arg('query'), 'RENAME' ) ||
			stripos( arg('query'), 'REPLACE' ) ||
			stripos( arg('query'), 'TRUNCATE' ) ||
			stripos( arg('query'), 'UPDATE' ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		$querystr = stripslashes( arg('query') );
		$querystr = str_replace( "&", "&amp;", $querystr );
		$querystr = str_replace( "<", "&lt;", $querystr );
		$querystr = str_replace( ">", "&gt;", $querystr );
		$result = mysql_query( $querystr );
		$res = array();
		while( $row = mysql_fetch_array( $result ) )
		{
			$res[] = intval( $row['id'] );
		}
		echo json_encode( $res );
		break;
	case "graph":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		$ret = model_json::graph( arg("id") );
		if (!$ret)
		{
			header('HTTP/1.1: 404 Not Found');
			echo json_encode( $ret );
			exit;
		}
		echo json_encode( $ret );
		break;
	case "links":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		echo json_encode( model_json::links( arg("id") ) );
		break;
	case "list":
		if( is_null( arg('key') ) )
		{
			$result = mysql_query( "SELECT DISTINCT name FROM `key` ORDER BY name;" );
			$res = array();
			while( $row = mysql_fetch_array( $result ) )
			{
				$res[] = $row['name'];
			}
			echo json_encode( $res );
		}
		else
		{
			$result = mysql_query( "SELECT DISTINCT value FROM `key` WHERE name='" . arg('key') . "' ORDER BY value;" );
			$res = array();
			while( $row = mysql_fetch_array( $result ) )
			{
				$res[] = $row['value'];
			}
			echo json_encode( $res );
		}
		break;
	case "multi":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		echo json_encode( model_json::multi( split( ",", arg("id") ) ) );
		break;
	case "search":
		if( is_null( arg('value') ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		echo json_encode( model::search( arg('value') ) );
		break;
	case "single":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request');
			exit;
		}
		$ret = model_json::node( arg( "id" ), 1, $NODE_TAG | $NODE_PRM );
		if( !$ret )
		{
			header('HTTP/1.1: 404 Not Found');
			exit;
		}
		echo json_encode( $ret );
		break;
	default:
		header('HTTP/1.1: 400 Bad Request');
		exit;
} // switch / case

$nolog = array( 'ancestors', 'single', 'children', 'links', 'multi', 'stats', 'types', 'tags', 'search' );
if( !in_array( arg('cmd'), $nolog ) )
	damas_service::log_event();
?>
