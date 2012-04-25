<?php
/**
 * Author Remy Lalanne
 * Copyright (c) 2005-2010 Remy Lalanne
 */
session_start();
header('Content-type: application/json');

include_once "service1.php"; //error_code()
include_once "App/lib.user.php";
include_once "Workflow/lib.task.php";
include_once "Workflow/workflow.json.php";
include_once "../php/DAM.php";

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

if (!$cmd ) {
	header("HTTP/1.1: 400 Bad Request");
	exit;
}

if ( !accessGranted() ) {
	header("HTTP/1.1: 403 Forbidden");
	exit;
}

if (!allowed("libtask.".$cmd)) {
	header("HTTP/1.1: 405 Method Not Allowed");
	exit;
}

switch ($cmd){
	case "taskAdd":
		if( is_null( arg('id') ) || is_null( arg('name') ) ){
			header("HTTP/1.1: 400 Bad Request");
			exit;
		}
		$ret = model::createNode( arg("id"), "task" );
		if( $ret )
			model::setKey( $ret, "label", arg("name"));
		if( !$ret ) {
			//$err = $ERR_NODE_CREATE;
			header("HTTP/1.1: 304 Not Modified Error on create");
			exit;
		}
		break;
	case "taskTag":
		if( is_null( arg('id') ) || is_null( arg('type') ) ){
			header("HTTP/1.1: 400 Bad Request");
			exit;
		}
		$ret = model::tag(arg("id"), arg("name"));
		if (!$ret) {
			//$err = $ERR_NODE_UPDATE;
			header("HTTP/1.1: 304 Not Modified Error on update");
			exit;
		}
		break;
	case "taskUntag":
		if( is_null( arg('id') ) || is_null( arg('name') ) ){
			header("HTTP/1.1: 400 Bad Request");
			exit;
		}
		$ret = model::untag(arg("id"), arg("name"));
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "taskSet":
		if( is_null( arg('id') ) || is_null( arg('name') ) || is_null( arg('value') ) ){
			header("HTTP/1.1: 400 Bad Request");
			exit;
		}
		$ret = model::setKey(arg("id"), arg("name"), arg("value"));
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "taskSetTeam":
		if( is_null( arg('id') ) || is_null( arg('value') ) ){
			header("HTTP/1.1: 400 Bad Request");
			exit;
		}
		$ret = taskSetTeam(arg("id"),arg("value"));
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "taskSetState":
		if( is_null( arg('id') ) || is_null( arg('value') ) ){
			header("HTTP/1.1: 400 Bad Request");
			exit;
		}
		$ret = taskSetState(arg("id"),arg("value"));
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "workflowByStateTotal":
		$ret = workflowByStateTotal();
		if (!$ret) {
			header("HTTP/1.1: 405 Method Not Allowed");
			exit;
			//$err = $ERR_PERMISSION;
		}
		break;
	case "workflowByState":
		$ret = workflowByState();
		if (!$ret) {
			header("HTTP/1.1: 405 Method Not Allowed");
			exit;
			//$err = $ERR_PERMISSION;
		}
		break;
	case "workflowByTask":
		$ret = workflowByTask(arg("name"));
		if (!$ret) {
			header("HTTP/1.1: 405 Method Not Allowed");
			exit;
			//$err = $ERR_PERMISSION;
		}
		break;
	default:
		header("HTTP/1.1: 400 Bad Request");
		exit;
}

echo json_encode($ret);

?>
