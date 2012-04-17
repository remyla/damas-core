<?php

include_once "data_model_1.php";

class dam
{
	/**
	 * Write a message under an element
	 * @param {Integer} $id of the node
	 * @param {String} $text message text
	 * @return {Boolean} true on success, false otherwise
	 */
	static function write( $id, $text )
	{
		$newid = model::createNode( $id, "message" );
		if( !$newid )
			return false;
		if( !model::setKey( $newid, "user", getUser() ) )
			return false;
		if( !model::setKey( $newid, "time", time() ) )
			return false;
		if( !model::setKey( $newid, "text", $text ) )
			return false;
		return true;
	}

	/**
	 * Look for a dam:trash, and move element inside. create dam:trash at root if not found
	 * @param {Integer} $id of the node to recycle
	 * @return {Boolean} true on success, false otherwise
	 */
	static function recycle ( $id )
	{
		$trashcan = model::searchKey( 'id', 'dam:trash' );
		$trashcan = $trashcan[0];
		if( !$trashcan )
		{
			$trashcan = model::createNode( 0, 'folder' );
			model::setKey( $trashcan, 'id', 'dam:trash' );
			model::setKey( $trashcan, 'name', 'dam:trash' );
		}
		return model::move( $id, $trashcan );
	}

	/**
	 * Empty the trashcan
	 * @return {Boolean} true on success, false otherwise
	 */
	static function empty_trashcan ( )
	{
		$trashcan = model::searchKey( 'id', 'dam:trash' );
		$trashcan = $trashcan[0];
		if( $trashcan )
		{
			$children = model::children($trashcan);
			for( $i=0; $i<sizeof($children); $i++ )
				$res = model::removeNode( $children[$i] );
			return true;
		}
		return false;
	}
}

?>
