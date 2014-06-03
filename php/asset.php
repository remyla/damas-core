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
	/**
	 * Process the uploaded file
	 * @param {Integer} $id the asset
	 * @param {String} $path the path of the uploaded file in the temporary folder
	 * @param {String} $message
	 * @returns {Boolean} true on success, false otherwise
	 */
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
					model::delete( $new_id );
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
	 * Copy the current version to backup folder, preserving mtime
	 * @param {Integer} $id the asset
	 */
	static function version_backup ( $id )
	{
		global $assetsLCL;
		$opath = $assetsLCL . model::getKey( $id, 'file' );
		$bpath = $assetsLCL . assets::getbackuppath( $id );
		if( !copy( $opath, $bpath ) )
			return false;
		touch( $bpath, filemtime( $opath ) );
		return model::create( "asset", array(
			'#parent' => $id,
			'bytes' => model::getKey( $id, 'bytes' ),
			'file' => assets::getbackuppath( $id ),
			'sha1' => model::getKey( $id, 'sha1' ),
			'text' => model::getKey( $id, 'text' ),
			'time' => model::getKey( $id, 'time' ),
			'type' => 'asset',
			'user' => model::getKey( $id, 'user' ),
			'version' => model::getKey( $id, 'version' ) ? model::getKey( $id, 'version' ) : "1"
		));
	}

	/**
	 * Increment the asset after a successful backup and commit sequence
	 * @param {Integer} asset node index
	 * @param {String} user message for the new version
	 */
	static function version_increment( $id, $message )
	{
		model::update($id, array(
			"version" => model::getKey( $id, 'version' ) + 1,
			"user" => getUser(),
			"text" => $message,
			"time" => time()
		));
		#global $assetsLCL;
		#if( !model::setKey( $id, "sha1", sha1_file( $assetsLCL . model::getKey( $id, 'file' ) ) ) )
		#	return false;
		return true;
	}

	/**
	 * @deprecated (STUDIO100 versioning)
	 * Increment the asset after a successful commit. The path is incremented too. Not backup needed 
	 * @param {Integer} asset node index
	 * @param {String} user message for the new version
	 */
	static function version_increment2 ( $id, $message )
	{
		$file =  model::getKey( $id, 'file' );
		if( !$file ) return false;
		return model::create( "asset", array(
			'#parent' => $id,
			//'bytes' => model::getKey( $id, 'bytes' ),
			'file' => dirname(dirname($file)) . '/' . $version . '/' . basename($file),
			//'sha1' => model::getKey( $id, 'sha1' ),
			'text' => $message,
			'time' => time(),
			'type' => 'asset',
			'user' => getUser(),
			'version' => model::getKey( $id, "version" ) ? str_pad( model::getKey( $id, "version" ) + 1, 3, '0', STR_PAD_LEFT ) : "001"
		));
/*
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
*/
	}


	//
	// HELPERS
	//
	//

	/**
	 *
	 */
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

	/**
	 *
	 */
	static function getbackupname( $id )
	{
		$opath = model::getKey( $id, 'file' );
		$pinfo = pathinfo( $opath );
		$filename = substr( basename( $opath ), 0, strpos( basename( $opath ), '.' ) );
		$version = model::getKey( $id, 'version' ) ? model::getKey( $id, 'version' ) : "0";
		return $filename . "-" . $version . "." . $pinfo['extension'];
	}

	/**
	 *
	 */
	static function getbackuppath( $id )
	{
		return assets::getbackupfolder( $id ) . "/" . assets::getbackupname( $id );
	}
}

?>
