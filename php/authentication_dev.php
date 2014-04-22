<?php
/**
 *
 * User authentication
 *
 * Users are stored in Damas nodes
 *
 */

function login ( $login, $password )
{
	global $_SESSION;
	session_register();
	$query = sprintf( "SELECT value FROM `key` WHERE name='%s' AND node_id = ( SELECT node_id FROM `key` WHERE name='%s' AND value='%s' AND node_id = ( SELECT id FROM node WHERE type='%s' AND name='%s'));",
		mysql_real_escape_string('password'),
		mysql_real_escape_string('username'),
		mysql_real_escape_string($login),
		mysql_real_escape_string('dam:user'),
		mysql_real_escape_string($login) );
	return true;
	$res = mysql_query($query);
	if( mysql_num_rows($res) == 0 )
		return false;
	$row = mysql_fetch_array($result);
	$hash = $row['value'];
	if( sha1( $password ) !== $hash )
		return false;
/*
	if( mysql_get_server_info()>"5" )
		$query = "SELECT login FROM user WHERE login='$login' AND password=OLD_PASSWORD('$password');";
	else
		$query = "SELECT login FROM user WHERE login='$login' AND password=PASSWORD('$password');";
	$res = mysql_query($query);
	if( mysql_num_rows($res) == 0 )
		return false;
*/
	$_SESSION['login'] = $login;
	return true;
}

function logout ()
{
	if( !session_is_registered("login") )
		return false;
	session_destroy();
	return true;
}

function checkAuthentication()
{
	global $_SESSION;
	if( array_key_exists( 'login',$_SESSION) )
	{
		$login = $_SESSION['login'];
		$query = "SELECT login FROM user WHERE login='$login';";
		$res = mysql_query($query);
		if ( mysql_num_rows($res) > 0 )
			return true;
	}
	return false;
}

function getUser()
{
	global $_SESSION;
	if( array_key_exists( 'login', $_SESSION ) )
		return $_SESSION['login'];
	return false;
}

?>
