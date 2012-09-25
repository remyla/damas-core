SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `event` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `time` varchar(255) NOT NULL,
  `arguments` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `key` (
  `node_id` int(11) unsigned NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL DEFAULT '',
  `value` varchar(1024) NOT NULL DEFAULT '',
  PRIMARY KEY (`node_id`,`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `link` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `src_id` int(11) unsigned NOT NULL DEFAULT '0',
  `tgt_id` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `node` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL DEFAULT '',
  `parent_id` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=7 ;

CREATE TABLE IF NOT EXISTS `tag` (
  `node_id` int(11) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`node_id`,`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `user` (
  `login` varchar(32) NOT NULL DEFAULT '',
  `password` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`login`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

INSERT INTO `user` (`login`, `password`) VALUES
('admin', '43e9a4ab75570f5b');

INSERT INTO `node` (`id`, `type`, `parent_id`) VALUES
(1, 'asset', 3),
(2, 'asset', 0),
(3, 'asset', 2),
(4, 'asset', 2),
(5, 'asset', 2),
(6, 'asset', 2);

INSERT INTO `key` (`node_id`, `name`, `value`) VALUES
(1, 'username', 'admin'),
(1, 'class', 'admin'),
(1, 'label', 'administrator'),
(1, 'style', 'color: #364E64'),
(2, 'label', 'system'),
(2, 'style', 'color: #364E64'),
(3, 'label', 'users'),
(3, 'style', 'color: #364E64'),
(4, 'label', 'trash'),
(4, 'style', 'color: #364E64'),
(4, 'id', 'dam:trash'),
(5, 'label', 'templates'),
(5, 'style', 'color: #364E64'),
(6, 'label', 'log'),
(6, 'onload', 'damas.show2( project.getNodesBySQL("SELECT node_id AS id FROM `key` WHERE name=''time'' AND value!='' '' ORDER BY value DESC LIMIT 40;") );');
