<?php
/**
 * @fileoverview Web service methods for DAMAS (damas-software.org)
 * @author Remy Lalanne
 *
 * Copyright 2005-2014 Remy Lalanne
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

include_once "errors.php";
include_once "../php/http_service.php";

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
