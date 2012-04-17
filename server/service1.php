<?php
/**
 * PHP Library : lib.ajaxserver.php
 * functions to handle common ajax tasks, server side
 * Author Remy Lalanne
 * Copyright (c) 2007 Remy Lalanne
 */
include_once "errors.php";
include_once "permissions.php";
if (file_exists($_SERVER['DOCUMENT_ROOT']."/.damas/permissions.php"))
	include_once $_SERVER['DOCUMENT_ROOT']."/.damas/permissions.php";

$version = "2.2-beta6";
/*
function soaplike_response ( $cmd, $err, $out )
{
	global $error;
	$txt = '<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope">'."\n";
	$txt .= "\t<env:Header>\n";
	$txt .= "\t\t<cmd>".$cmd."</cmd>\n";
	$txt .= error_code($err, $error[$err]);
	if ($err>0 && function_exists("mysql_error"))
		$txt .= "\t\t<mysql_error>".mysql_error()."</mysql_error>\n";
	$txt .= debug_args();
	$txt .= "\t</env:Header>\n";
	$txt .= "\t<env:Body>\n";
	$txt .= $out;
	$txt .= "\t</env:Body>\n";
	$txt .= "</env:Envelope>\n";
	return $txt;
}
*/

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
	return null;
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

// Function: accessGranted
// return true if anonymous access if allowed or if authenticated
// return false if authentication is needed
function accessGranted()
{
	global $anonymous_access;
	if ($anonymous_access)
		return true;
	if (checkAuthentication())
		return true;
	return false;
}

class damas_service
{
	static function init()
	{

		# config options
		global $projectName;
		global $db_server;
		global $anonymous_access;
		global $hidden_users;
		global $assetsLCL;
		#global $versions;
		#global $db_username;
		#global $db_passwd;
		#global $db_name;

		if( !file_exists( $_SERVER['DOCUMENT_ROOT'] . "/.damas/server.php" ) )
			return "500 Configuration file is invalid";
		if( !is_readable( $_SERVER['DOCUMENT_ROOT'] . "/.damas/server.php" ) )
			return "500 Configuration file is invalid";
		include $_SERVER['DOCUMENT_ROOT']."/.damas/server.php";

		if( !function_exists("mysql_connect") )
			return "503 MySQL support is missing";
		if( !@mysql_connect($db_server, $db_username, $db_passwd) )
			return "503 MySQL connect returned error";
		if( !mysql_select_db($db_name) )
			return "503 MySQL database select error";

		mysql_query( "SET NAMES 'utf8'" );

		#include "installer/mysql_prepare.php";
		#echo "Main Database must be created!";

		if( $authentication == "Default" )
		{
			include "userAuth/authDefault.php";
		}
		if( $authentication == "MySQL" )
		{
			include "userAuth/authMySQL.php";
		}
		if( $authentication == "CAS" )
		{
			include "authCAS/lib.authCAS.php";
		}
		if( !accessGranted() ) 
		{
			return "401 User authentification required";
		}
		return null;
	}

	/**
	 * Log the current call to the web service in an `event` table.
	 * mysql_real_escape_string is important to escape backslashes for utf8
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
