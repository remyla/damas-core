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

$init = null;
$init = damas_service::init();
if ( !is_null($init) ) {
	header("HTTP/1.1: ".$init);
	echo $init;
	exit;
}

if (!$cmd ) {
	header("HTTP/1.1: 400 Bad Request");
	echo "Bad command";
	exit;
}

if ( !accessGranted() ) {
	header("HTTP/1.1: 403 Forbidden");
	echo "User authentification required";
	exit;
}

if (!allowed("libtask.".$cmd)) {
	header("HTTP/1.1: 405 Method Not Allowed");
	echo "Permission denied";
	exit;
}

switch ($cmd){
	case "taskAdd":
		if( is_null( arg('id') ) || is_null( arg('name') ) ){
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		$ret = model::createNode( arg("id"), "task" );
		if( $ret )
			model::setKey( $ret, "label", arg("name"));
		if( !$ret ) {
			//$err = $ERR_NODE_CREATE;
			header("HTTP/1.1: 304 Not Modified Error on create");
			echo "Node create failed";
			exit;
		}
		break;
	case "taskTag":
		if( is_null( arg('id') ) || is_null( arg('type') ) ){
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		$ret = model::tag(arg("id"), arg("name"));
		if (!$ret) {
			//$err = $ERR_NODE_UPDATE;
			header("HTTP/1.1: 304 Not Modified Error on update");
			echo "Node update failed";
			exit;
		}
		break;
	case "taskUntag":
		if( is_null( arg('id') ) || is_null( arg('name') ) ){
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		$ret = model::untag(arg("id"), arg("name"));
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			echo "Node update failed";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "taskSet":
		if( is_null( arg('id') ) || is_null( arg('name') ) || is_null( arg('value') ) ){
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		$ret = model::setKey(arg("id"), arg("name"), arg("value"));
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			echo "Node update failed";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "taskSetTeam":
		if( is_null( arg('id') ) || is_null( arg('value') ) ){
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		$ret = taskSetTeam(arg("id"),arg("value"));
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			echo "Node update failed";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "taskSetState":
		if( is_null( arg('id') ) || is_null( arg('value') ) ){
			header("HTTP/1.1: 400 Bad Request");
			echo "Bad command";
			exit;
		}
		$ret = taskSetState(arg("id"),arg("value"));
		if (!$ret) {
			header("HTTP/1.1: 304 Not Modified Error on update");
			echo "Node update failed";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "workflowByStateTotal":
		$ret = workflowByStateTotal();
		if (!$ret) {
			header("HTTP/1.1: 405 Method Not Allowed");
			echo "Permission denied";
			exit;
			//$err = $ERR_PERMISSION;
		}
		break;
	case "workflowByState":
		$ret = workflowByState();
		if (!$ret) {
			header("HTTP/1.1: 405 Method Not Allowed");
			echo "Permission denied";
			exit;
			//$err = $ERR_PERMISSION;
		}
		break;
	case "workflowByTask":
		$ret = workflowByTask(arg("name"));
		if (!$ret) {
			header("HTTP/1.1: 405 Method Not Allowed");
			echo "Permission denied";
			exit;
			//$err = $ERR_PERMISSION;
		}
		break;
	default:
		header("HTTP/1.1: 400 Bad Request");
		echo "Bad command";
		exit;
}

echo json_encode($ret);

?>
