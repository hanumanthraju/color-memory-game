DROP DATABASE IF EXISTS `colour_memory`;
CREATE DATABASE `colour_memory`;
USE `colour_memory`;
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `game`;
CREATE TABLE `game` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `score` int(10) DEFAULT NULL,
  `time` int(10) DEFAULT NULL,
  `moves` int(10) DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userid_idx` (`userid`),
  CONSTRAINT `userid` FOREIGN KEY (`userid`) REFERENCES `player` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
