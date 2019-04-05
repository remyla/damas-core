<?php
/**
 * Data Model for DAMAS software (damas-software.org)
 *
 * Simple library written in PHP to handle a key=value data model on top of
 * MySQL, supporting :
 * - Functions for scrud access (create, read, update, delete, search)
 * - Text key and value pairs on nodes (keys, setKey, getKey, removeKey,
 *    searchKey, setKeys)
 * - Rooted tree management functions (ancestors, children, copyBranch, copyNode, move)
 * - Simple directed acyclic graph (DAG) functions (link, unlink, links_r, links, links2)
 * - Tagging (hastag, setTags, tag, untag)
 * - Element inheritance (prototype based) - beta
 *
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

class model
{
	/**
 	 * Creates a node providing its internal type value. Doesn't check parent node existence.
	 * @param {String} $type text type for the new node
 	 * @returns {Integer} the new node id on success, false otherwise
 	 */
	static function create ( $keys )
	{
		$query = "INSERT INTO node ( ) VALUES ( );";
		if( $result = mysql_query($query)){
			$id = mysql_insert_id();
			model::update( $id, $keys );
			return $id;
		}
		return $result;
	}

	/**
	 * Update the keys of a node. Specified keys overwrite existing keys, others are left untouched.
	 * A null key value removes the key.
	 * @param {Integer} $id node index
	 * @param {Array} $keys keys Array of key/value pairs to update (usually comming from json_decode)
 	 * @return {Boolean} true on success, false otherwise
	 */
	static function update ( $id, $keys )
	{
		foreach( $keys as $k=>$v )
		{
			if( $v === null)
				model::removeKey( $id, $k );
			else
				model::setKey( $id, $k, $v );
		}
		return true;
	}

	/**
 	 * Recursively delete a node - WARNING: this function doesn't check anything before removal
 	 * @return {Boolean} true on success, false otherwise
 	 */
	static function delete ( $id )
	{
		$children = model::children($id);
		$res = false;
		for( $i=0;$i<sizeof($children);$i++)
			$res = model::delete($children[$i]);
		$query = "DELETE FROM node WHERE id='$id';";
		$result = mysql_query($query);
		if( mysql_affected_rows() == 0)
			return false;
		$query = "DELETE FROM link WHERE src_id='$id';";
		mysql_query($query);
		$query = "DELETE FROM link WHERE tgt_id='$id';";
		mysql_query($query);
		$query = "DELETE FROM `key` WHERE node_id='$id';";
		mysql_query($query);
		$query = "DELETE FROM tag WHERE node_id='$id';";
		mysql_query($query);
		return true;
	}

	/**
	 * Find nodes wearing the specified key(s)
	 * @param {Array} keys Array of key/term pairs to match
	 * @param {String} sortby key to use to sort the result
	 * @param {String} order Sort result as ASC or DESC
	 * @param {String} limit Limit and offset for result (MySQL Syntax)
	 * @returns {Array} array of matching node indexes
	 */
	static function search ( $keys, $sortby = 'label', $order = 'DESC', $limit = null )
	{
		if( $keys === null )
		{
			return array();
		}
		$query = sprintf("SELECT DISTINCT k1.node_id FROM `key` AS k1 LEFT JOIN `key` AS k2 ON k1.node_id=k2.node_id AND k2.name='%s' WHERE 1",
			mysql_real_escape_string($sortby)
		);
		foreach( $keys as $k=>$v )
		{
			if($v == 'IS NULL' || $v == "='undefined'" )
			{
				$query .= sprintf( " AND k1.node_id NOT IN ( SELECT node_id FROM `key` WHERE name='%s' AND value IS NOT NULL )",
					mysql_real_escape_string($k)
				);
				continue;
			}
			if( $k != '*')
			{
				$query .= sprintf( " AND k1.node_id IN ( SELECT node_id FROM `key` WHERE name='%s' AND value %s )",
					mysql_real_escape_string($k),
					$v
					//mysqli_real_escape_string($v)
				);
			}
			else
			{
				$query .= sprintf( " AND k1.node_id IN ( SELECT node_id FROM `key` WHERE value %s )",
					$v
					//mysql_real_escape_string($v)
				);
			}
		}
		$query .= sprintf(" ORDER BY k2.value %s",
			mysql_real_escape_string($order)
		);
		if( $limit )
		{
			$query .= sprintf(" LIMIT %s;",
				mysql_real_escape_string($limit)
			);
		}
		$query .= ";";
		//echo $query;
		$result = mysql_query( $query );
		$matches = array();
		while( $row = mysql_fetch_array( $result ) )
		{
			$matches[] = intval( $row['node_id'] );
		}
		return $matches;
	}

	/**
 	 * Copy a node - not recursive
	 * @param {Integer} $id node index
	 * @param {Integer} $tgt parent index for new node or false for same location
 	 * @return {Boolean} true on success, false otherwise
 	 */
	static function copy ( $id )
	{
		// copy node
		$newid = model::create( model::keys($id) );
		if( !$newid ) return false;
		// copy tags
		$query = "SELECT name FROM tag WHERE node_id='$id';";
		$result = mysql_query($query);
		while ($row = mysql_fetch_array($result)){
			model::tag($newid, $row["name"]);
		}
		return $newid;
	}

	/**
	 * Test if the specified node has the specified tag 
	 * @param {Integer} $id node index
	 * @param {String} $name tag name
	 * @return {Boolean} true if tag is present, false otherwise
	 */
	static function hastag ( $id, $name )
	{
		$query = sprintf("SELECT node_id FROM tag WHERE node_id='%s' AND name='%s';",
			$id,
			mysql_real_escape_string($name)
		);
		$res = mysql_query($query);
		if( $res)
			return mysql_affected_rows() == 1;
		return false;
	}

	/**
	 * Get keys on a node
	 * @param {Integer} $id node id of keys
	 * @return {Array} array of key=value pairs
	 */
	static function keys ( $id )
	{
		$res = array();
		// PROTOTYPE BEGIN
		$query = "SELECT * FROM `key` WHERE node_id='$id' AND name='prototype';";
		$result = mysql_query($query);
		$row = mysql_fetch_array($result);
		if( $row )
		{
			$proto = model::searchKey( 'id', $row["value"] );
			//$proto = model::search( [ 'id' => $row["value"] ] );
			$proto = $proto[0];
			if( $proto )
			{
				$res = model::keys( $proto );
				unset( $res["id"] );
			}
		}
		// PROTOTYPE END
		$query = "SELECT * FROM `key` WHERE node_id='$id' ORDER BY name;";
		$result = mysql_query($query);
		while ($row = mysql_fetch_array($result)){
			//htmlspecialchars($row['value'],ENT_QUOTES);
			$res[$row["name"]] = $row["value"];
		}
		return $res;
	}

	/**
	 * Get the tags id of a node
	 * @param {Integer} $id node id
	 * @return {array} tags 
	 */
	static function tags ( $id )
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
				$array = model::tags( $proto );
			}
		}
		// PROTOTYPE END

		$query = "SELECT name FROM tag WHERE node_id='$id';";
		$result = mysql_query( $query );
		while( $row = mysql_fetch_array( $result ) ) {
			$array[] = $row["name"];
		}
		return $array;
	}

	/**
	 * Search key.value or tag.name beginning by $value in database, only return the first word
	 * @param {String} $value string to search in the database
	 * @return {Array} array of all corresponding words found in the database
	 */
	static function searchsugg ( $value )
	{
		$value = strtolower($value);
		$query = "SELECT DISTINCT substring_index(LOWER (k.value), ' ', 2) as kvalue FROM `key` k WHERE LOWER(k.value) LIKE '$value%' ORDER BY k.value ASC LIMIT 10";
		$query2 = "SELECT DISTINCT substring_index(LOWER (t.name), ' ', 2) as tname FROM tag t WHERE LOWER(t.name) LIKE '$value%' ORDER BY t.name ASC LIMIT 10";
		
		$return = array();
		$result = mysql_query($query);
		while( $row = mysql_fetch_array( $result ) ) {
			$return[] = $row["kvalue"];
		}
		
		$result2 = mysql_query($query2);
		while( $row2 = mysql_fetch_array( $result2 ) ) {
			$return[] = $row2["tname"];
		}
		
		$return = array_unique($return);
		natcasesort($return);
		
		$i = 0;
		$res = array();
		foreach ($return as $key=>$val) {
			if ($i++ == 10) break;
			$res[] = $val;
		}
			
		return $res;
	}

	//
	//
	//
	//
	//
	//
	//
	//
	// ROOTED TREE FUNCTIONS
	//
	// BASED ON #PARENT KEY
	//
	//
	//
	//
	//
	//
	//
	//

	/**
	 * Retrieve the ancestors (parent and above) of a node
	 * @param {Integer} $id node index
	 * @return {Array} array of ancestors ids
	 */
	static function ancestors ( $id )
	{
		$parent = model::getKey( $id, '#parent' );
		if( ! is_null( $parent ) )
		{
			$a = model::ancestors( $parent );
			$a[] = $parent;
			return $a;
		}
		return array();
	}

	/**
	 * Retrieve the children of a node
	 * @param {Integer} $id node index
	 * @return {Array} array of children ids
	 */
	static function children ( $id )
	{
		$res = array();
		// PROTOTYPE BEGIN
		$protoname = model::getKey( $id, 'prototype' );
		if( $protoname )
		{
			$proto = model::searchKey( 'id', $protoname );
			$proto = $proto[0];
			if( $proto )
			{
				$res = model::children( $proto );
			}
		}
		// PROTOTYPE END
		return $res + model::search( array( '#parent' => '= '.$id ) );
	}

	/**
 	 * Move a node to a new container. Does not check parent loops
	 * @param {Integer} $id node index to move
	 * @param {Integer} $target target id
	 * @return {Boolean} true on success, false otherwise
	 */
	static function move ( $id, $target )
	{
		return model::setKey( $id, "#parent", $target );
	}

	/**
	 * Empty a node. underscore because empty is a reserved word
	 * @return {Boolean} true
	 */
	static function empty_( $id )
	{
		$children = model::children($id);
		for( $i=0; $i<sizeof($children); $i++ )
			model::delete( $children[$i] );
		return true;
	}

	static function countChildren ( $id )
	{
		$query = "SELECT COUNT(node_id) as count FROM `key` WHERE name='#parent' AND value='$id';";
		$row = mysql_fetch_array( mysql_query( $query ) );
		return intval( $row["count"] );
	}

	/**
 	 * Recursively copy a node
	 * @param {Integer} $id node index
	 * @param {Integer} $tgt parent index for new node or false for same location
 	 * @return {Boolean} true on success, false otherwise
 	 */
/* PASSAGE au nouveau parent, disable for now
	static function copyBranch ( $id, $tgt )
	{
		$newid = model::copyNode( $id, $tgt );
		$children = model::children($id);
		for( $i=0;$i<sizeof($children);$i++)
		{
			$res = model::copyBranch($children[$i], $newid );
		}
		return $newid;
	}
*/

	/**
	 * Replace all substring occurences by another one in every keys on node and sub nodes.
	 * @param {Integer} $id node index
	 * @param {String} $old old substring value to replace
	 * @param {String} $new new substring value
	 */
	static function setKeys ( $id, $old, $new )
	{
		$keys = model::keys( $id );
		foreach( $keys as $key => $value )
			model::setKey( $id, $key, str_replace( $old, $new, $value ) );
		$children = model::children( $id );
		for( $i=0; $i<sizeof($children); $i++ )
			model::setKeys( $children[$i], $old, $new );
		return true;
	}




	//
	//
	//
	//
	//
	//
	//
	//
	// INTERNALS
	//
	//
	//
	//
	//
	//
	//
	//

	static function countRLinks ( $id )
	{
		$query = "SELECT COUNT(src_id) as count FROM link WHERE tgt_id='$id';";
		$row = mysql_fetch_array( mysql_query( $query ) );
		return intval( $row["count"] );
	}

	static function countTargets ( $id )
	{
		$query = "SELECT COUNT(tgt_id) as count FROM link WHERE src_id='$id';";
		$row = mysql_fetch_array( mysql_query( $query ) );
		return intval( $row["count"] );
	}

	/**
	 * Retrieve a key value
	 * @param {Integer} $id node index
	 * @param {String} $name key name
 	 * @return {String} key value on success
	 */
	static function getKey ( $id, $name )
	{
		$query = sprintf("SELECT value FROM `key` WHERE node_id='%s' AND name='%s';",
			$id,
			mysql_real_escape_string($name) );
		$res = mysql_query($query);
		$row = mysql_fetch_array($res);
		return $row["value"];
		# we don't want & char to become &amp; for file names
		#return htmlspecialchars($row['value'],ENT_QUOTES);
	}

	/**
	 * Remove a key
	 * @param {Integer} $id node id
	 * @param {String} $name key name
	 * @return {Boolean} true on success, false otherwise
	 */
	static function removeKey ( $id, $name ) 
	{
		$query = sprintf( "DELETE FROM `key` WHERE node_id='%s' AND name='%s';",
			$id,
			mysql_real_escape_string($name)
		);
		$res = mysql_query($query);
		if( $res)
			return mysql_affected_rows() == 1;
		return $res;
	}

	/**
	 * Set a key - when id is string, setKey on root!
	 * @param {Integer} $id node index
	 * @param {String} $name key name
	 * @param {String} $value key value
 	 * @return {Boolean} true on success, false otherwise
	 */
	static function setKey ( $id, $name, $value )
	{
		$query = sprintf( "REPLACE INTO `key` (node_id, name, value) VALUES ('%s','%s','%s');",
			$id,
			mysql_real_escape_string($name),
			mysql_real_escape_string($value)
		);
		$res = mysql_query($query);
		if( $res )
			return mysql_affected_rows() > 0; // replace = delete + insert = 2
		return true;
	}

	//
	//
	//
	//
	//
	//
	//
	//
	// LINKS
	//
	// BASED ON A 'link' TABLE
	//
	//
	//
	//
	//
	//
	//


	/**
	 * Link 2 nodes
	 * @param {Integer} $src_id node index
	 * @param {Integer} $tgt_id node index
	 * @return {Integer} link id on success, false otherwise
	 */
	static function link ( $src_id, $tgt_id )
	{
		if( !is_numeric($src_id) or !is_numeric($tgt_id))
			return false;
		$query = sprintf("INSERT INTO link (src_id, tgt_id) VALUES (%s, %s);",
			$src_id,
			$tgt_id
		);
		if($result = mysql_query($query))
			return mysql_insert_id();
		return false;
	}

	/**
	 * Remove a link
	 * @param {Integer} $id link index
	 * @return {Boolean} true on success, false otherwise
	 */
	static function unlink ( $id ) 
	{
		$query = "DELETE FROM link WHERE id='$id';";
		$res = mysql_query($query);
		if( $res)
			return mysql_affected_rows() == 1;
		return $res;
	}

	/**
	 * Get connected links. Recursive. Useful for graphs
	 * Infinite loop check
	 * @param {Array} $ids array of nodes indexes to query
	 * @param {Array} $targets array of node indexes to filter
	 * @return {Array} or false
	 */
	static function links_r ( $ids, $targets )
	{
		$query = sprintf( "SELECT * FROM link WHERE tgt_id IN ( %s );",
			join(",", $ids));
		if( !$result = mysql_query( $query ) ) return array();
		if( !mysql_num_rows( $result ) ) return array();
		$a = array();
		$newids = array();
		while( $row = mysql_fetch_array( $result ) )
		{
			$a[ intval($row["id"]) ] = array( intval($row["src_id"]), intval($row["tgt_id"]) );
			if( ! in_array( intval($row["src_id"]), $targets ) )
			{
				$newids[] = intval($row["src_id"]);
			}
		}
		$targets += $newids;
		$a += model::links_r( $newids, $targets );
		return $a;
	}

	/**
	 * Get the root nodes from the database: nodes that are link sources but not targets
	 * @return {Array} array of indexes for matching nodes
	 */
	static function roots ( )
	{
		$query = "SELECT id FROM node WHERE id NOT IN (SELECT tgt_id FROM link) AND id IN (SELECT src_id FROM link);";
		if( !$result = mysql_query( $query ) ) return array();
		if( !mysql_num_rows( $result ) ) return array();
		$a = array();
		while( $row = mysql_fetch_array( $result ) )
		{
			$a[] = intval( $row["id"] );
		}
		return $a;
	}

	/**
	 * Get the all the links within a specified pool of nodes.
	 * Links are returned as arrays of 3 values: link id, source node id, target node id
	 * @param {Array} $ids nodes indexes
	 * @return {Array} array of matching links
	 */
	static function links2 ( $ids )
	{
		$query = sprintf( "SELECT * FROM link WHERE src_id IN ( %s ) AND tgt_id IN ( %s );",
			$ids, $ids);
		if( !$result = mysql_query( $query ) ) return array();
		if( !mysql_num_rows( $result ) ) return array();
		$a = array();
		while( $row = mysql_fetch_array( $result ) )
		{
			$a[] = array( $row["id"], $row["src_id"], $row["tgt_id"] );
		}
		return $a;
	}

	/**
	 * Get the links of a node
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
				$array = model::links( $proto );
			}
		}
		// PROTOTYPE END

		$query = "SELECT link.id AS link_id, link.tgt_id, node.* FROM link LEFT JOIN node ON node.id=link.tgt_id WHERE src_id='$id' ORDER BY type;";
		if( !$result = mysql_query( $query ) ) return $array;
		if( !mysql_num_rows( $result ) ) return $array;

		while( $row = mysql_fetch_array( $result ) )
		{
			$array[] = array(
				"link_id" => $row["link_id"], 
				"id" => $row["tgt_id"], 
				"type" => ( ( $row["tgt_id"] == "0" )? "folder" : $row["type"] )
			);
		}
		return $array;
	}

	/**
	 * Get the reverse links of a node
	 * @param {Integer} $id node id
	 * @return {array} links 
	 */
	static function rlinks ( $id )
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
				$array = model::rlinks( $proto );
			}
		}
		// PROTOTYPE END

		$query = "SELECT link.id AS link_id, link.src_id, node.* FROM link LEFT JOIN node ON node.id=link.src_id WHERE tgt_id='$id' ORDER BY type;";
		if( !$result = mysql_query( $query ) ) return $array;
		if( !mysql_num_rows( $result ) ) return $array;

		while( $row = mysql_fetch_array( $result ) ) {

			$res = array ("link_id"=>$row["link_id"], 
					"id"=>$row["src_id"], 
					"type"=>(($row["src_id"] == "0" )? "folder" : $row["type"])
			);
			$array[] = $res;
		}
		return $array;
	}
	



	//
	//
	//
	//
	//
	//
	//
	//
	// OTHERS
	//
	//
	//
	//
	//
	//
	//
	//

	/**
 	 * Search for nodes wearing a key/value pair
	 * @param {String} $name key name
	 * @param {String} $value key value
	 * @return {Array} array of matched node ids
 	 */
	static function searchKey ( $name, $value )
	{
		$query = sprintf( "SELECT node_id FROM `key` WHERE name='%s' AND value='%s';",
			mysql_real_escape_string($name),
			mysql_real_escape_string($value) );
		$result = mysql_query($query);
		$res = array();
		while( $row = mysql_fetch_array($result) )
			$res[] = $row["node_id"];
		return $res;
	}

	/**
	 * Set an element's tags. Trim values.
	 * @param {Integer} $id node index
	 * @param {String} $tags comma separated tags
	 */
	static function setTags ( $id, $tags )
	{
		$query = sprintf( "DELETE FROM tag WHERE node_id='%s';", $id );
		$res = mysql_query( $query );
		$ts = explode( ',' , $tags );
		for( $i=0; $i<sizeof($ts); $i++ )
		{
			if( trim( $ts[$i] ) != '' )
				model::tag( $id, trim( $ts[$i] ) );
		}
		return true;
	}

	/**
	 * Tag a node
	 * @param {Integer} $id index of node to tag
	 * @param {String} $name tag name
	 * @return {Boolean} true on success, false otherwise
	 *
	 */
	static function tag ( $id, $name )
	{
		$query = sprintf( "INSERT INTO tag (node_id,name) VALUES ('%s','%s');",
			$id,
			mysql_real_escape_string( $name )
		);
		return mysql_query($query);
	}

	/**
	 * Remove a tag
	 * @param {Integer} $id index of node to untag
	 * @param {String} $name tag name
	 * @return {Boolean} true on success, false otherwise
	 */
	static function untag ( $id, $name ) 
	{
		$query = sprintf("DELETE FROM tag WHERE node_id='%s' AND name='%s';",
			$id,
			mysql_real_escape_string($name)
		);
		$res = mysql_query($query);
		if( $res)
			return mysql_affected_rows() == 1;
		return false;
	}

}

?>
