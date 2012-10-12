<?php
/**
 * @fileoverview Web service methods for DAMAS (damas-software.org)
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
 *
 */

include_once "errors.php";
include_once "permissions.php";
if (file_exists($_SERVER['DOCUMENT_ROOT']."/.damas/permissions.php"))
	include_once $_SERVER['DOCUMENT_ROOT']."/.damas/permissions.php";

$version = "2.2-beta6";

function soaplike_head ( $cmd, $err )
{
	global $error;
	global $version;
	$txt = "";
	$txt .= "\t\t<version>".$version."</version>\n";
	$txt .= "\t\t<cmd>".$cmd."</cmd>\n";
	$txt .= error_code($err, $error[$err]);
	if ($err>0 && function_exists("mysql_error"))
		$txt .= "\t\t<mysql_error>".mysql_error()."</mysql_error>\n";
	$txt .= debug_args();
	return $txt;
}

// Function error_code - gives error code to ajax client
// code : int    - optionnal error code to return (default is 0, success)
// text : string - optionnal text to provide
function error_code ( $code = 0, $text = "" )
{
	return "\t\t".'<error code="'.$code.'">'.$text."</error>\n";
}

// Function arg - get a command argument from POST then GET methods
// name : string - name of the argument
// return value : argument value or false if argument is not found
function arg ( $name )
{
	global $_POST;
	global $_GET;
	if( array_key_exists( $name, $_POST ) )
		return stripslashes( $_POST[$name] );
	if( array_key_exists( $name, $_GET ) )
		return stripslashes( $_GET[$name] );
	return false;
}

function auth_get_class ()
{
	$id = model::searchKey( 'username', getUser() );
	return model::getKey( $id[0], 'class' );
}

function debug_args()
{
	global $_POST;
	global $_GET;
	global $_SESSION;
	$txt = "\t\t<debug>\n";

	$txt .= "\t\t\t<GET";
	foreach ($_GET as $k => $v)
		$txt .= " " . $k.'="'.htmlspecialchars($v).'"';
	$txt .= "/>\n";

	$txt .= "\t\t\t<POST";
	foreach ($_POST as $k => $v)
		$txt .= " " . $k.'="'.htmlspecialchars($v).'"';
	$txt .= "/>\n";

	$txt .= "\t\t\t<COOKIE";
	foreach ($_COOKIE as $k => $v)
		$txt .= " " . htmlspecialchars( $k ) . '="' . htmlspecialchars( $v ) . '"';
	$txt .= "/>\n";

	$txt .= "\t\t\t<SESSION";
	foreach ($_SESSION as $k => $v)
		$txt .= " " . $k.'="'.$v.'"';
	$txt .= "/>\n";

	$txt .= "\t\t</debug>\n";
	return $txt;
}

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

class damas_service
{
	//ERR_SERVER_CONF ERR_MYSQL_SUPPORT ERR_MYSQL_CONNECT ERR_MYSQL_DB
	static function init_http()
	{
		global $assetsLCL;
		#global $hidden_users;
		#global $versions;

		if( !file_exists( $_SERVER['DOCUMENT_ROOT'] . "/.damas/server.php" ) )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "Configuration file .damas/server.php is missing";
			exit;
		}
		if( !is_readable( $_SERVER['DOCUMENT_ROOT'] . "/.damas/server.php" ) )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "Configuration file .damas/server.php is not readable";
			exit;
		}
		include $_SERVER['DOCUMENT_ROOT']."/.damas/server.php";

		if( !function_exists("mysql_connect") )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "MySQL is not supported";
			exit;
		}
		if( !@mysql_connect($db_server, $db_username, $db_passwd) )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "MySQL connect returned error";
			exit;
		}
		if( !mysql_select_db($db_name) )
		{
			header("HTTP/1.1: 500 Internal Server Error");
			echo "MySQL database select error";
			exit;
		}

		mysql_query( "SET NAMES 'utf8'" );
		#include "installer/mysql_prepare.php";
		#echo "Main Database must be created!";

		if( $authentication == "Default" )
		{
			include "authentication_dev.php";
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
		global $anonymous_access;
		if( $anonymous_access )
			return true;
		if( checkAuthentication() )
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
			header("HTTP/1.1: 403 Forbidden"); //ERR_PERMISSION
			echo "Permission denied";
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
		header("HTTP/1.1: 403 Forbidden"); //ERR_PERMISSION
		echo "Permission denied";
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
