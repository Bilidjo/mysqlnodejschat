mysql nodejs chat with friends list support
=============
Online demo is available on http://www.adrienbaptiste.com/chatfbmysql/

## SQL data and structure

	CREATE TABLE IF NOT EXISTS `users` (
	  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
	  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
	  `pwd` varchar(80) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
	  `avatar` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
	  PRIMARY KEY (`id`)
	) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

	INSERT INTO `users` (`id`, `name`, `pwd`, `avatar`) VALUES
	(1, 'Luke', 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', 'avatar.gif'),
	(2, 'Leila', 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', 'avatar2.gif'),
	(3, 'Yoda', 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', 'avatar3.gif'),
	(4, 'Vador', 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', 'avatar4.gif');
	
	CREATE TABLE IF NOT EXISTS `friends` (
	  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
	  `friend_1` mediumint(9) NOT NULL,
	  `friend_2` mediumint(9) NOT NULL,
	  PRIMARY KEY (`id`),
	  UNIQUE KEY `friend_1` (`friend_1`,`friend_2`)
	) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

	INSERT INTO `friends` (`id`, `friend_1`, `friend_2`) VALUES
	(1, 1, 2),
	(3, 1, 4),
	(4, 2, 4),
	(2, 3, 1);

This chat is published under the MIT open source licence.
Have fun
