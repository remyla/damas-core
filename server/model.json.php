<?php

session_start();

header('Content-type: application/json');

include_once "service.php"; //error_code()
include_once "../php/data_model_1.json.php";

$cmd = arg("cmd");
$ret = false;

damas_service::init_http();
damas_service::accessGranted();

if( !$cmd )
{
	header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
	echo "Bad command";
	exit;
}
if( !allowed( "model::" . $cmd ) )
{
	header("HTTP/1.1: 403 Forbidden"); //ERR_PERMISSION
	echo "Permission denied";
	exit;
}

switch( $cmd )
{
	case "createNode":
		if( is_null( arg('id') ) || is_null( arg('type') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$id = model::createNode( arg("id"), arg("type") );
		if( !$id ) {
			//$err = $ERR_NODE_CREATE;
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the creation of node, please change your values";
			exit;
		}
		if( $id )
			$ret = model_json::node( $id, 1, $NODE_TAG | $NODE_PRM );
		else
			$ret = false;
		break;
	case "duplicate":
		if( is_null( arg('id') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$id = model::copyBranch( arg("id"), false );
		if( !$id) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the copy of nodes, please change your values";
			exit;
			//$err = $ERR_NODE_CREATE;
		}
		if( $id )
			$ret = model_json::node( $id, 1, $NODE_TAG | $NODE_PRM );
		else
			$ret = false;
		break;
	case "removeNode":
		if( is_null( arg('id') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::removeNode( arg("id") );
		if( !$ret ) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the deletion of node, please change your values";
			exit;
			//$err = $ERR_NODE_DELETE;
		}
		break;
	case "setKey":
		if( is_null( arg('id') ) || is_null( arg('name') ) || is_null( arg('value') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::setKey( arg("id"), arg("name"), arg("value") );
		if( !$ret ) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "removeKey":
		if( is_null( arg('id') ) || is_null( arg('name') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::removeKey( arg("id"), arg("name") );
		if( !$ret) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "move":
		if( is_null( arg('id') ) || is_null( arg('target') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::move( arg("id"), arg("target") );
		if( !$ret) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the moving of node, please change your values";
			exit;
			//$err = $ERR_NODE_MOVE;
		}
		break;
	case "tag":
		if( is_null( arg('id') ) || is_null( arg('name') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::tag( arg("id"), arg("name") );
		if( !$ret ) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "untag":
		if( is_null( arg('id') ) || is_null( arg('name') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::untag( arg("id"), arg("name") );
		if( !$ret) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "link":
		if( arg('src') == null || arg('tgt') == null ) {
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::link( arg("src"), arg("tgt") );
		if( !$ret) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "unlink":
		if( is_null( arg('id') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::unlink( arg("id") );
		if( !$ret) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "setType":
		if( is_null( arg('id') ) || is_null( arg('type') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::setType( arg("id"), arg("type") );
		if( !$ret) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "setTags":
		if( is_null( arg('id') ) || is_null( arg('tags') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::setTags( arg("id"), arg("tags") );
		if( !$ret ) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;
	case "setKeys":
		if( is_null( arg('id') ) || is_null( arg('old') ) || is_null( arg('new') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::setKeys( arg("id"), arg("old"), arg("new") );
		if( !$ret ) {
			header("HTTP/1.1: 409 Conflict");
			echo "Error during the updating of node, please change your values";
			exit;
			//$err = $ERR_NODE_UPDATE;
		}
		break;

	/**
	 *
	 * json functions
	 * model_json namespace 
	 *
	 */

	case "ancestors":
		if( is_null( arg('id') ) ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model_json::multi( implode( ',', model::ancestors( arg('id') ) ), 1, $NODE_TAG | $NODE_PRM );
		break;
	case "searchKey": // should return array of ids (json array?) // this is done =D
		if( is_null(arg('key')) || arg('value') == null ){
			header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
			echo "Bad command";
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$array = model::searchKey( arg('key'), arg('value') );
		$ret = model_json::multi( implode(',', $array), 1, $NODE_TAG | $NODE_PRM );
		if( !$ret ) {
			header('HTTP/1.1: 404 Not Found');
			exit;
			//$err = $ERR_NODE_ID;
		}
		break;
	case "single":
		if( is_null( arg('id') ) ){
			header('HTTP/1.1: 400 Bad Request');
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model_json::node( arg( "id" ), 1, $NODE_TAG | $NODE_PRM );
		if( !$ret ) {
			header('HTTP/1.1: 404 Not Found');
			exit;
			//$err = $ERR_NODE_ID;
		}
		break;
	case "children":
		if( is_null( arg('id') ) ){
			header('HTTP/1.1: 400 Bad Request');
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model_json::children( arg("id") );
		break;
	case "links":
		if( is_null( arg('id') ) ){
			header('HTTP/1.1: 400 Bad Request');
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model_json::links( arg("id") );
		break;
	case "multi":
		if( is_null( arg('id') ) ){
			header('HTTP/1.1: 400 Bad Request');
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model_json::multi( arg("id"), 1, $NODE_TAG | $NODE_PRM );
		break;
	case "graph":
		if( is_null( arg('id') ) ){
			header('HTTP/1.1: 400 Bad Request');
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model_json::graph( arg("id") );
		if (!$ret) {
			header('HTTP/1.1: 404 Not Found');
			exit;
			//$err = $ERR_NODE_ID;
		}
		break;
	case "export":
		if( is_null( arg('id') ) ){
			header('HTTP/1.1: 400 Bad Request');
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model_json::node( arg('id'), 0, $NODE_TAG | $NODE_PRM);
		if( !$ret ) {
			header('HTTP/1.1: 404 Not Found');
			exit;
			//$err = $ERR_NODE_ID;
		}
		break;
	case "search":
		if( is_null( arg('value') ) ) {
			header('HTTP/1.1: 400 Bad Request');
			exit;
			//$err = $ERR_COMMAND; break;
		}
		$ret = model::search( arg('value') );
		break;
	default:
		header('HTTP/1.1: 400 Bad Request');
		exit;
		//$err = $ERR_COMMAND;
} // switch / case

$nolog = array( 'single', 'children', 'multi', 'stats', 'types', 'tags', 'search' );

if( ! in_array( arg('cmd'), $nolog ) )
	damas_service::log_event();
		
echo json_encode($ret);

?>
