<?php
/**
 * @fileoverview Workflow extension for DAMAS (damas-software.org)
 * @author Remy Lalanne

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

session_start();

include_once "../php/http_service.php"; //error_code()
include_once "Workflow/lib.task.php";
include_once "Workflow/workflow.json.php";
include_once "../php/DAM.php";

damas_service::init_http();
damas_service::accessGranted();

header('Content-type: application/json');
$cmd = arg("cmd");
$ret = false;

if( !$cmd )
{
	header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
	echo "Bad command";
	exit;
}
if( !allowed( "workflow::" . $cmd ) )
{
	header("HTTP/1.1: 403 Forbidden"); //ERR_PERMISSION
	echo "Permission denied";
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
