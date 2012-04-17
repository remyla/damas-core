<?php

function fileSave( $id, $path )
{
	global $assetsLCL;
	#if (!asset_saveable($id))
		#return false;
	$path = $assetsLCL.$path;
	$opath = $assetsLCL.model::getKey($id,'path');
	if (!copy($path,$opath))
		return false;
	return true;
}

function fileUpload( $id, $path )
{
	global $assetsLCL;
	$opath = $assetsLCL.model::getKey($id,'path');
	if (!move_uploaded_file($path, $opath))
		return false;
	return true;
}

function get_folder_children ( $fpath ) {
	$res = "";
	if (is_dir($fpath)){
		$h = opendir($fpath);
		while ($fname = readdir($h))
			if ($fname != '..' && $fname != '.')
				$res[] = $fname;
		closedir($h);
		return $res;
	}
	return false;
}

function get_file_posix_stats ( $fpath ) {
	$xml = "";
	$stats = lstat($fpath);
	$xml .= ' ino="'.$stats[1].'"';
	$xml .= ' mode="'.$stats[2].'"';
	$xml .= ' nlink="'.$stats[3].'"';
	$xml .= ' uid="'.$stats[4].'"';
	$xml .= ' gid="'.$stats[5].'"';
	$xml .= ' rdev="'.$stats[6].'"';
	$xml .= ' size="'.$stats[7].'"';
	$xml .= ' atime="'.$stats[8].'"';
	$xml .= ' mtime="'.$stats[9].'"';
	$xml .= ' ctime="'.$stats[10].'"';
	$xml .= ' blksize="'.$stats[11].'"';
	$xml .= ' blocks="'.$stats[12].'"';
	if (function_exists("posix_getpwuid")){
		$posix_owner = posix_getpwuid($stats[4]);
		$xml .= ' owner="'.$posix_owner["name"].'"';
	}
	if (function_exists("posix_getgrgid")){
		$posix_group = posix_getgrgid($stats[5]);
		$xml .= ' group="'.$posix_group["name"].'"';
	}
	$xml .= ' type="'.filetype($fpath).'"';
	$xml .= ' hmtime="'.date("d/m/y H:i", $stats[9]).'"';
	return $xml;
}

function filelist ( $fpath, $mask ) {
	$xml = "";
	if (file_exists($fpath)) {
		if (is_dir($fpath)){
			$h = opendir($fpath);
			$fpath2 = realpath($fpath);
			while ($fname = readdir($h) ){
				$fpathname = $fpath2.'/'.$fname;
				if ($fname != '..' && $fname != '.') {
					$xml .= "\t<file";
					$xml .= ' name="'.goodxml($fname).'"';
					$xml .= ' path="'.goodxml(str_replace($mask,"",$fpathname)).'"';
					//$xml .= ' type="'.get_file_type($fpath.'/'.$fname).'"';
					$xml .= get_file_posix_stats($fpathname);
					$xml .= "/>\n";
				}
			}
			closedir($h);
		}
	}
	else $xml = "<error>file \"$fpath\" not found</error>";
	return $xml;
}

function filesingle ( $fpath, $mask ) {
	$xml = "";
	if (file_exists($fpath)) {
		$fname = basename($fpath);
		$xml .= "\t<file";
		$xml .= ' name="'.goodxml($fname).'"';
		$xml .= ' path="'.goodxml(str_replace($mask,"",$fpath)).'"';
		//$xml .= ' type="'.get_file_type($fpath).'"';
		//$xml .= ' sha1="'.sha1_file($fpath).'"';
		$xml .= get_file_posix_stats($fpath);
		$xml .= "/>\n";
		return $xml;
	}
	return false;
}

function filesingle_sha1 ( $fpath )
{
	$xml = "";
	if (file_exists($fpath)) {
		$fname = basename($fpath);
		$xml .= "\t<file";
		$xml .= ' name="'.goodxml($fname).'"';
		$xml .= ' path="'.goodxml(str_replace($mask,"",$fpath)).'"';
		//$xml .= ' type="'.get_file_type($fpath).'"';
		$xml .= ' sha1="'.sha1_file($fpath).'"';
		$xml .= get_file_posix_stats($fpath);
		$xml .= "/>\n";
		return $xml;
	}
	return false;
}

function file_sha1 ( $fpath )
{
	if (file_exists($fpath)) {
		return sha1_file($fpath);
	}
	return false;
}


# $fpath is an absolute path
# $mask is a path prefix string to hide in output
function spider ( $fpath, $mask ) {
	$fxml = "";
	$xml = "";
	if (file_exists($fpath)) {
		$fxml .= "\t\t<file";
		$fxml .= ' name="'.goodxml(basename($fpath)).'"';
		$fxml .= ' path="'.goodxml(str_replace($mask,"",$fpath)).'"';
		$fxml .= get_file_posix_stats($fpath);
		$fxml .= ">\n";
		# children
		if (is_dir($fpath)){
			$children = get_folder_children ($fpath);
			/*
			$res = get_sequences($children);
			$sequences = $res[0];
			$singles = $res[1];
			foreach ($sequences as $seq ){
				$fxml .= $seq->xml_output($fpath, 3);
			}
			 */
			if ($children)
				foreach ($children as $fname ){
					$fxml .= "\t\t\t<child";
					$fxml .= ' name="'.goodxml($fname).'"';
					if ($fpath == '/')
						$fxml .= ' path="'.goodxml(str_replace($mask,"",$fpath.$fname)).'"';
					else
						$fxml .= ' path="'.goodxml(str_replace($mask,"",$fpath.'/'.$fname)).'"';
					$fxml .= get_file_posix_stats($fpath.'/'.$fname);
					$fxml .= "/>\n";
				}
			/*
			foreach ($children as $fname ){
				$fxml .= "\t\t\t<oldchild";
				$fxml .= ' name="'.goodxml($fname).'"';
				if ($fpath == '/')
					$fxml .= ' path="'.goodxml($fpath.$fname).'"';
				else
					$fxml .= ' path="'.goodxml($fpath.'/'.$fname).'"';
				$fxml .= get_file_posix_stats($fpath.'/'.$fname);
				if (ereg("([[:digit:]]+)",$fname) )
					$fxml .= ' seq="'.ereg_replace("[[:digit:]]+","", $fname).'"';
				$fxml .= "/>\n";
			}
			*/
		}
		$fxml .= "\t</file>\n";
		if ($fpath == '/' or str_replace($mask,"",$fpath) == '/' or str_replace($mask,"",$fpath) == '' ){
			$xml = $fxml;
		}
		else {
			# siblings
			$h = opendir(dirname($fpath));
			while ($fname = readdir($h) ){
				if ($fname == basename($fpath)){
					$xml .= $fxml;
				}
				else if ($fname != '..' && $fname != '.') {
					$xml .= "\t<sibling";
					$xml .= ' name="'.goodxml($fname).'"';
					$xml .= ' path="'.goodxml(str_replace($mask,"",dirname($fpath).'/'.$fname)).'"';
					$xml .= "/>\n";
				}
			}
			closedir($h);
			# parents
			$xml2 = "\t<parent";
			$xml2 .= ' name="'.goodxml($fname).'"';
			$xml2 .= ' path="'.goodxml(str_replace($mask,"",dirname($fpath))).'"';
			$xml2 .= ">\n";
			$xml = $xml2.$xml."</parent>\n";
		}
	}
	else $xml = "<error>file \"".str_replace($mask,"",$fpath)."\" not found</error>\n";
	return $xml;
}

function goodxml ( $fname ) {
	return str_replace('&','&amp;',$fname);
}
function get_file_type ( $fpath ) {
	if (is_dir($fpath)) return "dir";
	return "";
}

function copyFiles ( $fpathsource, $fpathdest )
{
	if(is_dir($fpathsource) && is_dir($fpathdest))
	{
		$fpath2 = realpath($fpathsource);
		$fpath3 = realpath($fpathdest);

		$h = opendir($fpathsource);
		while ($fname = readdir($h) ){
			$fpathname = $fpath2.'/'.$fname;
			if ($fname != '..' && $fname != '.' && is_file($fpathname)) {
				if(!copy($fpathname,$fpath3.'/'.$fname))
					return false;
				touch($fpath3.'/'.$fname, filemtime($fpathname));
			}
		}

		closedir($h);
	}
	else return false;

	return true;
}


function deleteFiles( $fpath )
{
	if(is_dir($fpath))
	{
		$frealpath = realpath($fpath);
		
		$p = opendir($fpath);
		while ($fname = readdir($p)){
			$fpathdel = $frealpath.'/'.$fname;
            if($fname != '..' && $fname != '.' && is_file($fpathdel)) {
				if(!unlink($fpathdel))
					return false;
			}
		}

		closedir($p);
	}
	else return false;

	return true;
}


function createDirs( $fpath )
{
	$dirs = explode("/",$fpath);
	$deb = count($dirs) - 1;
	$endpath = "/".$dirs[$deb];
	$newpath = str_replace($endpath,"",$fpath);

	while(!file_exists($newpath))
	{
		$deb--;
		$endpath = "/".$dirs[$deb].$endpath;
		$newpath = str_replace($endpath,"",$fpath);
	}

	while($deb < count($dirs))
	{
		$newpath .= "/".$dirs[$deb];
		if(!mkdir($newpath,0777)) return false;
		chmod($newpath,0777);
		$deb++;
	}

	return true;
}

function df( $path )
{
	$xml = "<total>".disk_total_space($path)."</total>";
	$xml .= "<free>".disk_free_space($path)."</free>";
	return $xml;
}
?>
