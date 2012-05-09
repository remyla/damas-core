<?php
/**
 * DAM methods for DAMAS software (damas-software.org)
 *
 * Copyright 2005-2012 Remy Lalanne
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
