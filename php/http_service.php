<?php
/**
 * @fileoverview Methods for DAMAS web service (damas-software.org)
 * @author Remy Lalanne
 *
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

$version = "2.2-beta6";

/**
 * Get a command argument from POST then GET methods
 * @param $name {String} name of the argument to get value from
 * @return {String} argument value or null if the argument is not found
 */
function arg ( $name )
{
	global $_POST;
	global $_GET;
	if( array_key_exists( $name, $_POST ) )
		return stripslashes( $_POST[$name] );
	if( array_key_exists( $name, $_GET ) )
		return stripslashes( $_GET[$name] );
	return null;
}

function auth_get_class ()
{
	if( function_exists( 'getUser' ) )
	{
		$id = model::searchKey( 'username', getUser() );
		return model::getKey( $id[0], 'class' );
	}
	else
	{
		return "guest";
	}
}

/*
function allowed ( $service_name )
{
	global $mod;
	if (!is_array($mod[$service_name]))
		return false;
	if (in_array("*",$mod[$service_name]))
		return true;
	if (in_array(auth_get_class(),$mod[$service_name]))
		return true;
	return false;
}
*/

class damas_service
{
	static function init_http()
	{
		global $assetsLCL;
		global $mod;
		#global $hidden_users;
		#global $versions;
		global $authentication;

		include "settings.php";
		if( file_exists( "/etc/damas/settings.php" ) )
		{
			include "/etc/damas/settings.php";
		}
		if( file_exists( $_SERVER['DOCUMENT_ROOT'] . "/.damas/settings.php" )
			&& is_readable( $_SERVER['DOCUMENT_ROOT'] . "/.damas/settings.php" ) )
		{
			include $_SERVER['DOCUMENT_ROOT']."/.damas/settings.php";
		}
		include_once "permissions.php";
		if( file_exists( "/etc/damas/permissions.php" ) )
		{
			include "/etc/damas/permissions.php";
		}
		if( file_exists( $_SERVER['DOCUMENT_ROOT'] . "/.damas/permissions.php" )
			&& is_readable( $_SERVER['DOCUMENT_ROOT'] . "/.damas/permissions.php" ) )
		{
			include_once $_SERVER['DOCUMENT_ROOT'] . "/.damas/permissions.php";
		}
		/*
		if( !file_exists( $_SERVER['DOCUMENT_ROOT'] . "/.damas/settings.php" ) )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "Configuration file .damas/settings.php is missing";
			exit;
		}
		if( !is_readable( $_SERVER['DOCUMENT_ROOT'] . "/.damas/settings.php" ) )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "Configuration file .damas/settings.php is not readable";
			exit;
		}
		include $_SERVER['DOCUMENT_ROOT']."/.damas/settings.php";
		*/

		if( !function_exists("mysql_connect") )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "MySQL is not installed";
			exit;
		}
		if( !@mysql_connect($db_server, $db_username, $db_passwd) )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "mysql_connect error: " . mysql_error();
			exit;
		}
		if( !mysql_select_db($db_name) )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "mysql_select_db error: " . mysql_error();
			exit;
		}

		mysql_query( "SET NAMES 'utf8'" );

		if( $authentication == "Default" )
		{
			include "authentication_node.php";
		}
		if( $authentication == "MySQL" )
		{
			include "authentication_mysql.php";
		}
		if( $authentication == "CAS" )
		{
			include "authCAS/lib.authCAS.php";
		}
		return true;
	}

	/**
	 * accessGranted
	 */
	static function accessGranted()
	{
		global $authentication;
		if( $authentication == "None" )
			return true;
		global $anonymous_access;
		if( $anonymous_access )
			return true;
		#if( checkAuthentication() )
		if( getUser() )
			return true;
		header("HTTP/1.1: 401 Unauthorized"); //ERR_AUTHREQUIRED
		echo "User authentication required";
		exit;
	}

	/**
	 * allowed - test if the command and the user are allowed
	 */
	static function allowed ( $service_name )
	{
		global $mod;
		if( ! is_array( $mod[$service_name] ) )
		{
			header("HTTP/1.1: 403 Forbidden");
			echo "The operation '" . $service_name . "' is not defined";
			exit;
		}
		if( in_array("*", $mod[$service_name] ) )
		{
			return true;
		}
		if( in_array( auth_get_class(), $mod[$service_name] ) )
		{
			return true;
		}
		header("HTTP/1.1: 403 Forbidden");
		echo "The operation is not allowed for the authenticated user";
		exit;
	}

	/**
	 * Log the current call to the web service in an `event` table.
	 * mysql_real_escape_string is important to escape backslashes for utf8
	 * @return {Boolean} true if logged succesfully, false otherwise
	 */
	static function log_event()
	{
		if( mysql_num_rows( mysql_query("SHOW TABLES LIKE 'event'") ) )
		{
			global $_SESSION;
			global $_POST;
			global $_GET;
			$query = sprintf( "INSERT INTO event ( time, arguments ) VALUES ( '%s', '%s' );",
				time(),
				mysql_real_escape_string( json_encode( $_SESSION + $_POST + $_GET ) )
				//mysql_real_escape_string(  stripslashes( json_encode( $_SESSION + $_POST + $_GET ) ) )
				//mysql_real_escape_string( json_encode( stripslashes( $_SESSION + $_POST + $_GET ) ) )
			);
			if( mysql_query( $query ) )
			{
				return true;
			}
		}
		return false;
	}
}
