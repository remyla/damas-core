<?php
/*******************************************************************************
 * Author Remy Lalanne
 * Copyright (c) 2005,2006,2007 Remy Lalanne
 ******************************************************************************/

	function taskSetTeam ( $id, $team )
	{
		switch (model::getKey($id, 'policy')){
			case "open":
				break;
			case "assign":
				if (getUser() != model::getKey($id,"team"))
					if (!allowed("libtask.taskSet")) return false;
				break;
			case "bind":
			default:
				if (!allowed("libtask.taskSet")) return false;
				break;
		}
		return model::setKey($id, "team", $team);
	}

	function taskSetState ( $id, $state )
	{
		switch (model::getKey($id, 'policy')){
			case "open":
				break;
			case "assign":
				if (getUser() != model::getKey($id,"team"))
					if (!allowed("libtask.taskSet")) return false;
				break;
			case "bind":
			default:
				if (!allowed("libtask.taskSet")) return false;
				break;
		}
		return model::setKey($id, "state", $state);
	}
?>
