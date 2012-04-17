<?php
/**
 *
 * Voilà le fichier data_model oppérationel pour le json avec
 * de valeurs de retour dans des tableaux, avec embriquations 
 * de tableaux pour les fonctions récursives et les résultats
 * qui comprennent d'autres résultats =)
 *
 **/


include_once "data_model.php";

/*
1 nodes
2 tags
4 params
8 links
*/

$NODE_TAG = 2;
$NODE_PRM = 4;
$NODE_LNK = 8;


class model_json
{
	/**
	 * Retrieve the children of a node
	 * @param {Integer} $id node index
	 * @return {Array} array of children nodes empty array if no child found
	 */
	static function children ( $id )
	{
		$contents = array();
		$children = model::children( $id );
		//if (sizeof( $children ) == 0) return false;
		for( $i = 0; $i < sizeof( $children ); $i++ ) {
			$contents[] = model_json::node( $children[$i], 1, 6 );
		}
		return $contents;
	} // done

	/**
	 * Retrieve the keys of a node and its ancestors
	 * @param {Integer} $id node index
	 * @return {Array} array of keys (name=>value)
	 */
	static function keys ( $id )
	{
		$keys = model::keys($id);

		return $keys;
	} // done

	/**
	 * Retrieve some nodes
	 * @param {String} $ids string of ids, separated by ','
	 * @param {Integer} $depth integer depth of recursion (0 means no limit, 1 for single node)
	 * @param {Integer} $flags integer of needed informations for the nodes
	 * @return {Array} array of nodes or empty array if no node found
	 */
	static function multi ( $ids, $depth, $flags )
	{
		$id_arr = split( ",", $ids );
		$array = array();
		for( $i=0; $i<sizeof($id_arr); $i++ ) {
			$node = model_json::node( $id_arr[$i], $depth, $flags );
			if ($node) $array[] = $node;
		}
		return $array;
	} // done

	/**
	 * Retrieve the graph from a node
	 * @param {Integer} $id node index
	 * @return {Array} array nodes (as "nodes") and links (as "links")
	 */
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
		$array = array();
		for( $i = 0; $i < sizeof( $nodes ); $i++ )
		{
			$array[] = model_json::node( $nodes[$i], 1, 7 );
		}
		$links_json = array();
		while( list( $key, $val ) = each( $links ) )
		{
			$links_json[] = array("link_id"=>$key, 
					"src_id"=>$val[0], 
					"tgt_id"=>$val[1]
					);
		}
		$res["nodes"] = $array;
		$res["links"] = $links_json;
		return $res;
	} // done

	/**
	 * Gets a node and subnodes in array format
	 * @param {Integer} $id node index
	 * @param {Integer} $depth integer depth of recursion (0 means no limit, 1 for single node)
	 * @param {Integer} $flags integer of needed informations for the nodes
	 * @return {Array} array of nodes or empty array if no node found
	 */
	static function node ( $id, $depth = 0, $flags = 15 )
	{
		if( $id === false ) return false;
		if( $id === null ) return false;
		if( $id === "" ) return false;

		$contents = array();
		if( $flags & 2 ) {
			$tags = model_json::tags( $id );
			if ($tags) $contents["tags"] = $tags;
		}
		if( $flags & 4 ) {
			$keys = model_json::keys( $id );
			if ($keys) $contents["keys"] = $keys;
		}
		if( $flags & 8 )
			$contents["links"] = model_json::links( $id );
		if( $flags & 8 )
			$contents["rlinks"] = model_json::rlink( $id );

/* 	depth toujours = 1, code inatteignable
		if( $depth != 1 ){
			$children = model::children( $id );
			if( sizeof($children)>0 )
				for( $i=0; $i<sizeof($children); $i++ )
					$contents .= mysql_get( $children[$i], max( $depth - 1, 0 ) );
		} // */
		return model_json::node_jsontag( $id, $contents );
	} // done

	/**
	 * Gets a node in array format
	 * @param {Integer} $id node index
	 * @param {Array} $contents array of tags and/or keys and/or links 
	 * @return {Array} array of nodes
	 */
	static function node_jsontag ( $id, $contents = false )
	{
		if( $id == 0 ) {
			$res = array ();
			$res["id"] = 0; 
			$res["type"] = "folder"; 
			$res["parent_id"] = ""; 
			$res["childcount"] = node_count_children( $id );
			if( $contents )
				return array_merge($res, $contents);
			return $res;
		}
		$query = "SELECT * FROM node WHERE id=$id;";
		if( !$result = mysql_query( $query ) )
			return false;
		if( !mysql_num_rows( $result ) )
			return false;
		$row = mysql_fetch_array( $result );


		$res = array ("id"=>$id, 
			"type"=>$row["type"], 
			"parent_id"=>$row["parent_id"], 
			"childcount"=>node_count_children( $id ), 
			"rlinks"=>mysqlNode_countRlinks( $id )
		);
		if( $contents )
			return array_merge($res, $contents);
		return $res;
	} // done

	/*
	 * Get the tags id of a node
	 * @param {Integer} $id node id
	 * @return {array} tags 
	 */
	static function tags ( $id )
	{
		$tags = model::tags( $id );

		return $tags;
	} // done

	/*
	 * Get the links id of a node and its ancestors
	 * @param {Integer} $id node id
	 * @return {array} links 
	 */
	static function links ( $id )
	{
		$array = array();

		// PROTOTYPE BEGIN
		$protoname = model::getKey( $id, 'prototype' );
		if( $protoname )
		{
			$proto = model::searchKey( 'id', $protoname );
			$proto = $proto[0];
			if( $proto )
			{
				$array[] = model_json::links( $proto );
			}
		}
		// PROTOTYPE END
	
		$result = model::links($id);

		for ($i = 0; $i < sizeof($result); $i++) {

			$childcount = node_count_children( $id );
			$result[$i]["childcount"] = $childcount;
			$result[$i]["rlinks"] = mysqlNode_countRlinks( $result[$i]["id"] );
			$result[$i]["tags"] = model_json::tags( $result[$i]["id"] );
			$result[$i]["keys"] = model_json::keys( $result[$i]["id"] );
		}

		return array_merge($array, $result);
	} // done

	/*
	 * Get the links id of a node
	 * @param {Integer} $id node id
	 * @return {array} links 
	 */
	static function rlink ( $id )
	{
		$result = model::rlinks($id);

		for ($i = 0; $i < sizeof($result); $i++) {

			$childcount = node_count_children( $id );
			$result[$i]["childcount"] = $childcount;
			$result[$i]["rlinks"] = mysqlNode_countRlinks( $result[$i]["id"] );
			$result[$i]["tags"] = model_json::tags( $result[$i]["id"] );
			$result[$i]["keys"] = model_json::keys( $result[$i]["id"] );
		}

		return $result;
	} // done

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
	return $row["count"];
}

function mysqlNode_countRlinks ( $id )
{
	$query = "SELECT COUNT(src_id) as count FROM link WHERE tgt_id='$id';";
   	$result = mysql_query($query);
   	$row = mysql_fetch_array($result);
	return $row["count"];
}

function xmlnodenav ( $id )
{
	if( $id == 0 ) {
		$txt = '<nav id="0"'.
		' parent="0"'.
		' previous="0"'.
		' next="0"'.
		' childcount="' . $childcount . '"/>';
		return $txt . "\n";
	}

	$query = "SELECT * FROM node WHERE id='$id';";
	if( !$result = mysql_query( $query ) )
		return false;
	if( !mysql_num_rows( $result ) )
		return false;
	$row = mysql_fetch_array( $result );
	$closesiblings = mysql_get_closesiblings( $id );
	$txt = sprintf( '<nav id="%s" parent="%s" previous="%s" next="%s" childcount="%s" ancestors="%s"/>',
		$id,
		$row['parent_id'],
		$closesiblings['previous'],
		$closesiblings['next'],
		node_count_children( $id ),
		implode( model::ancestors( $id ), ',' )
	);
	return $txt . "\n";
}

function mysql_get_closesiblings ( $id )
{
	$str = "";
	$parent_id = model::parent($id);
	$siblings = model::children($parent_id);
	$index = array_search($id, $siblings);
	return array("previous" => $siblings[$index-1], "next" => $siblings[$index+1]);
}

?>
