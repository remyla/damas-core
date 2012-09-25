<?php
/**
 * PHP Library : lib.overview.php
 * Author Remy Lalanne
 * Copyright (c) 2008-2011 Remy Lalanne
 */

function workflowByStateTotal()
{
	$txt = '';
	$query = "SELECT COUNT(*) AS count, COUNT(DISTINCT IF(key.value='running',NULLIF(teamparam.value,''),NULL)) AS resources, SUM(key.value='aborted') AS aborted, SUM(key.value='done') AS 'done', SUM(key.value='standby') AS 'standby', SUM(key.value='running') AS running, SUM(key.value='ready') AS ready, SUM(key.value='not started') AS notstarted FROM node INNER JOIN `key` ON key.node_id=node.id INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id WHERE key.name='state' AND teamparam.name='team';";
	#$query = "SELECT COUNT(*) AS count, GROUP_CONCAT(DISTINCT IF(key.value='running',NULLIF(teamparam.value,''),NULL) SEPARATOR ',') AS resources, SUM(key.value='done') AS 'done', SUM(key.value='running') AS running, SUM(key.value='standby') AS 'standby', SUM(key.value='ready') AS ready, SUM(key.value='not started') AS notstarted, SUM(key.value='aborted') AS aborted FROM node INNER JOIN `key` ON key.node_id=node.id INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id WHERE key.name='state' AND teamparam.name='team';";
	#$query = "SELECT COUNT(*) AS count, SUM(key.value='done') AS 'done', SUM(key.value='running') AS running, SUM(key.value='standby') AS 'standby', SUM(key.value='ready') AS ready, SUM(key.value='not started') AS notstarted, SUM(key.value='aborted') AS aborted FROM node INNER JOIN `key` ON key.node_id=node.id WHERE key.name='state';";
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

function workflowByState()
{
	$txt = '';
	#$query = "SELECT node.name, count(*) AS 'count', SUM(key.value='aborted') AS aborted, SUM(key.value='done') AS 'done', SUM(key.value='standby') AS 'standby', SUM(key.value='running') AS running, SUM(key.value='ready') AS ready, SUM(key.value='not started') AS notstarted FROM node INNER JOIN `key` ON key.node_id=node.id WHERE key.name='state' GROUP BY node.name ORDER BY node.name;";
	$query = "SELECT name.value AS name, count(*) AS 'count', SUM(state.value='aborted') AS aborted, SUM(state.value='done') AS 'done', SUM(state.value='standby') AS 'standby', SUM(state.value='running') AS running, SUM(state.value='ready') AS ready, SUM(state.value='not started') AS notstarted FROM node INNER JOIN `key` AS state ON state.node_id=node.id INNER JOIN `key` AS name ON name.node_id=node.id AND name.name='label' WHERE state.name='state' GROUP BY name.value ORDER BY name.value;";
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
	$query = "SELECT node.name, GROUP_CONCAT(DISTINCT IF(state.value='running',NULLIF(team.value,''),NULL) ORDER BY team.value SEPARATOR ',') AS resources FROM node, `key` AS state, `key` AS team WHERE node.type='task' AND state.name='state' AND node.id=state.node_id AND node.id=team.node_id AND team.name='team' GROUP BY node.name";
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
	#$query = "SELECT teamparam.value AS name, count(*) AS 'count', SUM(stateparam.value='aborted') AS aborted, SUM(stateparam.value='done') AS 'done', SUM(stateparam.value='standby') AS 'standby', SUM(stateparam.value='running') AS running, SUM(stateparam.value='ready') AS ready, SUM(stateparam.value='not started') AS notstarted FROM node INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id INNER JOIN `key` AS stateparam ON stateparam.node_id=node.id WHERE teamparam.name='team' AND node.name='".$name."' AND stateparam.name='state' GROUP BY teamparam.value ORDER BY teamparam.value;";
	# NEW
	$query = "SELECT teamparam.value AS name, count(*) AS 'count', SUM(stateparam.value='aborted') AS aborted, SUM(stateparam.value='done') AS 'done', SUM(stateparam.value='standby') AS 'standby', SUM(stateparam.value='running') AS running, SUM(stateparam.value='ready') AS ready, SUM(stateparam.value='not started') AS notstarted FROM node INNER JOIN `key` AS name ON name.node_id=node.id INNER JOIN `key` AS teamparam ON teamparam.node_id=node.id INNER JOIN `key` AS stateparam ON stateparam.node_id=node.id WHERE teamparam.name='team' AND name.value='".$name."' AND stateparam.name='state' GROUP BY teamparam.value ORDER BY teamparam.value;";
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
