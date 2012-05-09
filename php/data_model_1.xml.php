<?php

include_once "data_model_1.php";

/*
1 nodes
2 tags
4 params
8 links
*/

$NODE_TAG = 2;
$NODE_PRM = 4;
$NODE_LNK = 8;


class model_xml
{
	static function children ( $id, $level )
	{
		$contents = "";
		$children = model::children( $id );
		for( $i = 0; $i < sizeof( $children ); $i++ )
			$contents .= model_xml::node( $children[$i], 1, 6 );
		$contents .= model_xml::deps( $id, $level );
		//$contents .= model_xml::rdeps( $id, $level );
		return $contents;
	}

	// $node_id : integer - id of the node under which parameters are
	// $level  : integer - number of tabs to output before tags
	static function keys ( $id, $level )
	{
		$xml = "";
		$keys = model::keys($id);
		foreach( $keys as $key => $value ) {
			for( $j=0;$j<$level;$j++) $xml .= "\t";
			$xml .= sprintf( '<key name="%s">%s</key>' . "\n",
				htmlspecialchars( $key, ENT_QUOTES ),
				hide_team( htmlspecialchars( $value, ENT_QUOTES ) )
				);
		}
		return $xml;
	}

	static function multi ( $ids, $depth, $flags )
	{
		$id_arr = split( ",", $ids );
		$xml = "";
		for( $i=0; $i<sizeof($id_arr); $i++ )
			$xml .= model_xml::node( $id_arr[$i], $depth, $flags );
		return $xml;
	}

	static function graph ( $id )
	{
		$links = model::links_r( $id, array() );
		$values = array_values( $links );
		$nodes = array();
		for( $i = 0; $i < sizeof( $links ); $i++ )
		{
			$nodes[] = $values[$i][0];
			$nodes[] = $values[$i][1];
		}
		$nodes = array_values( array_unique( $nodes ) );
		for( $i = 0; $i < sizeof( $nodes ); $i++ )
		{
			$xml .= model_xml::node( $nodes[$i], 1, 7 );
		}
		while( list( $key, $val ) = each( $links ) )
		{
			$links_xml .= sprintf('<link link_id="%s" src_id="%s" tgt_id="%s"/>',
				$key,
				$val[0],
				$val[1] );
		}
		return $xml . "\n" . $links_xml;
	}

	/**
	 * Gets a node and subnodes in xml format
	 * id    : integer - node index
	 * depth : integer - depth of recursion (0 means no limit, 1 for single node)
	 * flags : integer
	 * returns false if node not found
	 */
	static function node ( $id, $depth = 0, $flags = 15 )
	{
		if( $id === false ) return false;
		if( $id === null ) return false;
		if( $id === "" ) return false;

		$contents = "";
		if( $flags & 2 )
			$contents .= model_xml::tags( $id, 1 );
		if( $flags & 4 )
			$contents .= model_xml::keys( $id, 1 );
		if( $flags & 8 )
			$contents .= model_xml::deps( $id, 1 );
		if( $flags & 8 )
			$contents .= model_xml::rdeps( $id, 1 );
		if( $depth != 1 ){
			$children = model::children( $id );
			if( sizeof($children)>0 )
				for( $i=0; $i<sizeof($children); $i++ )
					$contents .= mysql_get( $children[$i], max( $depth - 1, 0 ) );
		}
		return model_xml::node_xmltag( $id, "node", $contents );
	}

	static function node_xmltag ( $id, $name = "node", $contents = false )
	{
		if( $id == 0 ) {
			#global $projectName;
			$txt = sprintf( '<%s id="0" type="folder" parent_id="" childcount="%s"',
				$name,
				node_count_children( $id )
			);
			if( $contents )
				return $txt.">\n$contents</$name>\n";
			return $txt."/>\n";
		}
		$query = "SELECT * FROM node WHERE id='$id';";
		if( !$result = mysql_query( $query ) )
			return false;
		if( !mysql_num_rows( $result ) )
			return false;
		$row = mysql_fetch_array( $result );
		$txt = sprintf( '<%s id="%s" type="%s" parent_id="%s" childcount="%s" rlinks="%s"',
			$name,
			$id,
			$row['type'],
			$row['parent_id'],
			node_count_children( $id ),
			mysqlNode_countRlinks( $id )
		);
		if( $contents )
			return $txt . ">\n$contents</$name>\n";
		return $txt . "/>\n";
	}

	static function tags ( $id, $level )
	{
		$query = "SELECT name FROM tag WHERE node_id='$id';";
		$result = mysql_query( $query );
		$xml = "";
		if( mysql_num_rows( $result ) == 0 ) return;
		while( $row = mysql_fetch_array( $result ) ) {
			for( $j=0; $j<$level; $j++ ) $xml .= "\t";
			$xml .= sprintf( "<tag>%s</tag>\n",
				htmlspecialchars( $row['name'], ENT_NOQUOTES ) );
		}
		return $xml;
	}

	static function deps ( $id, $level )
	{
		$xml = "";

		// PROTOTYPE BEGIN
		$protoname = model::getKey( $id, 'prototype' );
		if( $protoname )
		{
			$proto = model::searchKey( 'id', $protoname );
			$proto = $proto[0];
			if( $proto )
			{
				$xml .= model_xml::deps( $proto, $level );
			}
		}
		// PROTOTYPE END
	
		$query = "SELECT link.id AS link_id, link.tgt_id, node.* FROM link LEFT JOIN node ON node.id=link.tgt_id WHERE src_id='$id' ORDER BY type;";
		if( !$result = mysql_query( $query ) ) return false;
		if( !mysql_num_rows( $result ) ) return false;
		while( $row = mysql_fetch_array( $result ) ) {
			for( $j=0; $j<$level+1; $j++ ) $xml .= "\t";
			$childcount = node_count_children( $id );
			$xml .= sprintf('<link link_id="%s" id="%s" type="%s" parent_id="%s" childcount="%s" rlinks="%s">',
				$row['link_id'],
				$row['tgt_id'],
				( $row['tgt_id'] == '0' )? 'folder' : $row['type'],
				$row['parent_id'],
				$childcount,
				mysqlNode_countRlinks( $row['tgt_id'] ) );
			$xml .= model_xml::tags( $row['tgt_id'], 1 );
			$xml .= model_xml::keys( $row['tgt_id'], 1 );
			$xml .= "</link>";
		}
		return $xml . "\n";
	}

	static function rdeps ( $id, $level )
	{
		$query = "SELECT link.id AS link_id, link.src_id, node.* FROM link LEFT JOIN node ON node.id=link.src_id WHERE tgt_id='$id' ORDER BY type;";
		if( !$result = mysql_query( $query ) ) return false;
		if( !mysql_num_rows( $result ) ) return false;
		$xml = "";
		while( $row = mysql_fetch_array( $result ) ) {
			for( $j=0; $j<$level; $j++ ) $xml .= "\t";
			$childcount = node_count_children( $id );
			$xml .= sprintf( '<rlink link_id="%s" id="%s" type="%s" parent_id="%s" childcount="%s">',
				$row['link_id'],
				$row['src_id'],
				( $row['src_id'] == '0' )? 'folder' : $row['type'],
				$row['parent_id'],
				$childcount);
			$xml .= model_xml::tags( $row['tgt_id'],1 );
			$xml .= model_xml::keys( $row['src_id'], 1 );
			$xml .= "</rlink>";
			//$xml .= xmlnodetag($row['id'], "ref", false);
		}
		return $xml . "\n";
	}

}

function hide_team ( $team )
{
	global $hidden_users;
	if (in_array($team,$hidden_users))
		return "***";
	else
		return $team;
}

function node_count_children ( $id )
{
	return mysqlNode_countChildren($id) + node_count_subelements($id);
}

function node_count_subelements ( $id )
{
	$count = 0;
	$query = "SELECT COUNT(node_id) as count FROM tag WHERE node_id='$id';";
   	$result = mysql_query($query);
   	$row = mysql_fetch_array($result);
	$count += $row[0];
	$query = "SELECT COUNT(node_id) as count FROM `key` WHERE node_id='$id';";
   	$result = mysql_query($query);
   	$row = mysql_fetch_array($result);
	$count += $row[0];
	$query = "SELECT COUNT(src_id) as count FROM link WHERE src_id='$id';";
   	$result = mysql_query($query);
   	$row = mysql_fetch_array($result);
	$count += $row[0];
/*
	$query = "SELECT COUNT(tgt_id) as count FROM link WHERE tgt_id='$id';";
   	$result = mysql_query($query);
   	$row = mysql_fetch_array($result);
	$count += $row[0];
*/
	return $count;
}

function mysqlNode_countChildren ( $id )
{
	$query = "SELECT COUNT(id) as count FROM node WHERE parent_id='$id';";
   	$result = mysql_query($query);
   	$row = mysql_fetch_array($result);
	return $row['count'];
}

function mysqlNode_countRlinks ( $id )
{
	$query = "SELECT COUNT(src_id) as count FROM link WHERE tgt_id='$id';";
   	$result = mysql_query($query);
   	$row = mysql_fetch_array($result);
	return $row['count'];
}

?>
