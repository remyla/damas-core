<?php
/**
 * JSON methods for DAMAS software (damas-software.org)
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
	 * Retrieve nodes from a list of indexes
	 * @param {Array} $ids array of indexes
	 * @return {Array} nodes array
	 */
	static function multi ( $ids )
	{
		$nodes = array();
		for( $i = 0; $i < sizeof( $ids ); $i++ )
		{
			$row = mysql_fetch_array( mysql_query( "SELECT type FROM node WHERE id=" . $ids[$i] . ";" ) );
			$nodes[] = array(
				"id" => $ids[$i],
				"type" => $row['type'],
				"tags" => model::tags( $ids[$i] ),
 				// an empty array produces a json list instead of a hash so we force the result to be an object
				"keys" => (object) model::keys( $ids[$i] ),
				"childcount" => model::countChildren( $ids[$i] ),
				"rlinks" => model::countRLinks( $ids[$i] )
			);
		}
		return $nodes;
	}

	/**
	 * Retrieve the graph from a node
	 * @param {Array} $ids nodes indexes
	 * @return {Array} array nodes (as "nodes") and links (as "links")
	 */
	static function graph ( $ids )
	{
		$links = model::links_r( $ids, array() );
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

	static function graph_all ( )
	{

	}

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
		$tags = model::tags( $id );
		if( $tags )
			$contents["tags"] = $tags;
		$keys = model::keys( $id );
		if( $keys )
			$contents["keys"] = $keys;
		if( $flags & 8 )
		{
			$contents["links"] = model_json::links( $id );
			$contents["rlinks"] = model_json::rlink( $id );
		}
		if( $depth != 1 )
		{
			$children = model::children( $id );
			for( $i=0; $i<sizeof($children); $i++ )
				$contents["children"][] = model_json::node( $children[$i], max( $depth - 1, 0 ) );
		}
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
			$res["childcount"] = model::countChildren( $id );
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
			"childcount"=>model::countChildren( $id ), 
			"rlinks"=>model::countRLinks( $id )
		);
		if( $contents )
			return array_merge($res, $contents);
		return $res;
	} // done

	/**
	 * Get the links id of a node and its ancestors
	 * @param {Integer} $id node id
	 * @return {array} links 
	 */
	static function links ( $id )
	{
		$array = array();
	
		$result = model::links($id);

		for ($i = 0; $i < sizeof($result); $i++) {

			$childcount = model::countChildren( $id );
			$result[$i]["childcount"] = $childcount;
			$result[$i]["rlinks"] = model::countRLinks( $result[$i]["id"] );
			$result[$i]["tags"] = model::tags( $result[$i]["id"] );
			$result[$i]["keys"] = model::keys( $result[$i]["id"] );
		}

		return array_merge($array, $result);
	} // done

	/**
	 * Get the links id of a node
	 * @param {Integer} $id node id
	 * @return {array} links 
	 */
	static function rlink ( $id )
	{
		$result = model::rlinks($id);

		for ($i = 0; $i < sizeof($result); $i++) {

			$childcount = model::countChildren( $id );
			$result[$i]["childcount"] = $childcount;
			$result[$i]["rlinks"] = model::countRLinks( $result[$i]["id"] );
			$result[$i]["tags"] = model::tags( $result[$i]["id"] );
			$result[$i]["keys"] = model::keys( $result[$i]["id"] );
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

?>
