<?php
/*
 * @author Remy Lalanne
 *
 * copyright (c) 2006-2012 damas-software.com | Remy Lalanne
 */

include $_SERVER['DOCUMENT_ROOT']."/.damas/server.php";

$file = false;
if( array_key_exists( "file", $_POST ) )
	$file = $_POST["file"];
if( array_key_exists( "file", $_GET ) )
	$file = $_GET["file"];

header( "content-type: application/octet-stream" );
header( "Content-Disposition: attachment; filename=\"" . basename( $file ) . "\"" );
header( "Expires: Mon, 26 Jul 1997 05:00:00 GMT" );
header( "Cache-Control: no-store, no-cache, must-revalidate" );
header( "Cache-Control: post-check=0, pre-check=0", false );
header( "Pragma: no-cache" );
flush(); 
readfile( $assetsLCL . $file );

?>
