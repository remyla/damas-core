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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with damas-core.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

session_start();

include_once "lib/http_service.php";
include_once "lib/model_json.php";

damas_service::init_http();
damas_service::accessGranted();
damas_service::allowed( "model::" . arg("cmd") );

header('Content-type: application/json');

$ret = false;

//CRUD Operations

if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
  if(is_null(arg('keys')))
  {
    header("HTTP/1.1: 400 Bad Request");
    echo "Bad command";
    exit;
  }
  $id = model::create(json_decode(arg("keys")));
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
  if( is_null( arg('id') ) )
  {
    header('HTTP/1.1: 400 Bad Request');
    exit;
  }
  if( strpos( arg("id"), "," ) === false )
  {
    $ret = model_json::node( arg( "id" ), 1, $NODE_TAG | $NODE_PRM );
    if( !$ret )
    {
      header('HTTP/1.1: 404 Not Found');
      exit;
    }
    echo json_encode( array($ret) );
  }
  else
  {
    echo json_encode( model_json::multi( explode( ",", arg("id") ) ) );
    exit;
  }
}

if ($_SERVER['REQUEST_METHOD'] == 'PUT')
{
	if( is_null( arg('id') ) || is_null( arg('keys') ) )
	{
		header("HTTP/1.1: 400 Bad Request");
		echo "Bad command";
		exit;
	}
	$id = model::update( arg("id"), json_decode( arg("keys") ) );
	echo json_encode( model_json::node( arg("id"), 1, $NODE_TAG | $NODE_PRM ) );
	damas_service::log_event();
	exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'DELETE')
{
	if( is_null( arg("id") ) )
	{
		header("HTTP/1.1: 400 Bad Request");
		echo "Bad command";
		exit;
	}
	if( !model::delete( arg("id") ) )
	{
		header("HTTP/1.1: 409 Conflict");
		echo "delete Error, please change your values";
		exit;
	}
	damas_service::log_event();
	exit;
}

?>
