<?php
/**
 * @fileoverview Error Code Definitions
 *
 * @author Remy Lalanne
 * Copyright (c) 2006,2007 Remy Lalanne
 */
$ERR_NOERROR      = 0;
$ERR_SERVER_CONF  = 6;
$ERR_COMMAND      = 1;
$ERR_AUTHREQUIRED = 2;
$ERR_PERMISSION   = 3;
$ERR_AUTH         = 4;
$ERR_LOGOUT       = 5;
$ERR_MYSQL_SUPPORT = 10;
$ERR_MYSQL_SERVER  = 11;
$ERR_MYSQL_CONNECT = 12;
$ERR_MYSQL_DB      = 13;
$ERR_MYSQL_QUERY   = 14;
$ERR_NODE_ID          = 30;
$ERR_NODE_CREATE      = 31;
$ERR_NODE_UPDATE      = 32;
$ERR_NODE_MOVE        = 33;
$ERR_NODE_DELETE      = 34;
$ERR_FILE_NOT_FOUND  = 70;
$ERR_FILE_PERMISSION = 71;
$ERR_FILE_EMPTYDIR   = 72;
$ERR_FILE_UPLOAD     = 73;
$ERR_FILE_EXISTS     = 74;
$ERR_ASSET_LOCK       = 100;
$ERR_ASSET_UNLOCK     = 101;
$ERR_ASSET_SAVEABLE   = 102;
$ERR_ASSET_BACKUP     = 103;
$ERR_ASSET_UPDATE     = 104;
$ERR_ASSET_UNDOBACKUP = 105;
$ERR_ASSET_ROLLBACK   = 106;
$ERR_ASSET_NOSHA1     = 107;
$ERR_ASSET_FILECHECK  = 108;
$ERR_ASSET_READONLY   = 109;

$error[$ERR_NOERROR]      = "";
//$error[$ERR_SERVER_CONF]  = "Configuration file is invalid";
$error[$ERR_COMMAND]      = "Bad command";
$error[$ERR_AUTHREQUIRED] = "User authentification required";
$error[$ERR_PERMISSION]   = "Permission denied";
$error[$ERR_AUTH]         = "Access denied";
$error[$ERR_LOGOUT]       = "Not Logged In";
$error[$ERR_FILE_NOT_FOUND] = "File not found";
$error[$ERR_FILE_PERMISSION] = "File access denied";
$error[$ERR_FILE_UPLOAD] = "File upload failed";
//$error[$ERR_MYSQL_SUPPORT] = "MySQL support is missing";
//$error[$ERR_MYSQL_SERVER]  = "Could not connect to MySQL Server";
//$error[$ERR_MYSQL_CONNECT] = "MySQL connect returned error";
//$error[$ERR_MYSQL_DB]      = "MySQL database select error";
$error[$ERR_MYSQL_QUERY]   = "MySQL query returned error";
$error[$ERR_NODE_ID]          = "Node not found";
$error[$ERR_NODE_CREATE]      = "Node create failed";
$error[$ERR_NODE_UPDATE]      = "Node update failed";
$error[$ERR_NODE_MOVE]        = "Node move failed";
$error[$ERR_NODE_DELETE]      = "Node delete failed";
$error[$ERR_ASSET_LOCK]       = "Asset lock failed";
$error[$ERR_ASSET_UNLOCK]     = "Asset unlock failed";
$error[$ERR_ASSET_SAVEABLE]   = "Asset save impossible. asset is unlocked or file permission is denied";
$error[$ERR_ASSET_BACKUP]     = "Asset backup failed";
$error[$ERR_ASSET_UPDATE]     = "Asset update failed";
$error[$ERR_ASSET_UNDOBACKUP] = "Asset undo backup failed";
$error[$ERR_ASSET_ROLLBACK]   = "Asset rollback failed";
$error[$ERR_ASSET_NOSHA1]     = "Asset signature is missing";
$error[$ERR_ASSET_FILECHECK]  = "Asset file differs";
$error[$ERR_ASSET_READONLY]   = "Asset is read only";
?>
