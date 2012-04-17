<?php

function auth_get_class ()
{
	return getUserClass(getUser());
}

function getUserClass ( $login )
{
	$id = model::searchKey( 'username', $login );
	return model::getKey( $id[0], 'class' );
}

function getUserId ( $login ) {
	$res = model::searchKey( 'username', $login );
	return $res[0];
}

function checkAuthenticationXML ()
{
	$txt = "";
	if (array_key_exists("login",$_SESSION)){
		$txt .= "<authenticated>1</authenticated>\n";
		$txt .= "<username>".$_SESSION['login']."</username>\n";
		$txt .= "<userclass>".auth_get_class()."</userclass>\n";
		$txt .= "<user_id>".$_SESSION['user_id']."</user_id>\n";
	}
	else {
		$txt .= "<authenticated>0</authenticated>\n";
		$txt .= "<username>guest</username>\n";
		$txt .= "<userclass>guest</userclass>\n";
	}
	return $txt;
}

function checkAuthenticationjson ()
{
	$array = "";
	if (array_key_exists("login",$_SESSION)){
		$array["auth"] = true;
		$array["username"] = $_SESSION['login'];
		$array["userclass"] = auth_get_class();
		$array["user_id"] = (int)$_SESSION['user_id'];
	}
	else {
		$array["auth"] = false;
		$array["username"] = "guest";
		$array["userclass"] = "guest";
	}
	return $array;
}

?>
