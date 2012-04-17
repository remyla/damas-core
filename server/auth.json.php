<?php
/*******************************************************************************
 * Author Remy Lalanne
 * Copyright (c) 2005,2006,2007 Remy Lalanne
 ******************************************************************************/
session_start();
header('Content-type: application/json');

include_once "service1.php"; //error_code()
include_once "App/lib.user.php";
include_once "../php/data_model.php";

$cmd = arg("cmd");
$ret = false;

$init = null;
$init = damas_service::init();

if ( !is_null($init) ) {
	if ($init == "401 User authentification required" && $cmd=="login") {} // GoTo login 
	else {
		header("HTTP/1.1: ".$init);
		echo $init;
		exit;
	}
}

if (!$cmd ) {
	header("HTTP/1.1: 400 Bad Request");
	echo "Bad command";
	exit;
}

switch ($cmd){
	case "login":
		$ret = login( arg("user"), arg("password") );
		if( !$ret ) {
			header("HTTP/1.1: 401 Unautorized, Acces Denied");
			echo "Login Error";
			exit;
			//$err = $ERR_AUTH;
		}
		$_SESSION['user_id'] = getUserId( arg('user') );
		break;
	case "logout":
		$ret = logout();
		if (!$ret) {
			header("HTTP/1.1: 401 Unautorized, Not logged in");
			echo "Logout Error";
			exit;
			//$err = $ERR_LOGOUT;
		}
		break;
	case "checkAuthentication":
		$ret = (int)checkAuthentication();
		if (!$ret) {
			header("HTTP/1.1: 401 User authentification required");
			echo "You need to be authentifiated";
			exit;
			//$err = $ERR_AUTHREQUIRED;
		}
		break;
	case "getUserjson":
		$ret = checkAuthenticationjson();
		break;
	default:
		header('HTTP/1.1: 400 Bad Request');
		echo "Bad command";
		exit;
}

echo json_encode($ret);

?>
