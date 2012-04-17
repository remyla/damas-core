<?php
/**
 * Authentication using a table in a mysql database
 *
 */

function login ( $login, $password )
{
	global $_SESSION;
	session_register();
	if( mysql_get_server_info()>"5" )
		$query = "SELECT login FROM user WHERE login='$login' AND password=OLD_PASSWORD('$password');";
	else
		$query = "SELECT login FROM user WHERE login='$login' AND password=PASSWORD('$password');";
	$res = mysql_query($query);
	if( mysql_num_rows($res) == 0 )
		return false;
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
