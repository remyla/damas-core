<?php
/**
 *
 * @fileoverview Permission rules per user classes
 *
 * Format: command_name => array of allowed user classes
 *
 * Syntax:
 * $mod["COMMAND"] = array( "usergroup1", "usergroup2" );
 *
 * @author Remy Lalanne
 *
 * copyright (c) 2005-2012 damas-software.com | Remy Lalanne
 *
 */

$mod["model::ancestors"] = array( "*" );
$mod["model::children"] = array( "*" );
$mod["model::links"] = array( "*" ); // Axel
$mod["model::export"] = array( "*" ); // Axel
$mod["model::createNode"] = array( "admin", "editor" );
$mod["model::duplicate"] = array( "admin", "editor" );
$mod["model::graph"] = array( "*" );
$mod["model::link"] = array( "admin", "editor", "linker" );
$mod["model::move"] = array( "admin", "editor" );
$mod["model::multi"] = array( "*" );
$mod["model::removeNode"] = array( "admin" );
$mod["model::removeKey"] = array( "admin", "editor" );
$mod["model::setKey"] = array( "admin", "editor" );
$mod["model::setKeys"] = array( "admin", "editor" );
$mod["model::setTags"] = array( "admin", "editor" );
$mod["model::setType"] = array( "admin" );
$mod["model::single"] = array( "guest", "user", "linker", "editor", "admin" );
$mod["model::searchKey"] = array( "*" );
$mod["model::stats"] = array( "*" );
$mod["model::tag"] = array( "admin", "editor" );
$mod["model::types"] = array( "*" );
$mod["model::tags"] = array( "*" );
$mod["model::unlink"] = array( "admin", "editor", "linker" );
$mod["model::untag"] = array( "admin", "editor" );

$mod["asset::empty_trashcan"] = array( "admin" );
$mod["asset::filecheck"] = array( "*" );
$mod["asset::getElementById"] = array( "*" );
$mod["asset::lock"] = array( "admin", "editor", "user", "linker" );
$mod["asset::recycle"] = array( "admin", "editor" );
$mod["asset::time"] = array( "admin", "editor", "user", "linker" );
$mod["asset::unlock"] = array( "admin", "editor", "user", "linker" );
$mod["asset::upload"] = array( "admin", "editor", "user", "linker" );
$mod["asset::upload_set_image"] = array( "admin", "editor", "user", "linker" );
$mod["asset::upload_create_asset"] = array( "admin", "editor", "user" );
$mod["asset::version_backup"] = array( "admin", "editor", "user", "linker" );
$mod["asset::version_increment"] = array( "admin", "editor", "user", "linker" );
$mod["asset::version_increment2"] = array( "admin", "editor", "user", "linker" );
$mod["asset::write"] = array( "admin", "editor", "user", "linker" );
# OLD ASSET
# $mod["asset::save"] = array( "admin", "editor", "user", "linker" );
# $mod["asset::saveable"] = array( "admin", "editor", "user", "linker" );
# $mod["asset::savecheck"] = array( "admin", "editor", "user", "linker" );
# $mod["asset::backup"] = array( "admin", "editor", "user", "linker" );
# $mod["asset::commitnode"] = array( "admin", "editor", "user", "linker" );
# $mod["asset::backupundo"] = array( "admin", "editor", "user", "linker" );
# $mod["asset::rollback"] = array( "admin", "editor", "user", "linker" );

$mod["libtask.taskAdd"] = array( "admin", "editor" );
$mod["libtask.taskTag"] = array( "admin", "editor", "user", "linker" );
$mod["libtask.taskUntag"] = array( "admin", "editor", "user", "linker" );
$mod["libtask.taskSet"] = array( "admin", "editor" );
$mod["libtask.taskSetTeam"] = array( "admin", "editor", "user", "linker" );
$mod["libtask.taskSetState"] = array( "admin", "editor", "user", "linker" );
$mod["libtask.workflowByStateTotal"] = array( "*" );
$mod["libtask.workflowByState"] = array( "*" );
$mod["libtask.workflowByResource"] = array( "*" );
$mod["libtask.workflowByTask"] = array( "*" );
$mod["libtask.workflowByType"] = array( "*" );
?>
