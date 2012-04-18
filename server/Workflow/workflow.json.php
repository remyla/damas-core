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
	$row = mysql_fetch_array($result, MYSQL_ASSOC));
	$array["count"] = $row["count"];
	$array["resources"] = $row["resources"];
	$array["aborted"] = $row["aborted"];
	$array["completed"] = $row["completed"];
	$array["standby"] = $row["standby"];
	$array["inprogress"] = $row["inprogress"];
	$array["ready"] = $row["ready"];
	$array["notstarted"] = $row["notstarted"];
	return $array;
}

function workflowByState()
{
	$array = array();
	$query = "SELECT name.value AS name, count(*) AS 'count', SUM(state.value='aborted') AS aborted, SUM(state.value='completed') AS 'completed', SUM(state.value='standby') AS 'standby', SUM(state.value='in progress') AS inprogress, SUM(state.value='ready') AS ready, SUM(state.value='not started') AS notstarted FROM node INNER JOIN `key` AS state ON state.node_id=node.id INNER JOIN `key` AS name ON name.node_id=node.id AND name.name='label' WHERE state.name='state' GROUP BY name.value ORDER BY name.value;";
	$result = mysql_query($query);
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$txt .= '<task ';
		//array_shift($row);
		foreach ( $row as $key => $value ){
			$txt .= ' '.$key.'="'.$value.'"';
		}
		$txt .= '/>'."\n";
	}
	return $txt;
}

function workflowByResource()
{
	$txt = '';
	$query = "SELECT node.name, GROUP_CONCAT(DISTINCT IF(state.value='in progress',NULLIF(team.value,''),NULL) ORDER BY team.value SEPARATOR ',') AS resources FROM node, `key` AS state, `key` AS team WHERE node.type='task' AND state.name='state' AND node.id=state.node_id AND node.id=team.node_id AND team.name='team' GROUP BY node.name";
	$result = mysql_query($query);
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$txt .= '<task ';
		foreach ( $row as $key => $value ){
			$txt .= ' '.$key.'="'.$value.'"';
		}
		$txt .= '/>'."\n";
	}
	return $txt;
}

/**
 *  Returns the list of resources for a task, with counts for each work state
 */
function workflowByTask( $name )
{
	$txt = '';
	#$query = "SELECT teamparam.value AS name, count(*) AS 'count', SUM(stateparam.value='aborted') AS aborted, SUM(stateparam.value='completed') AS 'completed', SUM(stateparam.value='standby') AS 'standby', SUM(stateparam.value='in progress') AS inprogress, SUM(stateparam.value='ready') AS ready, SUM(stateparam.value='not started') AS notstarted FROM node INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id INNER JOIN `key` AS stateparam ON stateparam.node_id=node.id WHERE teamparam.name='team' AND node.name='".$name."' AND stateparam.name='state' GROUP BY teamparam.value ORDER BY teamparam.value;";
	# NEW
	$query = "SELECT teamparam.value AS name, count(*) AS 'count', SUM(stateparam.value='aborted') AS aborted, SUM(stateparam.value='completed') AS 'completed', SUM(stateparam.value='standby') AS 'standby', SUM(stateparam.value='in progress') AS inprogress, SUM(stateparam.value='ready') AS ready, SUM(stateparam.value='not started') AS notstarted FROM node INNER JOIN `key` AS name ON name.node_id=node.id INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id INNER JOIN `key` AS stateparam ON stateparam.node_id=node.id WHERE teamparam.name='team' AND name.value='".$name."' AND stateparam.name='state' GROUP BY teamparam.value ORDER BY teamparam.value;";
	$result = mysql_query($query);
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$txt .= '<resource ';
		foreach ( $row as $key => $value ){
			$txt .= ' '.$key.'="'.$value.'"';
		}
		$txt .= '/>'."\n";
	}
	return $txt;
}

function workflowByType( $name )
{
	$txt = '';
	$query = "SELECT * FROM node WHERE type='$name'";
	$result = mysql_query($query);
	while ($row = mysql_fetch_array($result)){
		#$query2 = "SELECT * FROM node WHERE id='".$row['id']."';";
		#$result2 = mysql_query($query2);
		#$row2 = mysql_fetch_array($result2);
		$txt .= mysql_get($row['id']);
		#$txt .= sprintf ('<node name="%s">',
			#$row['name']
		#);
		#$txt .= "\n";
		#$txt .= '</node>'."\n";
	}
	return $txt;
}

?>
