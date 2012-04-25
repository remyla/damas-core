<?php

/**
 *
 * DAMAS Data Model Library
 *
 * Simple library written in PHP to handle a key=value data model on top of MySQL, supporting :
 * - Rooted tree management functions (ancestors, children, createNode, removeNode, copyNode, copyBranch, move, parent, setType)
 * - Text key and value pairs on nodes (keys, setKey, getKey, removeKey, searchKey, setKeys)
 * - Simple directed acyclic graph (DAG) functions (link, unlink, islinked)
 * - Tagging (tag, untag, hastag, setTags)
 * - Element inheritance (prototype based) - beta
 *
 * @author Remy Lalanne
 * Copyright (c) 2007-2012 Remy Lalanne
 *
 * 120221 : fixed graph redondant cycles
 *
 */

class model
{
	/**
	 * Retrieve the children of a node
	 * @param {Integer} $id node index
	 * @return {Array} array of children ids
	 */
	static function ancestors ( $id )
	{
		$query = "SELECT parent_id FROM node WHERE id='$id';";
		$result = mysql_query($query);
		$row = mysql_fetch_array($result);
		if( ! is_null( $row["parent_id"] ) )
		{
			$a = model::ancestors( $row["parent_id"] );
			$a[] = $row["parent_id"];
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
		$query = "SELECT * FROM `key` WHERE node_id='$id' AND name='prototype';";
		$result = mysql_query($query);
		$row = mysql_fetch_array($result);
		if( $row )
		{
			$proto = model::searchKey( "id", $row["value"] );
			$proto = $proto[0];
			if( $proto )
			{
				$res = model::children( $proto );
			}
		}
		// PROTOTYPE END

		$query = "SELECT id FROM node WHERE parent_id='$id' ORDER BY type;";
		$result = mysql_query( $query );
		while( $row = mysql_fetch_array( $result ) )
			$res[] = $row["id"];
		return $res;
	}

	/**
 	 * Recursively copy a node
	 * @param {Integer} $id node index
	 * @param {Integer} $tgt parent index for new node or false for same location
 	 * @return {Boolean} true on success, false otherwise
 	 */
	static function copyBranch ( $id, $tgt )
	{
		$newid = model::copyNode( $id, $tgt );
		$result = mysql_query( "SELECT id FROM node WHERE parent_id='$id';" );
		while( $row = mysql_fetch_array( $result ) )
		{
			$res = model::copyBranch( $row["id"], $newid );
		}
		return $newid;
	}

	/**
 	 * Copy a node - not recursive
	 * @param {Integer} $id node index
	 * @param {Integer} $tgt parent index for new node or false for same location
 	 * @return {Boolean} true on success, false otherwise
 	 */
	static function copyNode ( $id, $tgt )
	{
		// copy node
		$query = "SELECT type, parent_id FROM node WHERE id='$id';";
		$result = mysql_query($query);
		$row = mysql_fetch_array($result);
		if( $tgt )
			$newid = model::createNode( $tgt, $row["type"] );
		else
			$newid = model::createNode( $row["parent_id"], $row["type"] );
		if( !$newid ) return false;

		// copy keys
		//$keys = model::keys($id);
		//foreach( $keys as $key => $value )
		//	model::setKey( $newid, $key, $value );
		$result = mysql_query( "SELECT * FROM `key` WHERE node_id='$id';" );
		while( $row = mysql_fetch_array( $result ) )
		{
			model::setKey( $newid, $row["name"], $row["value"] );
		}

		// copy tags
		$query = "SELECT name FROM tag WHERE node_id='$id';";
		$result = mysql_query($query);
		while ($row = mysql_fetch_array($result)){
			model::tag($newid, $row["name"]);
		}
		// copy references
		$query = "SELECT src_id, tgt_id FROM link WHERE src_id='$id';";
		$result = mysql_query($query);
		while ($row = mysql_fetch_array($result)){
			model::link( $newid, $row["tgt_id"] );
		}
		// copy referenced
		$query = "SELECT src_id, tgt_id FROM link WHERE tgt_id='$id';";
		$result = mysql_query($query);
		while ($row = mysql_fetch_array($result)){
			model::link( $row["src_id"], $newid);
		}
		return $newid;
	}

	/**
 	 * Creates a node providing its internal type value. Doesn't check parent node existence.
	 * @param {Integer} $parent_id parent node index
	 * @param {String} $type text type for the new node
 	 * @returns {Integer} the new node id on success, false otherwise
 	 */
	static function createNode ( $parent_id, $type )
	{
		$query = sprintf("INSERT INTO node ( type, parent_id ) VALUES ( '%s', '%s' );",
			mysql_real_escape_string($type),
			$parent_id
		);
		if( $result = mysql_query($query)){
			return mysql_insert_id();
		}
		return $result;
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
	 * Get connected links. Recursive. Useful for graphs
	 * @param {Integer} $id node index
	 * @return {Array} or false
	 */
	static function links_r ( $id, $targets )
	{
		$query = "SELECT * FROM link WHERE src_id='$id';";
		if( !$result = mysql_query( $query ) ) return array();
		if( !mysql_num_rows( $result ) ) return array();
		$a = array();
		while( $row = mysql_fetch_array( $result ) )
		{
			$a[ $row["id"] ] = array( $row["src_id"], $row["tgt_id"] );
			if( ! in_array( $row["tgt_id"], $targets ) )
			{
				$targets[] = $row["tgt_id"];
				$a += model::links_r( $row["tgt_id"], $targets );
			}
		}
		return $a;
	}

	/**
 	 * Move a node to a new container
	 * @param {Integer} $id node index to move
	 * @param {Integer} $target target id
	 * @return {Boolean} true on success, false otherwise
 	 */
	static function move ( $id, $target )
	{
		$query = "UPDATE node SET parent_id='$target' WHERE id='$id';";
		$res = mysql_query($query);
		if( $res)
			return mysql_affected_rows() == 1;
		return false;
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
 	 * Recursively delete a node - WARNING: this function doesn't check anything before removal
 	 * @return {Boolean} true on success, false otherwise
 	 */
	static function removeNode ( $id )
	{
		$children = model::children($id);
		$res = false;
		for( $i=0;$i<sizeof($children);$i++)
			$res = model::removeNode($children[$i]);
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
		if( $res)
			return mysql_affected_rows() > 0; // replace = delete + insert = 2
		return true;
	}

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
	 * Check if 2 nodes are already linked
	 * @param {Integer} $src_id node index
	 * @param {Integer} $tgt_id node index
	 * @return {Integer} link id on success, false otherwise
	 */
	static function islinked ( $src_id, $tgt_id )
	{
		$query = sprintf("SELECT id FROM link WHERE src_id='%s' AND tgt_id='%s';",
			$src_id,
			$tgt_id
		);
		$res = mysql_query($query);
		if( $res){
			if( mysql_num_rows($res)>0){
				$row = mysql_fetch_array($res);
				return $row['id'];
			}
		}
		return false;
	}

	/**
	 * Change the type of a node
	 * @param {Integer} $id node index
	 * @param {String} $name new name
	 * @return {Boolean} true on success, false otherwise. returns false if name is unchanged
	 */
	static function setType ( $id, $type )
	{
		$query = sprintf("UPDATE node SET type='$type' WHERE id='$id';",
			mysql_real_escape_string($type), $id);
		return mysql_query($query);
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
	 * Get the parent id of a node
	 * @param {Integer} $id node id
	 * @return parent id integer
	 */
	static function parent ( $id )
	{
		$query = "SELECT parent_id FROM node WHERE id='$id';";
		$result = mysql_query($query);
		$row = mysql_fetch_array($result);
		return $row["parent_id"];
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

		while( $row = mysql_fetch_array( $result ) ) {

			$res = array ("link_id"=>$row["link_id"], 
					"id"=>$row["tgt_id"], 
					"type"=>(($row["tgt_id"] == "0" )? "folder" : $row["type"]),
					"parent_id"=>$row["parent_id"]);

			$array[] = $res;
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
					"type"=>(($row["src_id"] == "0" )? "folder" : $row["type"]),
					"parent_id"=>$row["parent_id"]);

			$array[] = $res;
		}
		return $array;
	}
	
	/**
	 * Return the result from search of $value on database
	 * @param {String} $value string to search in the database
	 * @return {Array} array of all value found in the database
	 */
	static function rech ( $value )
	{
		$value = strtolower($value);
		$query = "SELECT DISTINCT k.value as kvalue FROM `key` k WHERE LOWER(k.value) like '%$value%' ORDER BY k.value ASC LIMIT 10";
		//$query1 = "SELECT DISTINCT k.name as kname FROM `key` k WHERE LOWER(k.name) like '%$value%' ORDER BY k.name ASC LIMIT 10";
		$query2 = "SELECT DISTINCT t.name as tname FROM tag t WHERE LOWER(t.name) like '%$value%' ORDER BY t.name ASC LIMIT 10";
		$res = array();
		$result = mysql_query($query);
		while( $row = mysql_fetch_array( $result ) ) {
			$res[] = $row["kvalue"];
		}
		
		/*
		$result1 = mysql_query($query1);
		while( $row1 = mysql_fetch_array( $result1 ) ) {
			$res[] = $row1["kname"];
		}// */
		
		$result2 = mysql_query($query2);
		while( $row2 = mysql_fetch_array( $result2 ) ) {
			$res[] = $row2["tname"];
		}
		$res = array_unique($res);
		natcasesort($res);
		return $res;
	}

}

?>
