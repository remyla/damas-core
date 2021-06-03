<?php
/**
 * @fileoverview File retrieving service of DAMAS (damas-software.org)
 * @author Remy Lalanne
 *
 * Copyright 2006-2014 Remy Lalanne
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

include "settings.php";
#include $_SERVER['DOCUMENT_ROOT']."/.damas/settings.php";

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
