<?php
/**
 * @author Remy Lalanne
 * Copyright (c) 2005-2012 Remy Lalanne
 */
session_start();

include_once "service.php";
include_once "App/lib.user.php";
include_once "../php/data_model_1.php";

//$err = damas_service::init();
damas_service::init_http();

if( arg('cmd') != 'login' )
{
	damas_service::accessGranted();
}

switch( arg("cmd") )
{
	case "login":
		if( !login( arg("user"), arg("password") ) )
		{
   			header("HTTP/1.1: 401 Unauthorized"); //ERR_AUTHREQUIRED
   			echo "Incorrect username and password";
   			exit;
		}
		else
		{
			$_SESSION['user_id'] = getUserId( arg('user') );
		}
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
		echo json_encode( true );
		exit;
/*
	case "checkAuthentication":
		$ret = (int)checkAuthentication();
		if (!$ret)
		{
   			header("HTTP/1.1: 401 Unauthorized"); //ERR_AUTHREQUIRED
   			echo "User authentication required";
   			exit;
			$err = $ERR_AUTHREQUIRED;
		}
		break;
*/
	case "getUser":
		if( ! array_key_exists( "login", $_SESSION ) )
		{
   			header( "HTTP/1.1: 401 Unauthorized" );
   			echo "User not authenticated";
   			exit;
		}
		$array = array(
			"username" => $_SESSION['login'],
			"userclass" => auth_get_class(),
			"user_id" => (int)$_SESSION['user_id']
		);
		header('Content-type: application/json');
		echo json_encode( $array );
		break;
	default:
		header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
		echo "Bad command";
		exit;
}
?>
