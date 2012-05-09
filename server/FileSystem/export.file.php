<?php

include_once "../../App/php/lib.ajaxserver.php";

damas_service::init_http();

function exportSdfFile($filepath)
{
    $chaine = exportSdf();
    if($chaine != "")
    {
        $fd = fopen($filepath, 'w');
        fwrite($fd, $chaine);
        fclose($fd);
    }
    else return false;

    return true;
}

function exportSdfScreen()
{
    $chaine = exportSdf();

    if($chaine != "") echo $chaine;
    else echo "Impossible of file generation";

    return true;
}

function exportSdf()
{
    // Write the date Time
    $chaine = date('D d/m/Y H:i:s O').";\n";

    // Name of column
    $chaine .= "Name of Shot;Maya in;Maya out;Characters;Props;Sets;"."\n";


    /* SQL Query */
    $query = "SELECT node.id AS id, node.name AS name, p1.value AS paramin, p2.value AS paramout FROM node INNER JOIN key AS p1 ON node.id = p1.node_id INNER JOIN key AS p2 ON node.id = p2.node_id WHERE node.type='Movie Shot' and p1.name = 'in' and p1.value != '' and p2.value != '' and p2.name = 'out' and node.name like 'sq%' order by name;";
    $result = mysql_query($query);

    if (!$result = mysql_query($query))
        return "";

    if (!mysql_num_rows($result))
        return "";

    while ($row = mysql_fetch_array($result)){
        $chaine .= sprintf('%s;%s;%s;',$row['name'],$row['paramin'],$row['paramout']);

        // CHARACTERS
        $querylinkschar = sprintf("SELECT node.name AS name FROM link INNER JOIN node ON link.tgt_id = node.id and node.type = 'Movie Character' and link.src_id = '%s' order by name",$row['id']);
        $resultlinkschar = mysql_query($querylinkschar);
        if (!$resultlinkschar = mysql_query($querylinkschar)) return false;

        if (mysql_num_rows($resultlinkschar)!=0)
        {
            while($rowlinkschar = mysql_fetch_array($resultlinkschar)) $chaine .= $rowlinkschar['name']." ";
            $chaine = substr($chaine, 0, -1);
        }

        $chaine .= ";";

        // PROPS
        $querylinksprop = sprintf("SELECT node.name AS name FROM link INNER JOIN node ON link.tgt_id = node.id and node.type = 'Movie Prop' and link.src_id = '%s' order by name",$row['id']);
        $resultlinksprop = mysql_query($querylinksprop);
        if (!$resultlinksprop = mysql_query($querylinksprop)) return false;

        if (mysql_num_rows($resultlinksprop)!=0)
        {
            while($rowlinksprop = mysql_fetch_array($resultlinksprop)) $chaine .= $rowlinksprop['name']." ";
            $chaine = substr($chaine, 0, -1);
        }

        $chaine .= ";";

        //  SETS
        $querylinksset = sprintf("SELECT node.name AS name FROM link INNER JOIN node ON link.tgt_id = node.id and node.type = 'Movie Set' and link.src_id = '%s' order by name",$row['id']);
        $resultlinksset = mysql_query($querylinksset);
        if (!$resultlinksset = mysql_query($querylinksset)) return false;

        if (mysql_num_rows($resultlinksset)!=0)
        {
            while($rowlinksset = mysql_fetch_array($resultlinksset)) $chaine .= $rowlinksset['name']." ";
            $chaine = substr($chaine, 0, -1);
        }

        $chaine .= ";\n";
    }

    return $chaine;
}


$cmd = $_GET["cmd"];
$path = $_GET["path"];

switch ($cmd){
	case "exportsdffile":
		$ret = exportSdfFile($assetsLCL.arg("path"));
		if(!$ret) echo "Generation File Error";
		break;
	case "exportsdfscreen":
		exportSdfScreen();
        break;
}


//echo exportSdf();
?>
