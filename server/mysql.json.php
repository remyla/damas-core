<?php
/**
 * JSON web service of DAMAS software (damas-software.org)
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
session_start();

include_once "../php/http_service.php";

damas_service::init_http();
damas_service::accessGranted();

$query = arg("query");
$result = false;

$query = stripslashes($query);


if (!$query) {
	header("HTTP/1.1: 400 Bad Request"); //ERR_COMMAND
	echo "Bad command";
	exit;
}

# Forbidden SQL manipulation keywords
# ALTER CREATE DROP RENAME
# CALL DELETE DO HANDLER INSERT LOAD REPLACE TRUNCATE UPDATE

$querystr = str_replace("&","&amp;",$query);
$querystr = str_replace("<","&lt;",$querystr);
$querystr = str_replace(">","&gt;",$querystr);

$result = mysql_query($query);

if (!$result) {
	header('HTTP/1.1: 500');
	echo "MySQL query returned error";
	exit;
}

header('Content-type: application/json');
if ($result === true){
	echo json_encode(true);
}

else { // SELECT QUERY
	$res = array();
	$j = 0;
	while ($row = mysql_fetch_array($result)) {
		for ($i=0; $i<mysql_num_fields($result); $i++){
			$res[$j][mysql_field_name($result,$i)] = htmlspecialchars( $row[$i], ENT_QUOTES );
		}
		++$j;
	}
	echo json_encode($res);
}

?>

