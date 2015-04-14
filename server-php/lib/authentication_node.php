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
	$query = sprintf( "SELECT value FROM `key` WHERE name='password' AND node_id = ( SELECT node_id FROM `key` WHERE name='username' AND value='%s' );",
		mysql_real_escape_string($login) );
	$res = mysql_query($query);
	if( mysql_num_rows($res) == 0 )
		return false;
	$dbpassword = mysql_fetch_array($res)['value'];
	if( sha1( $password ) !== $dbpassword )
		return false;
	$_SESSION['login'] = $login;
	return true;
}

function logout ()
{
	if( !array_key_exists( 'login', $_SESSION ) )
		return false;
	session_destroy();
	return true;
}

function getUser()
{
	global $_SESSION;
	if( array_key_exists( 'login', $_SESSION ) )
		return $_SESSION['login'];
	return false;
}

?>
