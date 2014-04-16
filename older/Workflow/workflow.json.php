<?php
/**
 * PHP Library : lib.overview.php
 * Author Remy Lalanne
 * Copyright (c) 2008-2011 Remy Lalanne
 */

function workflowByStateTotal()
{
	$array = array();
	$query = "SELECT COUNT(*) AS count, COUNT(DISTINCT IF(key.value='running',NULLIF(teamparam.value,''),NULL)) AS resources, SUM(key.value='stopped') AS stopped, SUM(key.value='done') AS 'done', SUM(key.value='standby') AS 'standby', SUM(key.value='running') AS running, SUM(key.value='ready') AS ready FROM node INNER JOIN `key` ON key.node_id=node.id INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id WHERE key.name='state' AND teamparam.name='team';";
	$result = mysql_query($query);
	$row = mysql_fetch_array($result, MYSQL_ASSOC);
	$array["count"] = (int)$row["count"];
	$array["resources"] = (int)$row["resources"];
	$array["stopped"] = (int)$row["stopped"];
	$array["done"] = (int)$row["done"];
	$array["standby"] = (int)$row["standby"];
	$array["running"] = (int)$row["running"];
	$array["ready"] = (int)$row["ready"];
	return $array;
}

function workflowByState()
{
	$array = array();
	//$query = "SELECT name.value AS name, count(*) AS 'count', SUM(state.value='stopped') AS stopped, SUM(state.value='done') AS 'done', SUM(state.value='standby') AS 'standby', SUM(state.value='running') AS running, SUM(state.value='ready') AS ready, SUM(state.value='not started') AS notstarted FROM node INNER JOIN `key` AS state ON state.node_id=node.id INNER JOIN `key` AS name ON name.node_id=node.id AND name.name='label' WHERE state.name='state' GROUP BY name.value ORDER BY name.value;";
	$query = "SELECT name.value AS name, count(*) AS 'count', SUM(progress.value='stopped') AS stopped, SUM(progress.value='done') AS 'done', SUM(progress.value='standby') AS 'standby', SUM(progress.value='running') AS running, SUM(progress.value='ready') AS ready FROM node INNER JOIN `key` AS progress ON progress.node_id=node.id INNER JOIN `key` AS name ON name.node_id=node.id AND name.name='task' WHERE progress.name='progress' GROUP BY name.value ORDER BY name.value;";
	$result = mysql_query($query);
	$i = 0;
	while( $row = mysql_fetch_array($result, MYSQL_ASSOC) )
	{
		$a = array();
		//$array[$i]["name"] = $row["name"];
		//$array[$i]["count"] = (int)$row["count"];
		$a['name'] = $row["name"];
		$a["count"] = (int)$row["count"];
		$b = array();
		if ($row["stopped"] != "0")
			$b["stopped"] = (int)$row["stopped"];
		if ($row["done"] != "0")
			$b["done"] = (int)$row["done"];
		if ($row["standby"] != "0")
			$b["standby"] = (int)$row["standby"];
		if ($row["running"] != "0")
			$b["running"] = (int)$row["running"];
		if ($row["ready"] != "0")
			$b["ready"] = (int)$row["ready"];
		$a['progress'] = $b;
		$array[ $i ] = $a;
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
	$query = "SELECT teamparam.value AS name, count(*) AS 'count', SUM(stateparam.value='stopped') AS stopped, SUM(stateparam.value='done') AS 'done', SUM(stateparam.value='standby') AS 'standby', SUM(stateparam.value='running') AS running, SUM(stateparam.value='ready') AS ready FROM node INNER JOIN `key` AS name ON name.node_id=node.id INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id INNER JOIN `key` AS stateparam ON stateparam.node_id=node.id WHERE teamparam.name='team' AND name.value='".$name."' AND stateparam.name='state' GROUP BY teamparam.value ORDER BY teamparam.value;";
	$result = mysql_query($query);
	$i = 0;
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$array[$i]["team"] = $row["name"];
		$array[$i]["count"] = (int)$row["count"];
		if ($row["stopped"] != "0")
			$array[$i]["stopped"] = (int)$row["stopped"];
		if ($row["done"] != "0")
			$array[$i]["done"] = (int)$row["done"];
		if ($row["standby"] != "0")
			$array[$i]["standby"] = (int)$row["standby"];
		if ($row["running"] != "0")
			$array[$i]["running"] = (int)$row["running"];
		if ($row["ready"] != "0")
			$array[$i]["ready"] = (int)$row["ready"];
		$i++;
	}
	return $array;
}

?>
