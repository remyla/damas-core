<?php
/**
 * Damas Server Configuration File
 *
 * macros : [DBNAME], [DBUSER], [DBPASSWORD], [PROJECTDIR]
 */


/**
 * MySQL database settings
 */
$db_server = "localhost";
$db_name = "damasdb";
$db_username = "";
$db_passwd = "";


/**
 * Anonymous access
 * Can unauthenticated users explore the project?
 */
$anonymous_access = false;


/**
 * User authentication method
 * "None" - no user authentication
 * "Default" - authentication using 'damas:user' nodes in the project
 * "MySQL" - authentication against a "user" table in the database of project
 * "CAS"   - authentication against a Central Authentification Service
 */
$authentication = "MySQL";


/**
 * Central Authentification Service configuration
 */
# $CAS_version = "CAS_VERSION_2_0";
# $CAS_url = "cas.domain.com";
# $CAS_port = 443;


/**
 * Sometimes, we want to hide those who work on tasks and assets.
 * The names of this list are replaced by "***" in server responses.
 */
$hidden_users = array();


/**
 * FileSystem Addon
 * Unix path to project root.
 * It should point a path in a mounted volume if the project is on a dedicated
 * file server.
 */
$assetsLCL = "/home/damas/files";
?>
