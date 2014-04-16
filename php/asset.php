<?php
/**
 * @fileoverview PHP Library : asset.php
 *
 * @author Remy Lalanne
 *
 * Copyright (c) 2007-2014 Remy Lalanne
 */

class assets
{
	static function asset_upload( $id, $path, $message )
	{
		switch( model::getKey( $id, 'mode' ) )
		{
			case '2':
				global $assetsLCL;
				$newid = assets::version_increment2( $id, $message );
				if( !$newid )
					return false;
				if( !move_uploaded_file( $path, $assetsLCL . model::getKey( $newid, 'file' ) ) )
				{
					return false;
				}
				break;
			case '1':
			default:
				global $assetsLCL;
				if( !file_exists( $assetsLCL . assets::getbackupfolder( $id ) ) )
				{
					if( ! mkdir( $assetsLCL . assets::getbackupfolder( $id ), 0755, true ) )
						return false;
				}
				if( !is_writable( $assetsLCL . assets::getbackupfolder( $id ) ) )
					return false;
				if( file_exists( $assetsLCL . assets::getbackuppath( $id ) ) )
					return false;
				if( !is_writable( $assetsLCL . model::getKey( $id, 'file' ) ) )
					return false;
				$new_id = assets::version_backup( $id );
				if( !$new_id )
					return false;
				if( !move_uploaded_file( $path, $assetsLCL . model::getKey( $id, 'file' ) ) )
				{
					unlink( $assetsLCL . model::getKey( $new_id, 'file' ) );
					model::removeNode( $new_id );
					return false;
				}
				if( !assets::version_increment( $id, $message ) )
				{
					return false;
				}
				break;
		}
		return true;
	}

	/**
	 * Copy the current file version to backup folder, preserving mtime
	 */
	static function version_backup ( $id )
	{
		global $assetsLCL;
		$opath = $assetsLCL . model::getKey( $id, 'file' );
		$bpath = $assetsLCL . assets::getbackuppath( $id );
		if( !copy( $opath, $bpath ) )
			return false;
		touch( $bpath, filemtime( $opath ) );
		$new_id = model::createNode( $id, "asset" );
		if( !$new_id ) return false;
		model::setKey( $new_id, "bytes", model::getKey( $id, 'bytes' ) );
		model::setKey( $new_id, "file", assets::getbackuppath( $id ) );
		model::setKey( $new_id, "sha1", model::getKey( $id, 'sha1' ) );
		model::setKey( $new_id, "text", model::getKey( $id, 'text' ) );
		model::setKey( $new_id, "time", model::getKey( $id, 'time' ) );
		model::setKey( $new_id, "user", model::getKey( $id, 'user' ) );
		model::setKey( $new_id, "version", model::getKey( $id, 'version' ) ? model::getKey( $id, 'version' ) : "0" );
		return $new_id;
	}

	/**
	 * Increment the asset after a successful backup and commit sequence
	 * @param {Integer} asset node index
	 * @param {String} user message for the new version
	 */
	static function version_increment( $id, $message )
	{
		if( !model::setKey( $id, "version", model::getKey( $id, 'version' ) + 1 ) )
			return false;
		if( !model::setKey( $id, "user", getUser() ) )
			return false;
		if( !model::setKey( $id, "text", $message ) )
			return false;
		if( !model::setKey( $id, "time", time() ) )
			return false;
		#global $assetsLCL;
		#if( !model::setKey( $id, "sha1", sha1_file( $assetsLCL . model::getKey( $id, 'file' ) ) ) )
		#	return false;
		return true;
	}

	/**
	 * Increment the asset after a successful commit. The path is incremented too. Not backup needed 
	 * @param {Integer} asset node index
	 * @param {String} user message for the new version
	 */
	static function version_increment2 ( $id, $message )
	{
		$file =  model::getKey( $id, 'file' );
		if( !$file ) return false;
		$new_id = model::createNode( $id, "asset" );
		if( !$new_id ) return false;
		$version =  model::getKey( $id, "version" ) ? str_pad( model::getKey( $id, "version" ) + 1, 3, '0', STR_PAD_LEFT ) : "001";
		model::setKey( $new_id, "file", dirname( dirname( $file ) ) . '/' . $version . '/' . basename( $file ) );
		model::setKey( $new_id, "text", $message );
		model::setKey( $new_id, "time", time() );
		model::setKey( $new_id, "user", getUser() );
		model::setKey( $new_id, "version", $version );
		model::setKey( $id, "file", model::getKey( $new_id, "file" ) );
		model::setKey( $id, "time", model::getKey( $new_id, "time" ) );
		model::setKey( $id, "version", model::getKey( $new_id, "version" ) );
		return $new_id;
	}


	//
	// HELPERS
	//
	//

	static function getbackupfolder( $id )
	{
		$path = model::getKey( $id, 'backupdir' );
		if( $path )
		{
			if( substr( $path, -1 ) == '/' ) $path = substr( $path, 0, -1 );
			return $path;
		}
		return dirname( model::getKey( $id, 'file' ) );
	}

	static function getbackupname( $id )
	{
		$opath = model::getKey( $id, 'file' );
		$pinfo = pathinfo( $opath );
		$filename = substr( basename( $opath ), 0, strpos( basename( $opath ), '.' ) );
		$version = model::getKey( $id, 'version' ) ? model::getKey( $id, 'version' ) : "0";
		return $filename . "-" . $version . "." . $pinfo['extension'];
	}

	static function getbackuppath( $id )
	{
		return assets::getbackupfolder( $id ) . "/" . assets::getbackupname( $id );
	}
}

?>
