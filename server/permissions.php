<?php
/**
 * @fileoverview User privileges rules by class of DAMAS (damas-software.org)
 * @author Remy Lalanne
 *
 * Format:
 * $mod["COMMAND_NAME"] = array( "USERCLASS1", "USERCLASS2" );
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


$mod["model::ancestors"] = array( "*" );
$mod["model::children"] = array( "*" );
$mod["model::createNode"] = array( "admin", "editor" );
$mod["model::duplicate"] = array( "admin", "editor" );
$mod["model::export"] = array( "admin" ); // Axel
$mod["model::find"] = array( "*" );
$mod["model::findSQL"] = array( "*" );
$mod["model::graph"] = array( "*" );
$mod["model::link"] = array( "admin", "editor", "linker" );
$mod["model::links"] = array( "*" ); // Axel
$mod["model::list"] = array( "*" );
$mod["model::move"] = array( "admin", "editor" );
$mod["model::multi"] = array( "*" );
$mod["model::removeNode"] = array( "admin" );
$mod["model::removeKey"] = array( "admin", "editor" );
$mod["model::setKey"] = array( "admin", "editor" );
$mod["model::setKeys"] = array( "admin", "editor" );
$mod["model::setTags"] = array( "admin", "editor" );
$mod["model::setType"] = array( "admin" );
$mod["model::single"] = array( "guest", "user", "linker", "editor", "admin" );
$mod["model::search"] = array( "*" ); // Axel
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

$mod["workflow::workflowByState"] = array( "*" );

/*    FONCTIONS MDP SHA1   */
$mod["sha1::transform"] = array("*"); // Axel

?>
