<?php
/**
 * @fileoverview User Authentication service of DAMAS (damas-software.org)
 *
 * @author Remy Lalanne
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
 */
session_start();

include_once "service.php";
include_once "../php/data_model_1.php";

damas_service::init_http();

if( arg('cmd') != 'login' )
{
	damas_service::accessGranted();
}

switch( arg("cmd") )
{
	case "login":
		if( ! login( arg("user"), arg("password") ) )
		{
   			header("HTTP/1.1: 401 Unauthorized"); //ERR_AUTHREQUIRED
   			echo "Incorrect username and password";
   			exit;
		}
		#$_SESSION['user_id'] = getUserId( arg('user') );
		#$res = model::searchKey( 'username', $login );
		#return $res[0];
		header('Content-type: application/json');
		echo json_encode( true );
		exit;
	case "logout":
		if( !logout() )
		{
   			header("HTTP/1.1: 417 Expectation Failed");
   			echo "User log out failed";
   			exit;
		}
		header('Content-type: application/json');
   		header("HTTP/1.1: 401 Unauthorized"); //ERR_AUTHREQUIRED
		echo json_encode( true );
		exit;
	case "getUser":
		if( $anonymous_access == true )
		{
			header('Content-type: application/json');
			echo json_encode( array(
				"username" => "guest",
				"userclass" => "guest"
			));
   			exit;
		}
		if( ! array_key_exists( "login", $_SESSION ) )
		{
   			header( "HTTP/1.1: 401 Unauthorized" );
   			echo "User not authenticated";
   			exit;
		}
		header('Content-type: application/json');
		echo json_encode( array(
			"username" => $_SESSION['login'],
			"userclass" => auth_get_class()
		));
		break;
	default:
		header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
		echo "Bad command";
		exit;
}
?>
