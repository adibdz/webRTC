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

INSERT INTO `file` (`id_file`, `kode_matkul_present`, `nama_matkul_present`, `chapter`, `kode_user_fk`, `path`, `nama_file_alias`, `jumHal`) VALUES
('3jyJo4MXAxesIvcMU3AHg55y72bzrCzch1rUxpeduL5bthsRWBDbmCg7Pm08', '001', 'Database', 2, 'E3110502', '/uploadFile/', 'E3110502_01_-_Perkenalan_2015_8_4.pdf', 10),
('C8ba4LiQtErT37HgLXb8NuGEBtTzhORHsAQw8ySw9inFwOFuGtf0jzwH131d', '001', 'w', 2, 'E3110502', '/uploadFile/', 'E3110502_01_-_Perkenalan_4Wa3lIJYOm.pdf', 10);

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

INSERT INTO `kelas` (`kode_kelas`, `nama_kelas`) VALUES
(3, 'D4LJELIN'),
(1, 'D4LJIT'),
(2, 'D4MMB');

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

INSERT INTO `sections` (`id_sections`, `no_section`, `judul_isi`, `isi_section`, `data_transition`, `data_background`, `id_present_fk`) VALUES
('aCdAeUDz9AOdzybhlxtmGxfRGSNAoRpnvos4YCKEeVnRTCyjln8VmKPQvrgs', 1, 'Perangkat Cisco', 'Beberapa perangkat cisco yaitu router, bridge, switch dan hub.', 'default', '#535252', 'Cisco_Basic'),
('cR6d4bU62x6IE70nvRE8zc2xGuTsiNNmvnFEc7ne7aGyaMveh6lnHoWksEtN', 3, 'Contoh Perangkat', 'Cisco data center and backbone switches : 2900, 4000 dan 5000 Switches', 'default', '', 'Cisco_Basic'),
('KhBDGL6oKtbelLI8rXpue9ROBKqtu1OgF04YA4Y7RTdGKi3J1FyFvnLe2MMN', 1, 'asdasd', 'hgjggjh', 'default', '', 'Network_Security'),
('ZTaWQniAa3A5oR3pnsDboHf44qnLu9WT3Dj3Ow2tPu6qTiV41IoSqdLx69bJ', 2, 'Sertifikasi Cisco', '1. Association: CCNA, CCDA\r\n2. Professional:  CCNP, CCDP\r\n3. Expert: CCIE', 'cube', '#0d1368', 'Cisco_Basic');

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

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('NhxKJiPfyrNfpAmzBKm3_hADl2r9JDgI', 1439433292, '{"cookie":{"originalMaxAge":10800000,"expires":"2015-08-13T02:34:51.596Z","httpOnly":true,"path":"/"},"passport":{}}'),
('QjcNKKC9fXnOqKu8lTTqXUKxj4a9OQyK', 1438661683, '{"cookie":{"originalMaxAge":10800000,"expires":"2015-08-04T04:14:43.364Z","httpOnly":true,"path":"/"},"passport":{}}'),
('VlneUjaMNkMKe5CAn3aymCEBlozyTAvq', 1438663182, '{"cookie":{"originalMaxAge":10799995,"expires":"2015-08-04T04:39:42.388Z","httpOnly":true,"path":"/"},"passport":{}}'),
('jA5xWxgXfnCU-H7y8TeJJq7GTyXkV3ho', 1438577079, '{"cookie":{"originalMaxAge":10800000,"expires":"2015-08-03T04:44:38.842Z","httpOnly":true,"path":"/"},"passport":{"user":"2110135029"}}'),
('qhVOH4QRZ8By0-ezW-ZMQLyFOirAA7IM', 1438577837, '{"cookie":{"originalMaxAge":10800000,"expires":"2015-08-03T04:57:17.190Z","httpOnly":true,"path":"/"},"passport":{"user":"E3110502"}}');

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

INSERT INTO `slide` (`id_present`, `kode_matkul_slide`, `nama_matkul_slide`, `chapter`, `kode_user_fk`) VALUES
('Cisco_Basic', 'C0001', 'Jaringan Komputer', 1, 'E3110502'),
('Network_Security', 'N0001', 'Jaringan Komputer', 1, 'E3110504');

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

INSERT INTO `user` (`kode_user`, `email`, `password`, `nama_user`, `level`, `kode_kelas_fk`, `tahun_angkatan`) VALUES
('1', 'matthew@pens.ac.id', '$2a$08$apgtncHUYEmYO68c7EkT5ex3IT7pxo8COkKpJSe87Wa8yfdUjkitW', 'Farrell Matthew', 'Admin', NULL, NULL),
('2110130502', 'erwin@it.student.pens.ac.id', '$2a$08$heVVBsqxHiodi4LGUcZOjuXxLXR7mxc82pzXqI4/IG2.W7Jnj2IW2', 'Erwin Kurniawan', 'User', 1, 2010),
('2110135001', 'pradit@it.student.pens.ac.id', '$2a$08$05Hb9co3sQaZOhMeq8l21Oqrs3GmAtas8Dbgq4RTHCwk/R4d0EE.u', 'Praditya Eka', 'User', 1, 2010),
('2110135002', 'fahmi@it.student.pens.ac.id', '$2a$08$fHTrx2UFHY8IXI56/6Rf0uID/SzaAPV5bVMTQT3gjW6TRCd1RojyC', 'Fahmi Ghozali', 'User', 1, 2010),
('2110135003', 'faruq@it.student.pens.ac.id', '$2a$08$R9ez2ZhoVqAM7NmlrjR8QuxVanerMHR7Zf8U6zPeTucVBlb/zoeUC', 'Faruq Ibrahim', 'User', 1, 2010),
('2110135004', 'Umar@it.student.pens.ac.id', '$2a$08$CiK6RBgmS74L2G.E8CEwAeJatkdkhNh2YxNnLjgKQ8f1LXi/BWNtS', 'Umar Faiz', 'User', 1, 2010),
('2110135005', 'sandi@it.student.pens.ac.id', '$2a$08$JlhzxJJuSaqKVrzjVSHmj.B9Bjc0cHz1ItTvZin6uDllAVATo/Hhm', 'Sandi Yahya', 'User', 1, 2010),
('2110135006', 'fais@it.student.pens.ac.id', '$2a$08$./Y4tC6dNtECGX9QRWWw5./MW7bpMy0CNB2M7ma1Y8mBDcT65OBWi', 'Faiz Muklis', 'User', 1, 2010),
('2110135007', 'robit@it.student.pens.ac.id', '$2a$08$WA1kv5mfMATsInlEw1mjYe/sDXQRGIN93rirtuizfEViXoH1ROg2a', 'Robit F R', 'User', 1, 2010),
('2110135008', 'adiguna@it.student.pens.ac.id', '$2a$08$NUvMtn2f9JpDRIbk3ZBewuVSJ9IjIaPA3Y9E94qO7DgQ1htXql2ye', 'Adiguna Surya H', 'User', 1, 2010),
('2110135009', 'rudik@it.student.pens.ac.id', '$2a$08$zs3zwayVdCzXDB.UdhTxCuf0NHCnbKbHQN5s9IGy39UK.Cv9wIMw2', 'Rudik Hariyanto', 'User', 1, 2010),
('2110135010', 'ways@it.student.pens.ac.id', '$2a$08$PUfZLLUhv8EIjMgaK94tN.sGMTpiZEqUg2yn4vd2ccc0Gj4ay3JSW', 'Aulia Uways A Q', 'User', 1, 2010),
('2110135026', 'adi@it.student.pens.ac.id', '$2a$08$SLQg/BsT.XLzr8qf3OyXBeyJ7K7OoXCCj2yOTFoJRXL0BwIH3595O', 'Adi Chandra', 'User', 1, 2013),
('2110135027', 'hanafi@it.student.pens.ac.id', '$2a$08$H0gZKnM1HfbZ7wJfEpQPaOeFZCh4.Ex5Cna7A.KZbk5Z8sHqjXhUG', 'M Murti Hanafi', 'User', 1, 2010),
('2110135028', 'rizal@it.student.pens.ac.id', '$2a$08$NN3f/fpi.msdj.jrGn3RG.b6tMC7h/Rn37q3/7D5zHNFy/Sskyaym', 'M Rizal Fauzi', 'User', 1, 2010),
('2110135029', 'diki@it.student.pens.ac.id', '$2a$08$mwFy4Jyt/EySfj1VOIu6Qe1cEn/N7lFOxIwALgJlU.00ds2luglye', 'M Zidki E', 'User', 1, 2010),
('2110135338', 'dzulfikar@it.student.pens.ac.id', '$2a$08$P60JAO2EasYKM97SZb5zleqGcum9/1.SYLGIu8OCLVmk.wzvkxG8O', 'Fens Ego', 'User', 1, 2010),
('E3110502', 'adib@pens.ac.id', '$2a$08$GVeAOFerSr2rGfve9iUIAejje9ap4RSyEDmKvW6znQ.DUGX7NMVuC', 'Dzulfikar Adib', 'Dosen', NULL, NULL),
('E3110503', 'dosen@pens.ac.id', '$2a$08$YWXET9iaGLDSFG3GJ2fNA.5cWApET1LZ42qETeSUbcJBy86rw9w4i', 'Adib Dzulfikar', 'Dosen', NULL, NULL),
('E3110504', 'lec@pens.ac.id', '$2a$08$TbsxW8YJzZdGhkqJAwptJ.yg//E.iMUzJ6x3tFdWL.anBF9nVjlrW', 'Lecturer Def', 'Dosen', NULL, NULL);

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
