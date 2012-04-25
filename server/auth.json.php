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

if ( !damas_service::initServerDoc() ) {
	header("HTTP/1.1: 500 Configuration file is invalid");
	exit;
}
if ( !damas_service::initMysql() ) {
	header("HTTP/1.1: 503 MySQL error");
	exit;
}

if ( !accessGranted() && $cmd != "login") {
	header("HTTP/1.1: 401 User authentification required");
	exit;
}

if (!$cmd ) {
	header("HTTP/1.1: 400 Bad Request");
	exit;
}

switch ($cmd){
	case "login":
		$ret = login( arg("user"), arg("password") );
		if( !$ret ) {
			header("HTTP/1.1: 401 Unautorized, Acces Denied");
			exit;
			//$err = $ERR_AUTH;
		}
		$_SESSION['user_id'] = getUserId( arg('user') );
		break;
	case "logout":
		$ret = logout();
		if (!$ret) {
			header("HTTP/1.1: 401 Unautorized, Not logged in");
			exit;
			//$err = $ERR_LOGOUT;
		}
		break;
	case "checkAuthentication":
		$ret = (int)checkAuthentication();
		if (!$ret) {
			header("HTTP/1.1: 401 User authentification required");
			exit;
			//$err = $ERR_AUTHREQUIRED;
		}
		break;
	case "getUserjson":
		$ret = checkAuthenticationjson();
		break;
	default:
		header('HTTP/1.1: 400 Bad Request');
		exit;
}

echo json_encode($ret);

?>
