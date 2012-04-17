<?php
/**
 * Author Remy Lalanne
 * Copyright (c) 2005-2010 Remy Lalanne
 */
session_start();
header('Content-type: application/xml');
echo '<?xml version="1.0" encoding="UTF-8"?>'."\n";
include_once "service.php"; //$version
echo "<xml>\n";
echo '<error code="0"/>'."\n";
echo "<version>$version</version>\n";
echo "</xml>";
?>
