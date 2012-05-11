<?php
/**
 * JSON web service of DAMAS software (damas-software.org)
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

damas_service::init_http();
damas_service::accessGranted();
damas_service::allowed( "model::" . arg("cmd") );

$cmd = arg("cmd");
$ret = false;

if( !$cmd )
{
	header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
	echo "Bad command";
	exit;
}

header('Content-type: application/json');

switch( $cmd )
{
	case "createNode":
		if( is_null( arg('id') ) || is_null( arg('type') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		$id = model::createNode( arg("id"), arg("type") );
		if( !$id )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_CREATE;
			echo "Error during the creation of node, please change your values";
			exit;
		}
		echo json_encode( model_json::node( $id, 1, $NODE_TAG | $NODE_PRM ) );
		break;
	case "duplicate":
		if( is_null( arg('id') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		$id = model::copyBranch( arg("id"), false );
		if( !$id )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_CREATE;
			echo "Error during the copy of nodes, please change your values";
			exit;
		}
		echo json_encode( model_json::node( $id, 1, $NODE_TAG | $NODE_PRM ) );
		break;
	case "removeNode":
		if( is_null( arg('id') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::removeNode( arg("id") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_DELETE;
			echo "Error during the deletion of node, please change your values";
			exit;
		}
		break;
	case "setKey":
		if( is_null( arg('id') ) || is_null( arg('name') ) || is_null( arg('value') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::setKey( arg("id"), arg("name"), arg("value") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "Error during the updating of node, please change your values";
			exit;
		}
		break;
	case "removeKey":
		if( is_null( arg('id') ) || is_null( arg('name') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::removeKey( arg("id"), arg("name") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_UPDATE;
			echo "Error during the updating of node, please change your values";
			exit;
		}
		break;
	case "move":
		if( is_null( arg('id') ) || is_null( arg('target') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		if( !model::move( arg("id"), arg("target") ) )
		{
			header("HTTP/1.1: 409 Conflict"); //$err = $ERR_NODE_MOVE;
			echo "Error during the moving of node, please change your values";
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
			echo "Error during the updating of node, please change your values";
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
			echo "Error during the updating of node, please change your values";
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
			echo "Error during the updating of node, please change your values";
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
			echo "Error during the updating of node, please change your values";
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
			echo "Error during the updating of node, please change your values";
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
			echo "Error during the updating of node, please change your values";
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
			echo "Error during the updating of node, please change your values";
			exit;
		}
		break;

	/**
	 *
	 * json functions
	 * model_json namespace 
	 *
	 */

	case "ancestors":
		if( is_null( arg('id') ) )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		echo json_encode( model_json::multi( model::ancestors( arg('id') ) ) );
		break;
	case "searchKey":
		if( is_null(arg('key')) || arg('value') == null )
		{
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
		}
		echo json_encode( model_json::multi( model::searchKey( arg('key'), arg('value') ) ) );
		break;
	case "single":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request'); //$err = $ERR_COMMAND; break;
			exit;
		}
		$ret = model_json::node( arg( "id" ), 1, $NODE_TAG | $NODE_PRM );
		if( !$ret )
		{
			header('HTTP/1.1: 404 Not Found'); //$err = $ERR_NODE_ID;
			exit;
		}
		echo json_encode( $ret );
		break;
	case "children":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request'); //$err = $ERR_COMMAND; break;
			exit;
		}
		//$ret = model_json::children( arg("id") );
		echo json_encode( model_json::multi( model::children( arg('id') ) ) );
		break;
	case "links":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request'); //$err = $ERR_COMMAND; break;
			exit;
		}
		echo json_encode( model_json::links( arg("id") ) );
		break;
	case "multi":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request'); //$err = $ERR_COMMAND; break;
			exit;
		}
		echo json_encode( model_json::multi( split( ",", arg("id") ) ) );
		break;
	case "graph":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request'); //$err = $ERR_COMMAND; break;
			exit;
		}
		$ret = model_json::graph( arg("id") );
		if (!$ret)
		{
			header('HTTP/1.1: 404 Not Found'); //$err = $ERR_NODE_ID;
			echo json_encode( $ret );
			exit;
		}
		echo json_encode( $ret );
		break;
	case "export":
		if( is_null( arg('id') ) )
		{
			header('HTTP/1.1: 400 Bad Request'); //$err = $ERR_COMMAND; break;
			exit;
		}
		$ret = model_json::node( arg('id'), 0, $NODE_TAG | $NODE_PRM);
		if( !$ret )
		{
			header('HTTP/1.1: 404 Not Found'); //$err = $ERR_NODE_ID;
			exit;
		}
		echo json_encode( $ret );
		break;
	case "search":
		if( is_null( arg('value') ) )
		{
			header('HTTP/1.1: 400 Bad Request'); //$err = $ERR_COMMAND; break;
			exit;
		}
		echo json_encode( model::search( arg('value') ) );
		break;
	default:
		header('HTTP/1.1: 400 Bad Request'); //$err = $ERR_COMMAND;
		exit;
} // switch / case

$nolog = array( 'single', 'children', 'multi', 'stats', 'types', 'tags', 'search' );
if( !in_array( arg('cmd'), $nolog ) )
	damas_service::log_event();
?>
