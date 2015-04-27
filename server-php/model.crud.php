<?php
/**
 * Data model Php web service of DAMAS software (damas-software.org)
 *
 * output = JSON
 * errors = HTTP
 *
 * Author Remy Lalanne
 * Copyright 2005-2014 Remy Lalanne
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with damas-core.	If not, see <http://www.gnu.org/licenses/>.
 *
 */

session_start();

include_once "lib/http_service.php";
include_once "lib/model_json.php";

damas_service::init_http();
damas_service::accessGranted();

header('Content-type: application/json');

$ret = false;

//CRUD Operations

if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
	damas_service::allowed( "model::create" );
	if(empty($_POST))
	{
		header("HTTP/1.1: 400 Bad Request");
		echo "Bad command";
		exit;
	}
	$id = model::create($_POST);
	if(!$id)
	{
		header("HTTP/1.1: 409 Conflict");
		echo "create Error, please change your values";
		exit;
	}
	echo json_encode(model_json::node($id, 1, $NODE_TAG | $NODE_PRM));
	damas_service::log_event();
	exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'GET')
{
	damas_service::allowed( "model::read" );
	if(empty($_GET)|| ( $_GET['id']=='' ))
	{
		header('HTTP/1.1: 400 Bad Request');
		exit;
	}
	if( strpos( $_GET['id'], "," ) === false )
	{
		$ret = model_json::node( $_GET['id'], 1, $NODE_TAG | $NODE_PRM );
		if( !$ret )
		{
			header('HTTP/1.1: 404 Not Found');
			exit;
		}
		echo json_encode( array($ret) );
	}
	else
	{
		echo json_encode( model_json::multi( explode( ",", $_GET['id'] ) ) );
	}
	exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'PUT')
{
	damas_service::allowed( "model::update" );
	if(( !isset( $_PUT['id'] ) || !isset( $_PUT['keys'] ) )||( $_PUT['id']=='' || $_PUT['keys']==''	))
	{
		header("HTTP/1.1: 400 Bad Request");
		echo "Bad command";
		exit;
	}
	$id = model::update( $_PUT['id'], json_decode( $_PUT['keys'] ) );
	echo json_encode( model_json::node( arg("id"), 1, $NODE_TAG | $NODE_PRM ) );
	damas_service::log_event();
	exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'DELETE')
{
	damas_service::allowed( "model::delete" );
	if( !isset( $_DELETE['id']) || $_DELETE['id']=='' )
	{
		header("HTTP/1.1: 400 Bad Request");
		echo "Bad command";
		exit;
	}
	if( !model::delete( $_DELETE['id'] ) )
	{
		header("HTTP/1.1: 409 Conflict");
		echo "delete Error, please change your values";
		exit;
	}
	damas_service::log_event();
	exit;
}

?>
