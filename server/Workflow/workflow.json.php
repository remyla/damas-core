<?php
/**
 * PHP Library : lib.overview.php
 * Author Remy Lalanne
 * Copyright (c) 2008-2011 Remy Lalanne
 */

function workflowByStateTotal()
{
	$array = array();
	$query = "SELECT COUNT(*) AS count, COUNT(DISTINCT IF(key.value='in progress',NULLIF(teamparam.value,''),NULL)) AS resources, SUM(key.value='aborted') AS aborted, SUM(key.value='completed') AS 'completed', SUM(key.value='standby') AS 'standby', SUM(key.value='in progress') AS inprogress, SUM(key.value='ready') AS ready, SUM(key.value='not started') AS notstarted FROM node INNER JOIN `key` ON key.node_id=node.id INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id WHERE key.name='state' AND teamparam.name='team';";
	$result = mysql_query($query);
	$row = mysql_fetch_array($result, MYSQL_ASSOC);
	$array["count"] = (int)$row["count"];
	$array["resources"] = (int)$row["resources"];
	$array["aborted"] = (int)$row["aborted"];
	$array["completed"] = (int)$row["completed"];
	$array["standby"] = (int)$row["standby"];
	$array["inprogress"] = (int)$row["inprogress"];
	$array["ready"] = (int)$row["ready"];
	$array["notstarted"] = (int)$row["notstarted"];
	return $array;
}

function workflowByState()
{
	$array = array();
	$query = "SELECT name.value AS name, count(*) AS 'count', SUM(state.value='aborted') AS aborted, SUM(state.value='completed') AS 'completed', SUM(state.value='standby') AS 'standby', SUM(state.value='in progress') AS inprogress, SUM(state.value='ready') AS ready, SUM(state.value='not started') AS notstarted FROM node INNER JOIN `key` AS state ON state.node_id=node.id INNER JOIN `key` AS name ON name.node_id=node.id AND name.name='label' WHERE state.name='state' GROUP BY name.value ORDER BY name.value;";
	$result = mysql_query($query);
	$i = 0;
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$array[$i]["name"] = $row["name"];
		$array[$i]["count"] = (int)$row["count"];
		if ($row["aborted"] != "0")
			$array[$i]["aborted"] = (int)$row["aborted"];
		if ($row["completed"] != "0")
			$array[$i]["completed"] = (int)$row["completed"];
		if ($row["standby"] != "0")
			$array[$i]["standby"] = (int)$row["standby"];
		if ($row["inprogress"] != "0")
			$array[$i]["inprogress"] = (int)$row["inprogress"];
		if ($row["ready"] != "0")
			$array[$i]["ready"] = (int)$row["ready"];
		if ($row["notstarted"] != "0")
			$array[$i]["notstarted"] = (int)$row["notstarted"];
		$i++;
	}
	return $array;
}

/**
 *  Returns the list of resources for a task, with counts for each work state
 */
function workflowByTask( $name )
{
	$array = array();
	$query = "SELECT teamparam.value AS name, count(*) AS 'count', SUM(stateparam.value='aborted') AS aborted, SUM(stateparam.value='completed') AS 'completed', SUM(stateparam.value='standby') AS 'standby', SUM(stateparam.value='in progress') AS inprogress, SUM(stateparam.value='ready') AS ready, SUM(stateparam.value='not started') AS notstarted FROM node INNER JOIN `key` AS name ON name.node_id=node.id INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id INNER JOIN `key` AS stateparam ON stateparam.node_id=node.id WHERE teamparam.name='team' AND name.value='".$name."' AND stateparam.name='state' GROUP BY teamparam.value ORDER BY teamparam.value;";
	$result = mysql_query($query);
	$i = 0;
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$array[$i]["team"] = $row["name"];
		$array[$i]["count"] = (int)$row["count"];
		if ($row["aborted"] != "0")
			$array[$i]["aborted"] = (int)$row["aborted"];
		if ($row["completed"] != "0")
			$array[$i]["completed"] = (int)$row["completed"];
		if ($row["standby"] != "0")
			$array[$i]["standby"] = (int)$row["standby"];
		if ($row["inprogress"] != "0")
			$array[$i]["inprogress"] = (int)$row["inprogress"];
		if ($row["ready"] != "0")
			$array[$i]["ready"] = (int)$row["ready"];
		if ($row["notstarted"] != "0")
			$array[$i]["notstarted"] = (int)$row["notstarted"];
		$i++;
	}
	return $array;
}

?>
