-- phpMyAdmin SQL Dump
-- version 3.4.10.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 13, 2015 at 06:36 AM
-- Server version: 5.5.43
-- PHP Version: 5.3.10-1ubuntu3.18

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `socket`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat_message`
--

DROP TABLE IF EXISTS `chat_message`;
CREATE TABLE IF NOT EXISTS `chat_message` (
  `id_message` char(60) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `message` text NOT NULL,
  `kode_user_fk` varchar(20) NOT NULL,
  `nama_room_fk` char(60) NOT NULL,
  PRIMARY KEY (`id_message`),
  KEY `kode_user_fk` (`kode_user_fk`),
  KEY `nama_room_fk` (`nama_room_fk`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
CREATE TABLE IF NOT EXISTS `file` (
  `id_file` char(60) NOT NULL DEFAULT '',
  `kode_matkul_present` char(10) NOT NULL,
  `nama_matkul_present` varchar(25) NOT NULL,
  `chapter` int(2) NOT NULL,
  `kode_user_fk` varchar(20) NOT NULL,
  `path` varchar(100) NOT NULL,
  `nama_file_alias` varchar(100) NOT NULL,
  `jumHal` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_file`),
  KEY `kode_user_fk` (`kode_user_fk`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `file`
--


-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

DROP TABLE IF EXISTS `kelas`;
CREATE TABLE IF NOT EXISTS `kelas` (
  `kode_kelas` int(2) NOT NULL AUTO_INCREMENT,
  `nama_kelas` char(40) NOT NULL,
  PRIMARY KEY (`kode_kelas`),
  UNIQUE KEY `nama_kelas` (`nama_kelas`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `kelas`
--


-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
CREATE TABLE IF NOT EXISTS `sections` (
  `id_sections` char(60) NOT NULL,
  `no_section` int(2) NOT NULL,
  `judul_isi` varchar(30) NOT NULL,
  `isi_section` text NOT NULL,
  `data_transition` char(10) NOT NULL,
  `data_background` char(8) DEFAULT NULL,
  `id_present_fk` varchar(30) NOT NULL,
  PRIMARY KEY (`id_sections`),
  KEY `id_present_fk` (`id_present_fk`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sections`
--


-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `sessions`
--


-- --------------------------------------------------------

--
-- Table structure for table `slide`
--

DROP TABLE IF EXISTS `slide`;
CREATE TABLE IF NOT EXISTS `slide` (
  `id_present` varchar(30) NOT NULL DEFAULT '',
  `kode_matkul_slide` char(10) NOT NULL,
  `nama_matkul_slide` varchar(25) NOT NULL,
  `chapter` int(2) NOT NULL,
  `kode_user_fk` varchar(20) NOT NULL,
  PRIMARY KEY (`id_present`),
  KEY `kode_user_fk` (`kode_user_fk`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `slide`
--


-- --------------------------------------------------------

--
-- Table structure for table `socket_room`
--

DROP TABLE IF EXISTS `socket_room`;
CREATE TABLE IF NOT EXISTS `socket_room` (
  `nama_room` char(60) NOT NULL,
  `kode_user_fk` varchar(20) NOT NULL,
  `kode_kelas_fk` int(2) NOT NULL,
  `nama_room_alias` varchar(40) NOT NULL,
  `id_file_fk` char(60) DEFAULT NULL,
  `id_present_fk` varchar(30) DEFAULT NULL,
  `angkatan` int(4) NOT NULL,
  PRIMARY KEY (`nama_room`),
  KEY `kode_kelas_fk` (`kode_kelas_fk`),
  KEY `kode_user_fk` (`kode_user_fk`),
  KEY `id_file_fk` (`id_file_fk`),
  KEY `id_present_fk` (`id_present_fk`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `kode_user` varchar(20) NOT NULL,
  `email` varchar(35) NOT NULL,
  `password` char(60) NOT NULL,
  `nama_user` varchar(50) NOT NULL,
  `level` char(5) NOT NULL,
  `kode_kelas_fk` int(2) DEFAULT NULL,
  `tahun_angkatan` int(4) DEFAULT NULL,
  PRIMARY KEY (`kode_user`),
  UNIQUE KEY `email` (`email`),
  KEY `kode_kelas_fk` (`kode_kelas_fk`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--


-- --------------------------------------------------------

--
-- Table structure for table `user_sum`
--

DROP TABLE IF EXISTS `user_sum`;
CREATE TABLE IF NOT EXISTS `user_sum` (
  `id` char(60) NOT NULL,
  `kode_user_fk` varchar(20) NOT NULL,
  `kode_kelas_fk` int(2) NOT NULL,
  `nama_room_fk` char(60) NOT NULL,
  `statusOnline` char(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `kode_user_fk` (`kode_user_fk`),
  KEY `kode_kelas_fk` (`kode_kelas_fk`),
  KEY `nama_room_fk` (`nama_room_fk`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat_message`
--
ALTER TABLE `chat_message`
  ADD CONSTRAINT `chat_message_ibfk_3` FOREIGN KEY (`kode_user_fk`) REFERENCES `user` (`kode_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chat_message_ibfk_4` FOREIGN KEY (`nama_room_fk`) REFERENCES `socket_room` (`nama_room`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `file`
--
ALTER TABLE `file`
  ADD CONSTRAINT `file_ibfk_1` FOREIGN KEY (`kode_user_fk`) REFERENCES `user` (`kode_user`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`id_present_fk`) REFERENCES `slide` (`id_present`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `slide`
--
ALTER TABLE `slide`
  ADD CONSTRAINT `slide_ibfk_1` FOREIGN KEY (`kode_user_fk`) REFERENCES `user` (`kode_user`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `socket_room`
--
ALTER TABLE `socket_room`
  ADD CONSTRAINT `socket_room_ibfk_3` FOREIGN KEY (`kode_kelas_fk`) REFERENCES `kelas` (`kode_kelas`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `socket_room_ibfk_4` FOREIGN KEY (`kode_user_fk`) REFERENCES `user` (`kode_user`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `socket_room_ibfk_6` FOREIGN KEY (`id_file_fk`) REFERENCES `file` (`id_file`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `socket_room_ibfk_7` FOREIGN KEY (`id_present_fk`) REFERENCES `slide` (`id_present`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`kode_kelas_fk`) REFERENCES `kelas` (`kode_kelas`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `user_sum`
--
ALTER TABLE `user_sum`
  ADD CONSTRAINT `user_sum_ibfk_1` FOREIGN KEY (`kode_user_fk`) REFERENCES `user` (`kode_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_sum_ibfk_2` FOREIGN KEY (`kode_kelas_fk`) REFERENCES `kelas` (`kode_kelas`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_sum_ibfk_3` FOREIGN KEY (`nama_room_fk`) REFERENCES `socket_room` (`nama_room`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
