-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le :  lun. 20 mai 2019 à 16:37
-- Version du serveur :  10.1.38-MariaDB
-- Version de PHP :  7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `syllabus`
--

-- --------------------------------------------------------

--
-- Structure de la table `tokens`
--

CREATE TABLE `tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(70) NOT NULL,
  `refresh_token` varchar(70) NOT NULL,
  `revoquer` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `tokens`
--

INSERT INTO `tokens` (`id`, `token`, `refresh_token`, `revoquer`, `createdAt`) VALUES
(1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJhYiIsImxhc3RuY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJhYiIsImxhc3RuY', 0, '2019-05-20 12:48:32'),
(2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJhYyIsImxhc3RuY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJhYyIsImxhc3RuY', 0, '2019-05-20 12:51:18'),
(3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6ImFjQG1haWwuY29tIiwiU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6ImFjQG1haWwuY29tIiwiU', 0, '2019-05-20 12:52:35'),
(4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJhZCIsImxhc3RuY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJhZCIsImxhc3RuY', 0, '2019-05-20 13:03:58'),
(5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6ImFlQG1haWwuY29tIiwiU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6ImFlQG1haWwuY29tIiwiU', 0, '2019-05-20 13:07:10'),
(6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJhemVydHkiLCJsY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJhemVydHkiLCJsY', 0, '2019-05-20 15:32:34'),
(7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJxd2VydHkiLCJsY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJxd2VydHkiLCJsY', 0, '2019-05-20 15:49:41'),
(8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJtdHZiYXNlIiwib', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJtdHZiYXNlIiwib', 0, '2019-05-20 15:50:45'),
(9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJjYW5hbCIsImxhc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJjYW5hbCIsImxhc', 0, '2019-05-20 15:53:27'),
(10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJ0cmFjZXQiLCJsY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJ0cmFjZXQiLCJsY', 0, '2019-05-20 15:55:16');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `firstname` varchar(25) NOT NULL,
  `lastname` varchar(25) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Password` varchar(20) NOT NULL,
  `date_naissance` date NOT NULL,
  `sexe` enum('Homme','Femme','','') NOT NULL DEFAULT 'Femme',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `Email`, `Password`, `date_naissance`, `sexe`, `createdAt`) VALUES
(1, 'ab', 'ab_surname', 'ab@mail.com', '$2a$10$Ic3/sSkeXYupN', '1998-02-19', '', '2019-05-20 12:48:32'),
(2, 'ac', 'ac_surname', 'ac@mail.com', '$2a$10$YfmnX5bHmzCcm', '1998-02-19', '', '2019-05-20 12:51:18'),
(3, 'ad', 'ac_surname', 'ac@mail.com', '$2a$10$BdNG3DPMnZsPA', '1998-02-19', '', '2019-05-20 12:52:35'),
(4, 'ad', 'ad_surname', 'ad@mail.com', '$2a$10$YYuFh149/Plw0', '1998-02-19', '', '2019-05-20 13:03:57'),
(5, 'af', 'af_surname', 'ae@mail.com', '$2a$10$unjis72qJFIDd', '1998-02-17', 'Homme', '2019-05-20 13:07:10'),
(6, 'azerty', 'azertysurname', 'azerty@mail.com', '$2a$10$CiBPSUAKpV16Z', '1998-02-19', 'Femme', '2019-05-20 15:32:33'),
(7, 'qwerty', 'qwertysurname', 'qwerty@mail.com', '$2a$10$4QUIpb0PPWx9A', '1998-02-10', 'Homme', '2019-05-20 15:49:41'),
(8, 'mtvbase', 'mtvsurname', 'mtvbase@mail.com', '$2a$10$R.p2FcWzoEl/N', '0000-00-00', 'Homme', '2019-05-20 15:50:44'),
(9, 'canal', 'canalsurname', 'canal@mail.com', '$2a$10$1mHIOWZvhFZmY', '1998-05-21', 'Homme', '2019-05-20 15:53:27'),
(10, 'tracet', 'tracetsurname', 'tracet@mail.com', '$2a$10$4w5A0Kl/FPps3', '0000-00-00', 'Homme', '2019-05-20 15:55:15');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `tokens`
--
ALTER TABLE `tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
