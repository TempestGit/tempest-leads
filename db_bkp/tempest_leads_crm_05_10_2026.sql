-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 05, 2026 at 03:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tempest_leads_crm`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `activity_type` varchar(80) NOT NULL,
  `outcome` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `occurred_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `lead_id`, `activity_type`, `outcome`, `notes`, `occurred_at`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Lead created', 'New lead created', 'Company and primary contact captured.', '2026-09-23 11:28:51', 1, '2026-09-23 16:58:51', '2026-09-23 16:58:51'),
(2, 1, 'Stage change', 'Moved from New to Contact Research', 'Research', '2026-09-23 12:26:40', 1, '2026-09-23 17:56:40', '2026-09-23 17:56:40'),
(3, 2, 'Lead created', 'New lead created', 'Company and primary contact captured.', '2026-09-23 12:43:07', 1, '2026-09-23 18:13:07', '2026-09-23 18:13:07'),
(4, 2, 'Stage change', 'Moved from New to Brief', 'Test Brief', '2026-09-23 13:17:54', 1, '2026-09-23 18:47:54', '2026-09-23 18:47:54'),
(5, 2, 'Stage change', 'Moved from Brief to New', 'new', '2026-09-23 13:19:17', 1, '2026-09-23 18:49:17', '2026-09-23 18:49:17'),
(6, 2, 'Owner changed', 'Assigned to Venu Myakam', 'Lead reassigned.', '2026-09-23 16:19:32', 1, '2026-09-23 21:49:32', '2026-09-23 21:49:32'),
(7, 1, 'Owner changed', 'Assigned to Venu Myakam', 'Lead reassigned.', '2026-09-23 16:19:42', 1, '2026-09-23 21:49:42', '2026-09-23 21:49:42'),
(8, 2, 'Owner changed', 'Assigned to Super Admin', 'Lead reassigned.', '2026-09-23 16:23:25', 1, '2026-09-23 21:53:25', '2026-09-23 21:53:25'),
(9, 1, 'Owner changed', 'Assigned to Super Admin', 'Lead reassigned.', '2026-09-23 16:23:25', 1, '2026-09-23 21:53:25', '2026-09-23 21:53:25'),
(10, 2, 'Call', 'Client interested in discussing the launch campaign', 'Spoke with Arjun. Client requested a discovery meeting this week.', '2026-09-23 16:41:29', 1, '2026-09-23 22:11:29', '2026-09-23 22:11:29'),
(11, 2, 'Activity', 'Testing add activity', 'testing', '2026-09-23 16:52:07', 1, '2026-09-23 22:22:07', '2026-09-23 22:22:07'),
(12, 1, 'Stage change', 'Moved from Contact Research to Connected', 'Connected on call', '2026-09-23 16:52:45', 1, '2026-09-23 22:22:45', '2026-09-23 22:22:45'),
(13, 2, 'Stage change', 'Moved from New to Brief', 'Testing Brief', '2026-09-23 17:07:02', 1, '2026-09-23 22:37:02', '2026-09-23 22:37:02'),
(14, 2, 'Meeting', 'Meeting scheduled', 'Nova Infra discovery meeting', '2026-09-23 17:20:03', 1, '2026-09-23 22:50:03', '2026-09-23 22:50:03'),
(15, 1, 'Meeting', 'Meeting scheduled', 'Test Schedule meeting', '2026-09-23 17:34:08', 1, '2026-09-23 23:04:08', '2026-09-23 23:04:08'),
(16, 2, 'Meeting', 'Meeting cancelled', 'testing', '2026-09-23 18:12:14', 1, '2026-09-23 23:42:14', '2026-09-23 23:42:14'),
(17, 2, 'Follow-up', 'Follow-up scheduled', 'Send discovery deck', '2026-09-23 18:34:55', 1, '2026-09-24 00:04:55', '2026-09-24 00:04:55'),
(18, 2, 'Stage change', 'Moved from Brief to Lost', 'Test Nurture', '2026-09-24 06:46:20', 1, '2026-09-24 12:16:20', '2026-09-24 12:16:20'),
(19, 2, 'Stage change', 'Moved from Lost to Connected', 'Test connected', '2026-09-24 06:47:30', 1, '2026-09-24 12:17:30', '2026-09-24 12:17:30'),
(20, 2, 'Stage change', 'Moved from Connected to Lost', 'test lost', '2026-09-24 06:49:18', 1, '2026-09-24 12:19:18', '2026-09-24 12:19:18'),
(21, 2, 'Activity', 'Nurture profile updated', 'LOST_NOT_INTERESTED', '2026-09-24 06:49:22', 1, '2026-09-24 12:19:22', '2026-09-24 12:19:22'),
(22, 2, 'Activity', 'Nurture profile updated', 'LOST_NOT_INTERESTED', '2026-09-24 06:49:51', 1, '2026-09-24 12:19:51', '2026-09-24 12:19:51'),
(23, 2, 'Follow-up', 'Nurture reconnect scheduled', 'Reconnect once the new-quarter marketing budget is confirmed.', '2026-09-24 06:50:22', 1, '2026-09-24 12:20:22', '2026-09-24 12:20:22'),
(24, 2, 'Follow-up', 'Nurture reconnect scheduled', 'Reconnect', '2026-09-24 07:01:16', 1, '2026-09-24 12:31:16', '2026-09-24 12:31:16'),
(25, 2, 'Follow-up', 'Nurture reconnect scheduled', 'Reconnect', '2026-09-24 07:17:31', 1, '2026-09-24 12:47:31', '2026-09-24 12:47:31'),
(26, 2, 'Stage change', 'Moved from Lost to Connected', 'Test Lost to connected', '2026-09-24 07:19:55', 1, '2026-09-24 12:49:55', '2026-09-24 12:49:55'),
(27, 1, 'Stage change', 'Moved from Connected to Lost', 'Test Lost', '2026-09-24 07:26:18', 1, '2026-09-24 12:56:18', '2026-09-24 12:56:18'),
(28, 1, 'Stage change', 'Moved from Lost to Nurture', 'Test Nurture', '2026-09-24 07:27:11', 1, '2026-09-24 12:57:11', '2026-09-24 12:57:11'),
(29, 1, 'Follow-up', 'Nurture reconnect scheduled', 'Reconnect Test', '2026-09-24 07:27:43', 1, '2026-09-24 12:57:43', '2026-09-24 12:57:43'),
(30, 2, 'Stage change', 'Lead closed and moved to nurture', 'No response: Testing Mark as Lost', '2026-09-24 09:08:58', 1, '2026-09-24 14:38:58', '2026-09-24 14:38:58'),
(31, 2, 'Stage change', 'Moved from Nurture to Connected', 'Test Nurture to Connected Stage', '2026-09-24 09:10:16', 1, '2026-09-24 14:40:16', '2026-09-24 14:40:16'),
(32, 2, 'Stage change', 'Moved from Connected to Nurture', 'Test Nurture', '2026-09-24 09:12:21', 1, '2026-09-24 14:42:21', '2026-09-24 14:42:21'),
(33, 2, 'Stage change', 'Moved from Nurture to Meeting', 'Test Changed to Meeting', '2026-09-24 09:14:04', 1, '2026-09-24 14:44:04', '2026-09-24 14:44:04'),
(34, 1, 'Stage change', 'Moved from Nurture to Connected', 'Testing moved nurture to connected', '2026-09-24 09:16:11', 1, '2026-09-24 14:46:11', '2026-09-24 14:46:11'),
(35, 1, 'Stage change', 'Moved from Connected to Nurture', 'Test moved to nurture', '2026-09-24 09:20:22', 1, '2026-09-24 14:50:22', '2026-09-24 14:50:22'),
(36, 1, 'Stage change', 'Moved from Nurture to Brief', 'Test Moved from nurture to Brief', '2026-09-24 09:21:30', 1, '2026-09-24 14:51:30', '2026-09-24 14:51:30'),
(37, 2, 'Brief', 'Brief created', 'Brief status: READY', '2026-09-24 09:55:06', 1, '2026-09-24 15:25:06', '2026-09-24 15:25:06'),
(38, 2, 'Stage change', 'Moved from Meeting to Brief', 'Test Brief', '2026-09-24 09:55:52', 1, '2026-09-24 15:25:52', '2026-09-24 15:25:52'),
(39, 1, 'Team assignment', 'Strategy assigned to Venu Myakam', 'Due date: 5/10/2026, 5:30:00 pm', '2026-09-24 10:08:49', 1, '2026-09-24 15:38:49', '2026-09-24 15:38:49'),
(40, 2, 'Team assignment', 'Account / Servicing assigned to Venu Myakam', 'Due date: 30/9/2026, 12:00:00 pm', '2026-09-24 10:44:47', 1, '2026-09-24 16:14:47', '2026-09-24 16:14:47'),
(41, 2, 'Team assignment', 'Account / Servicing status changed to PENDING', NULL, '2026-09-24 10:45:13', 1, '2026-09-24 16:15:13', '2026-09-24 16:15:13'),
(42, 2, 'Team assignment', 'Account / Servicing status changed to IN_PROGRESS', NULL, '2026-09-24 10:45:18', 1, '2026-09-24 16:15:18', '2026-09-24 16:15:18'),
(43, 2, 'Team assignment', 'Account / Servicing status changed to COMPLETED', NULL, '2026-09-24 10:45:30', 1, '2026-09-24 16:15:30', '2026-09-24 16:15:30'),
(44, 2, 'Team assignment', 'Account / Servicing status changed to PENDING', NULL, '2026-09-24 10:45:32', 1, '2026-09-24 16:15:32', '2026-09-24 16:15:32'),
(45, 2, 'Team assignment', 'Account / Servicing status changed to IN_PROGRESS', NULL, '2026-09-24 10:45:38', 1, '2026-09-24 16:15:38', '2026-09-24 16:15:38'),
(46, 2, 'Team assignment', 'Creative assigned to Venu Myakam', 'Due date: 24/9/2026, 4:16:00 pm', '2026-09-24 10:46:12', 1, '2026-09-24 16:16:12', '2026-09-24 16:16:12'),
(47, 2, 'Team assignment', 'Strategy assigned to Venu Myakam', 'Due date: 24/9/2026, 4:16:00 pm', '2026-09-24 10:46:28', 1, '2026-09-24 16:16:28', '2026-09-24 16:16:28'),
(48, 2, 'Owner changed', 'Assigned to Venu Myakam', 'Lead reassigned.', '2026-09-24 12:29:12', 1, '2026-09-24 17:59:12', '2026-09-24 17:59:12'),
(49, 3, 'Lead created', 'New lead created', 'Company and primary contact captured.', '2026-09-28 04:49:47', 2, '2026-09-28 10:19:47', '2026-09-28 10:19:47'),
(50, 1, 'Meeting', 'Test', 'Completed meeting', '2026-09-28 04:53:22', 1, '2026-09-28 10:23:22', '2026-09-28 10:23:22'),
(51, 4, 'Lead created', 'New lead created', 'Company and primary contact captured.', '2026-09-28 11:57:22', 1, '2026-09-28 17:27:22', '2026-09-28 17:27:22'),
(52, 5, 'Lead created', 'New lead created', 'Company and primary contact captured.', '2026-09-28 12:10:37', 1, '2026-09-28 17:40:37', '2026-09-28 17:40:37'),
(53, 6, 'Lead created', 'New lead created', 'Company, primary contact and lead created. Primary branch: Hyderabad.', '2026-09-29 06:57:08', 1, '2026-09-29 12:27:08', '2026-09-29 12:27:08'),
(54, 6, 'Meeting', 'Meeting scheduled', 'Call with Client', '2026-09-29 07:22:17', 4, '2026-09-29 12:52:17', '2026-09-29 12:52:17'),
(55, 6, 'Owner changed', 'Assigned to Venu Myakam', 'Testing Assign owner', '2026-09-29 07:28:00', 1, '2026-09-29 12:58:00', '2026-09-29 12:58:00'),
(56, 6, 'Owner changed', 'Assigned to Subroto', 'Changed to Subroto', '2026-09-29 07:28:42', 1, '2026-09-29 12:58:42', '2026-09-29 12:58:42'),
(57, 6, 'Owner changed', 'Assigned to Venu Myakam', 'testing change owner', '2026-09-29 08:26:43', 1, '2026-09-29 13:56:43', '2026-09-29 13:56:43'),
(58, 6, 'Owner changed', 'Assigned to Subroto', 'Test success', '2026-09-29 08:27:15', 1, '2026-09-29 13:57:15', '2026-09-29 13:57:15'),
(59, 6, 'Team assignment', 'Strategy assigned to Test Hyderabad Owner', 'Cross-branch assignment: Hyderabad → Pune', '2026-09-29 08:39:53', 1, '2026-09-29 14:09:53', '2026-09-29 14:09:53'),
(60, 6, 'Team assignment', 'Account / Servicing assigned to Subroto', 'Branch: Hyderabad', '2026-09-29 08:40:20', 1, '2026-09-29 14:10:20', '2026-09-29 14:10:20'),
(61, 6, 'Team assignment', 'Strategy status changed to IN_PROGRESS', NULL, '2026-09-29 08:40:41', 1, '2026-09-29 14:10:41', '2026-09-29 14:10:41'),
(62, 6, 'Stage change', 'Moved from New to Contact Research', 'gg', '2026-09-29 10:32:31', 1, '2026-09-29 16:02:31', '2026-09-29 16:02:31'),
(63, 6, 'Team assignment', 'Account / Servicing status changed to COMPLETED', NULL, '2026-09-29 11:22:33', 1, '2026-09-29 16:52:33', '2026-09-29 16:52:33'),
(64, 6, 'Brief', 'Brief created', 'Brief status: APPROVED', '2026-09-29 13:12:07', 1, '2026-09-29 18:42:07', '2026-09-29 18:42:07'),
(65, 6, 'Stage change', 'Moved from Contact Research to Brief', 'Brief Received', '2026-09-30 11:04:42', 1, '2026-09-30 16:34:42', '2026-09-30 16:34:42'),
(66, 6, 'Stage change', 'Moved from Brief to New', 'Move back to new stage', '2026-09-30 11:08:55', 1, '2026-09-30 16:38:55', '2026-09-30 16:38:55'),
(67, 6, 'Stage change', 'Moved from New to Contact Research', 'next stage', '2026-09-30 11:10:24', 1, '2026-09-30 16:40:24', '2026-09-30 16:40:24'),
(68, 6, 'Stage change', 'Moved from Contact Research to Connected', 'moved to new stage', '2026-09-30 11:11:08', 1, '2026-09-30 16:41:08', '2026-09-30 16:41:08'),
(69, 6, 'Stage change', 'Moved from Connected to Meeting', 'moved to next stage meeting', '2026-09-30 11:11:33', 1, '2026-09-30 16:41:33', '2026-09-30 16:41:33'),
(70, 6, 'Stage change', 'Moved from Meeting to Brief', 'Changed to Brief stage, Brief received', '2026-09-30 11:12:13', 1, '2026-09-30 16:42:13', '2026-09-30 16:42:13'),
(71, 7, 'Lead created', 'New lead created', 'Company, primary contact and lead created. Primary branch: Hyderabad.', '2026-10-01 05:55:35', 1, '2026-10-01 11:25:35', '2026-10-01 11:25:35'),
(72, 8, 'Lead created', 'New lead created', 'Company, primary contact and lead created. Primary branch: Hyderabad.', '2026-10-01 06:22:14', 1, '2026-10-01 11:52:14', '2026-10-01 11:52:14'),
(73, 8, 'Follow-up', 'follow up completed', 'completed', '2026-10-01 07:25:31', 1, '2026-10-01 12:55:31', '2026-10-01 12:55:31'),
(74, 8, 'Follow-up', 'Follow-up scheduled', 'meeting', '2026-10-01 08:55:46', 1, '2026-10-01 14:25:46', '2026-10-01 14:25:46'),
(75, 8, 'Activity', 'test', 'test', '2026-10-01 08:56:04', 1, '2026-10-01 14:26:04', '2026-10-01 14:26:04'),
(76, 8, 'Meeting', 'Meeting scheduled', 'test time', '2026-10-01 09:11:04', 1, '2026-10-01 14:41:04', '2026-10-01 14:41:04'),
(77, 8, 'Follow-up', 'Follow-up scheduled', 'brief follow up', '2026-10-01 09:12:00', 1, '2026-10-01 14:42:00', '2026-10-01 14:42:00'),
(78, 8, 'Follow-up', 'Completed follow-up', 'Completed follow-up', '2026-10-01 09:12:57', 1, '2026-10-01 14:42:57', '2026-10-01 14:42:57'),
(79, 8, 'Follow-up', 'Follow-up rescheduled', 'Client not available', '2026-10-01 09:14:30', 1, '2026-10-01 14:44:30', '2026-10-01 14:44:30'),
(80, 8, 'Activity', 'test add activity date function', 'Testing date function', '2026-10-01 09:19:26', 1, '2026-10-01 14:49:26', '2026-10-01 14:49:26'),
(81, 8, 'Follow-up', 'Follow-up scheduled', 'test follow up time', '2026-10-05 06:33:39', 1, '2026-10-05 12:03:39', '2026-10-05 12:03:39'),
(82, 9, 'Lead created', 'New lead created', 'Company, primary contact and lead created. Primary branch: Hyderabad.', '2026-10-05 09:17:45', 1, '2026-10-05 14:47:45', '2026-10-05 14:47:45'),
(83, 9, 'Activity', 'Record an interaction', 'Testing', '2026-10-05 09:30:22', 1, '2026-10-05 15:00:22', '2026-10-05 15:00:22'),
(84, 8, 'Stage change', 'Moved from New to Contact Research', 'test', '2026-10-05 10:27:01', 1, '2026-10-05 15:57:01', '2026-10-05 15:57:01'),
(85, 7, 'Stage change', 'Moved from New to Meeting', 'test', '2026-10-05 10:27:10', 1, '2026-10-05 15:57:10', '2026-10-05 15:57:10'),
(86, 5, 'Stage change', 'Moved from New to Pitch', 'test', '2026-10-05 10:27:52', 1, '2026-10-05 15:57:52', '2026-10-05 15:57:52'),
(87, 4, 'Stage change', 'Moved from New to Commercials', 'test', '2026-10-05 10:28:04', 1, '2026-10-05 15:58:04', '2026-10-05 15:58:04'),
(88, 3, 'Stage change', 'Moved from New to Contract / PO', 'test', '2026-10-05 10:28:16', 1, '2026-10-05 15:58:16', '2026-10-05 15:58:16'),
(89, 2, 'Stage change', 'Moved from Brief to Onboarding', 'test', '2026-10-05 10:28:31', 1, '2026-10-05 15:58:31', '2026-10-05 15:58:31'),
(90, 1, 'Stage change', 'Moved from Brief to Active Client', 'test', '2026-10-05 10:28:43', 1, '2026-10-05 15:58:43', '2026-10-05 15:58:43'),
(91, 10, 'Lead created', 'New lead created', 'Company, primary contact and lead created. Primary branch: Hyderabad.', '2026-10-05 10:30:27', 1, '2026-10-05 16:00:27', '2026-10-05 16:00:27'),
(92, 10, 'Stage change', 'Moved from New to Nurture', 'test', '2026-10-05 10:30:40', 1, '2026-10-05 16:00:40', '2026-10-05 16:00:40'),
(93, 10, 'Lead edited', 'Lead details updated', 'Lead profile information was updated.', '2026-10-05 11:46:34', 1, '2026-10-05 17:16:34', '2026-10-05 17:16:34'),
(94, 11, 'Lead created', 'New lead created', 'Company, primary contact and lead created. Primary branch: Hyderabad.', '2026-10-05 11:50:00', 1, '2026-10-05 17:20:00', '2026-10-05 17:20:00'),
(95, 11, 'Lead edited', 'Lead details updated', 'Lead profile information was updated.', '2026-10-05 12:04:05', 1, '2026-10-05 17:34:05', '2026-10-05 17:34:05'),
(96, 11, 'Owner changed', 'Assigned to Subroto', 'Lead details updated.', '2026-10-05 12:04:05', 1, '2026-10-05 17:34:05', '2026-10-05 17:34:05');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `actor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `entity_type` varchar(80) NOT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(120) NOT NULL,
  `previous_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`previous_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `actor_user_id`, `entity_type`, `entity_id`, `action`, `previous_values`, `new_values`, `metadata`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'COMPANY', 1, 'COMPANY_CREATED', NULL, '{\"id\":1,\"companyCode\":\"CMP-14A8510DE9\",\"name\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://asterhabitat.com\",\"agencyRelationship\":\"Media partner only\",\"source\":\"Referral\",\"status\":\"ACTIVE\",\"notes\":\"Potential integrated campaign opportunity.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T11:34:43.000Z\",\"updatedAt\":\"2026-09-23T11:34:43.000Z\"}', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 11:34:43'),
(2, 1, 'COMPANY', 2, 'COMPANY_CREATED', NULL, '{\"id\":2,\"companyCode\":\"CMP-C1AC6ED5E5\",\"name\":\"Northstar Foods\",\"industry\":\"FMCG\",\"city\":\"Bengaluru\",\"state\":\"Karnataka\",\"country\":\"India\",\"website\":\"https://northstarfoods.com\",\"agencyRelationship\":\"Existing creative agency\",\"source\":\"LinkedIn\",\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T12:04:32.000Z\",\"updatedAt\":\"2026-09-23T12:04:32.000Z\"}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:04:32'),
(3, 1, 'COMPANY', 1, 'COMPANY_UPDATED', '{\"id\":1,\"companyCode\":\"CMP-14A8510DE9\",\"name\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://asterhabitat.com\",\"agencyRelationship\":\"Media partner only\",\"source\":\"Referral\",\"status\":\"ACTIVE\",\"notes\":\"Potential integrated campaign opportunity.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T11:34:43.000Z\",\"updatedAt\":\"2026-09-23T11:34:43.000Z\"}', '{\"id\":1,\"companyCode\":\"CMP-14A8510DE9\",\"name\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://asterhabitat.com\",\"agencyRelationship\":\"Media partner only\",\"source\":\"Referral\",\"status\":\"NURTURE\",\"notes\":\"Potential integrated campaign opportunity.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T11:34:43.000Z\",\"updatedAt\":\"2026-09-23T12:06:10.000Z\"}', '{\"changedFields\":[\"name\",\"industry\",\"city\",\"state\",\"country\",\"website\",\"agencyRelationship\",\"source\",\"status\",\"notes\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:06:10'),
(4, 1, 'COMPANY', 1, 'COMPANY_UPDATED', '{\"id\":1,\"companyCode\":\"CMP-14A8510DE9\",\"name\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://asterhabitat.com\",\"agencyRelationship\":\"Media partner only\",\"source\":\"Referral\",\"status\":\"NURTURE\",\"notes\":\"Potential integrated campaign opportunity.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T11:34:43.000Z\",\"updatedAt\":\"2026-09-23T12:06:10.000Z\"}', '{\"id\":1,\"companyCode\":\"CMP-14A8510DE9\",\"name\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://asterhabitat.com\",\"agencyRelationship\":\"Media partner only\",\"source\":\"Referral\",\"status\":\"ACTIVE\",\"notes\":\"Potential integrated campaign opportunity.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T11:34:43.000Z\",\"updatedAt\":\"2026-09-23T12:06:34.000Z\"}', '{\"changedFields\":[\"name\",\"industry\",\"city\",\"state\",\"country\",\"website\",\"agencyRelationship\",\"source\",\"status\",\"notes\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:06:34'),
(5, 1, 'COMPANY', 3, 'COMPANY_CREATED', NULL, '{\"id\":3,\"companyCode\":\"CMP-1003\",\"name\":\"BluePeak Technologies\",\"industry\":\"Information Technology\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://bluepeaktech.example.com\",\"agencyRelationship\":\"No existing agency\",\"source\":\"Website Enquiry\",\"status\":\"ACTIVE\",\"notes\":\"Follow up next quarter regarding employer branding requirements\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T14:18:41.000Z\",\"updatedAt\":\"2026-09-23T14:18:41.000Z\"}', '{\"companyCode\":\"CMP-1003\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:18:41'),
(6, 1, 'COMPANY', 3, 'COMPANY_DELETED', '{\"id\":3,\"companyCode\":\"CMP-1003\",\"name\":\"BluePeak Technologies\",\"industry\":\"Information Technology\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://bluepeaktech.example.com\",\"agencyRelationship\":\"No existing agency\",\"source\":\"Website Enquiry\",\"status\":\"ACTIVE\",\"notes\":\"Follow up next quarter regarding employer branding requirements\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T14:18:41.000Z\",\"updatedAt\":\"2026-09-23T14:18:41.000Z\"}', NULL, '{\"deletionType\":\"SOFT_DELETE\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:19:11'),
(7, 1, 'COMPANY', 1, 'COMPANY_CREATED', NULL, '{\"id\":1,\"companyCode\":\"CMP-1001\",\"name\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://asterhabitat.example.com\",\"agencyRelationship\":\"Media partner only\",\"source\":\"Referral\",\"status\":\"ACTIVE\",\"notes\":\"Potential integrated branding and digital campaign opportunity.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T14:24:50.000Z\",\"updatedAt\":\"2026-09-23T14:24:50.000Z\"}', '{\"companyCode\":\"CMP-1001\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:24:50'),
(8, 1, 'COMPANY', 2, 'COMPANY_CREATED', NULL, '{\"id\":2,\"companyCode\":\"CMP-1002\",\"name\":\"Northstar Foods\",\"industry\":\"FMCG\",\"city\":\"Bengaluru\",\"state\":\"Karnataka\",\"country\":\"India\",\"website\":\"https://northstarfoods.example.com\",\"agencyRelationship\":\"Existing creative agency\",\"source\":\"LinkedIn\",\"status\":\"ACTIVE\",\"notes\":\"Interested in social media and performance marketing.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T14:25:46.000Z\",\"updatedAt\":\"2026-09-23T14:25:46.000Z\"}', '{\"companyCode\":\"CMP-1002\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:25:46'),
(9, 1, 'COMPANY', 3, 'COMPANY_CREATED', NULL, '{\"id\":3,\"companyCode\":\"CMP-1003\",\"name\":\"BluePeak Technologies\",\"industry\":\"Information Technology\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"website\":\"https://bluepeaktech.example.com\",\"agencyRelationship\":\"No existing agency\",\"source\":\"Website Enquiry\",\"status\":\"NURTURE\",\"notes\":\"Follow up next quarter regarding employer branding requirements.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T14:26:46.000Z\",\"updatedAt\":\"2026-09-23T14:26:46.000Z\"}', '{\"companyCode\":\"CMP-1003\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:26:46'),
(10, 1, 'COMPANY', 4, 'COMPANY_CREATED', NULL, '{\"id\":4,\"companyCode\":\"CMP-1004\",\"name\":\"UrbanNest Developers\",\"industry\":\"Real Estate\",\"city\":\"Pune\",\"state\":\"Maharashtra\",\"country\":\"India\",\"website\":\"https://urbannest.example.com\",\"agencyRelationship\":\"Working with another digital agency\",\"source\":\"Event\",\"status\":\"ACTIVE\",\"notes\":\"Looking for campaign strategy for a new residential project.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T14:27:34.000Z\",\"updatedAt\":\"2026-09-23T14:27:34.000Z\"}', '{\"companyCode\":\"CMP-1004\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:27:34'),
(11, 1, 'COMPANY', 5, 'COMPANY_CREATED', NULL, '{\"id\":5,\"companyCode\":\"CMP-1005\",\"name\":\"GreenLeaf Healthcare\",\"industry\":\"Healthcare\",\"city\":\"Mumbai\",\"state\":\"Maharashtra\",\"country\":\"India\",\"website\":\"https://greenleafhealth.example.com\",\"agencyRelationship\":\"In-house marketing team\",\"source\":\"Cold Outreach\",\"status\":\"NURTURE\",\"notes\":\"Decision expected after internal budget approval.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T14:28:20.000Z\",\"updatedAt\":\"2026-09-23T14:28:20.000Z\"}', '{\"companyCode\":\"CMP-1005\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:28:20'),
(12, 1, 'COMPANY', 6, 'COMPANY_CREATED', NULL, '{\"id\":6,\"companyCode\":\"CMP-1006\",\"name\":\"Vertex Mobility\",\"industry\":\"Automotive\",\"city\":\"Chennai\",\"state\":\"Tamil Nadu\",\"country\":\"India\",\"website\":\"https://vertexmobility.example.com\",\"agencyRelationship\":\"Creative agency retained\",\"source\":\"Referral\",\"status\":\"ACTIVE\",\"notes\":\"Potential requirement for digital media planning and campaign execution.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T14:29:15.000Z\",\"updatedAt\":\"2026-09-23T14:29:15.000Z\"}', '{\"companyCode\":\"CMP-1006\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:29:15'),
(13, 1, 'COMPANY', 7, 'COMPANY_CREATED', NULL, '{\"id\":7,\"companyCode\":\"CMP-1007\",\"name\":\"Tempest\",\"industry\":\"Other\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"website\":\"https://www.tempestadvertising.com/\",\"agencyRelationship\":\"Creative agency\",\"source\":\"Other\",\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T16:15:16.000Z\",\"updatedAt\":\"2026-09-23T16:15:16.000Z\",\"contactsCount\":0}', '{\"companyCode\":\"CMP-1007\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:15:16'),
(14, 1, 'CONTACT', 1, 'CONTACT_CREATED', NULL, '{\"id\":1,\"contactCode\":\"CON-2001\",\"companyId\":1,\"companyCode\":\"CMP-1001\",\"companyName\":\"Aster Habitat\",\"name\":\"Ravi Menon\",\"designation\":\"Chief Marketing Officer\",\"phone\":\"9000010001\",\"email\":\"ravi@asterhabitat.demo\",\"isDecisionMaker\":true,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T16:32:08.000Z\",\"updatedAt\":\"2026-09-23T16:32:08.000Z\"}', '{\"contactCode\":\"CON-2001\",\"companyId\":1}', '::1', 'PostmanRuntime/2.7.0', '2026-09-23 16:32:08'),
(15, 1, 'CONTACT', 2, 'CONTACT_CREATED', NULL, '{\"id\":2,\"contactCode\":\"CON-2002\",\"companyId\":3,\"companyCode\":\"CMP-1003\",\"companyName\":\"BluePeak Technologies\",\"name\":\"Bala\",\"designation\":\"Developer\",\"phone\":\"7894561230\",\"email\":\"bala@gmail.com\",\"isDecisionMaker\":true,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T16:39:07.000Z\",\"updatedAt\":\"2026-09-23T16:39:07.000Z\"}', '{\"contactCode\":\"CON-2002\",\"companyId\":3}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:39:07'),
(16, 1, 'LEAD', 1, 'LEAD_CREATED', NULL, '{\"id\":1,\"leadCode\":\"LED-3001\",\"companyId\":1,\"companyCode\":\"CMP-1001\",\"companyName\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"website\":\"https://asterhabitat.example.com\",\"primaryContactId\":1,\"primaryContactCode\":\"CON-2001\",\"primaryContactName\":\"Ravi Menon\",\"primaryContactDesignation\":\"Chief Marketing Officer\",\"primaryContactPhone\":\"9000010001\",\"primaryContactEmail\":\"ravi@asterhabitat.demo\",\"ownerId\":1,\"ownerCode\":\"USR-C39E1A159C\",\"ownerName\":\"Super Admin\",\"ownerRole\":\"SUPER_ADMIN\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"Referral\",\"serviceRequired\":\"Integrated launch campaign\",\"estimatedValuePaise\":250000000,\"nextAction\":\"Review client feedback\",\"followUpAt\":\"2026-09-24T10:30:00.000Z\",\"lastTouchAt\":\"2026-09-23T11:28:51.000Z\",\"knownRelationship\":false,\"lifecycleReason\":null,\"description\":\"Residential launch campaign with digital and media requirements.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T16:58:51.000Z\",\"updatedAt\":\"2026-09-23T16:58:51.000Z\",\"stageAgeDays\":0,\"estimatedValueRupees\":2500000}', '{\"leadCode\":\"LED-3001\",\"followupCode\":\"FUP-5DEB3A9727\"}', '::1', 'PostmanRuntime/2.7.0', '2026-09-23 16:58:51'),
(17, 1, 'LEAD', 1, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Contact Research\",\"status\":\"Open\"}', '{\"reason\":\"Research\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:56:40'),
(18, 1, 'LEAD', 2, 'LEAD_CREATED', NULL, '{\"id\":2,\"leadCode\":\"LED-3002\",\"companyId\":8,\"companyCode\":\"CMP-1008\",\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"website\":\"https://novainfra.example.com\",\"primaryContactId\":3,\"primaryContactCode\":\"CON-2003\",\"primaryContactName\":\"Arjun Reddy\",\"primaryContactDesignation\":\"Marketing Manager\",\"primaryContactPhone\":\"9876543210\",\"primaryContactEmail\":\"arjun.reddy@novainfra.example.com\",\"ownerId\":1,\"ownerCode\":\"USR-C39E1A159C\",\"ownerName\":\"Super Admin\",\"ownerRole\":\"SUPER_ADMIN\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"LinkedIn\",\"serviceRequired\":\"Integrated branding and digital launch campaign\",\"estimatedValuePaise\":180000000,\"nextAction\":\"Schedule discovery meeting\",\"followUpAt\":\"2026-09-25T04:30:00.000Z\",\"lastTouchAt\":\"2026-09-23T12:43:07.000Z\",\"knownRelationship\":false,\"lifecycleReason\":null,\"description\":\"Client is planning a residential project launch and requires branding, social media, digital advertising, lead generation and campaign strategy.\",\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-23T18:13:07.000Z\",\"updatedAt\":\"2026-09-23T18:13:07.000Z\",\"stageAgeDays\":0,\"estimatedValueRupees\":1800000}', '{\"leadCode\":\"LED-3002\",\"companyCode\":\"CMP-1008\",\"contactCode\":\"CON-2003\",\"followupCode\":\"FUP-B7DABCF4AA\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:13:07'),
(19, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"reason\":\"Test Brief\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:47:54'),
(20, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"reason\":\"new\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:49:17'),
(21, 1, 'LEAD', 2, 'LEAD_OWNER_CHANGED', '{\"ownerId\":1,\"ownerName\":\"Super Admin\"}', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"reason\":null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:49:32'),
(22, 1, 'LEAD', 1, 'LEAD_OWNER_CHANGED', '{\"ownerId\":1,\"ownerName\":\"Super Admin\"}', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"reason\":null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:49:42'),
(23, 1, 'LEAD', 2, 'LEAD_OWNER_CHANGED', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"ownerId\":1,\"ownerName\":\"Super Admin\"}', '{\"reason\":null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:53:25'),
(24, 1, 'LEAD', 1, 'LEAD_OWNER_CHANGED', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"ownerId\":1,\"ownerName\":\"Super Admin\"}', '{\"reason\":null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:53:25'),
(25, 1, 'ACTIVITY', 10, 'ACTIVITY_CREATED', NULL, '{\"id\":10,\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"New\",\"leadOwnerId\":1,\"companyId\":8,\"companyCode\":\"CMP-1008\",\"companyName\":\"Nova Infra Projects\",\"contactId\":3,\"contactCode\":\"CON-2003\",\"contactName\":\"Arjun Reddy\",\"activityType\":\"Call\",\"outcome\":\"Client interested in discussing the launch campaign\",\"notes\":\"Spoke with Arjun. Client requested a discovery meeting this week.\",\"occurredAt\":\"2026-09-23T16:41:29.000Z\",\"createdBy\":1,\"createdByName\":\"Super Admin\"}', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"followupCode\":\"FUP-90717E3099\"}', '::1', 'PostmanRuntime/2.7.0', '2026-09-23 22:11:29'),
(26, 1, 'ACTIVITY', 11, 'ACTIVITY_CREATED', NULL, '{\"id\":11,\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"New\",\"leadOwnerId\":1,\"companyId\":8,\"companyCode\":\"CMP-1008\",\"companyName\":\"Nova Infra Projects\",\"contactId\":3,\"contactCode\":\"CON-2003\",\"contactName\":\"Arjun Reddy\",\"activityType\":\"Activity\",\"outcome\":\"Testing add activity\",\"notes\":\"testing\",\"occurredAt\":\"2026-09-23T16:52:07.000Z\",\"createdBy\":1,\"createdByName\":\"Super Admin\"}', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"followupCode\":\"FUP-411332F14A\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:22:07'),
(27, 1, 'LEAD', 1, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Contact Research\",\"status\":\"Open\"}', '{\"stage\":\"Connected\",\"status\":\"Open\"}', '{\"reason\":\"Connected on call\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:22:45'),
(28, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"reason\":\"Testing Brief\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:37:02'),
(29, 1, 'MEETING', 1, 'MEETING_CREATED', NULL, '{\"id\":1,\"meetingCode\":\"MET-1001\",\"leadId\":2,\"leadCode\":\"LED-3002\",\"companyName\":\"Nova Infra Projects\",\"contactId\":3,\"contactCode\":\"CON-2003\",\"contactName\":\"Arjun Reddy\",\"title\":\"Nova Infra discovery meeting\",\"startsAt\":\"2026-09-25T05:30:00.000Z\",\"endsAt\":\"2026-09-25T06:30:00.000Z\",\"meetingType\":\"VIDEO_CALL\",\"status\":\"SCHEDULED\",\"participantsJson\":\"[\\\"Arjun Reddy\\\",\\\"Super Admin\\\"]\",\"meetingUrl\":\"https://meet.example.com/nova-discovery\",\"location\":null,\"agenda\":\"Understand launch timeline, campaign objectives and media requirements.\",\"notes\":null,\"outcome\":null,\"nextAction\":null,\"followUpAt\":null,\"completedAt\":null,\"completedBy\":null,\"statusReason\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":null,\"ownerId\":1,\"ownerName\":\"Super Admin\",\"createdAt\":\"2026-09-23T22:50:03.000Z\",\"updatedAt\":\"2026-09-23T22:50:03.000Z\",\"participants\":[\"Arjun Reddy\",\"Super Admin\"]}', '{\"meetingCode\":\"MET-1001\",\"leadCode\":\"LED-3002\"}', '::1', 'PostmanRuntime/2.7.0', '2026-09-23 22:50:03'),
(30, 1, 'MEETING', 2, 'MEETING_CREATED', NULL, '{\"id\":2,\"meetingCode\":\"MET-1002\",\"leadId\":1,\"leadCode\":\"LED-3001\",\"companyName\":\"Aster Habitat\",\"contactId\":1,\"contactCode\":\"CON-2001\",\"contactName\":\"Ravi Menon\",\"title\":\"Test Schedule meeting\",\"startsAt\":\"2026-09-24T05:30:00.000Z\",\"endsAt\":\"2026-09-24T06:30:00.000Z\",\"meetingType\":\"PHONE_CALL\",\"status\":\"SCHEDULED\",\"participantsJson\":null,\"meetingUrl\":null,\"location\":null,\"agenda\":\"Testing Schedule meeting\",\"notes\":null,\"outcome\":null,\"nextAction\":null,\"followUpAt\":null,\"completedAt\":null,\"completedBy\":null,\"statusReason\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":null,\"ownerId\":1,\"ownerName\":\"Super Admin\",\"createdAt\":\"2026-09-23T23:04:08.000Z\",\"updatedAt\":\"2026-09-23T23:04:08.000Z\",\"participants\":[]}', '{\"meetingCode\":\"MET-1002\",\"leadCode\":\"LED-3001\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:04:08'),
(31, 1, 'MEETING', 1, 'MEETING_CANCELLED', '{\"id\":1,\"meetingCode\":\"MET-1001\",\"leadId\":2,\"leadCode\":\"LED-3002\",\"companyName\":\"Nova Infra Projects\",\"contactId\":3,\"contactCode\":\"CON-2003\",\"contactName\":\"Arjun Reddy\",\"title\":\"Nova Infra discovery meeting\",\"startsAt\":\"2026-09-25T05:30:00.000Z\",\"endsAt\":\"2026-09-25T06:30:00.000Z\",\"meetingType\":\"VIDEO_CALL\",\"status\":\"SCHEDULED\",\"participantsJson\":\"[\\\"Arjun Reddy\\\",\\\"Super Admin\\\"]\",\"meetingUrl\":\"https://meet.example.com/nova-discovery\",\"location\":null,\"agenda\":\"Understand launch timeline, campaign objectives and media requirements.\",\"notes\":null,\"outcome\":null,\"nextAction\":null,\"followUpAt\":null,\"completedAt\":null,\"completedBy\":null,\"statusReason\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":null,\"ownerId\":1,\"ownerName\":\"Super Admin\",\"createdAt\":\"2026-09-23T22:50:03.000Z\",\"updatedAt\":\"2026-09-23T22:50:03.000Z\",\"participants\":[\"Arjun Reddy\",\"Super Admin\"]}', '{\"id\":1,\"meetingCode\":\"MET-1001\",\"leadId\":2,\"leadCode\":\"LED-3002\",\"companyName\":\"Nova Infra Projects\",\"contactId\":3,\"contactCode\":\"CON-2003\",\"contactName\":\"Arjun Reddy\",\"title\":\"Nova Infra discovery meeting\",\"startsAt\":\"2026-09-25T05:30:00.000Z\",\"endsAt\":\"2026-09-25T06:30:00.000Z\",\"meetingType\":\"VIDEO_CALL\",\"status\":\"CANCELLED\",\"participantsJson\":\"[\\\"Arjun Reddy\\\",\\\"Super Admin\\\"]\",\"meetingUrl\":\"https://meet.example.com/nova-discovery\",\"location\":null,\"agenda\":\"Understand launch timeline, campaign objectives and media requirements.\",\"notes\":null,\"outcome\":null,\"nextAction\":null,\"followUpAt\":null,\"completedAt\":null,\"completedBy\":null,\"statusReason\":\"testing\",\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":null,\"ownerId\":1,\"ownerName\":\"Super Admin\",\"createdAt\":\"2026-09-23T22:50:03.000Z\",\"updatedAt\":\"2026-09-23T23:42:14.000Z\",\"participants\":[\"Arjun Reddy\",\"Super Admin\"]}', '{\"reason\":\"testing\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:42:14'),
(32, 1, 'FOLLOWUP', 5, 'FOLLOWUP_CREATED', NULL, '{\"id\":5,\"followupCode\":\"FUP-B473D6A191\",\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Brief\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-09-23T18:34:55.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyName\":\"Nova Infra Projects\",\"contactName\":\"Arjun Reddy\",\"contactPhone\":\"9876543210\",\"contactEmail\":\"arjun.reddy@novainfra.example.com\",\"assignedTo\":1,\"assignedToName\":\"Super Admin\",\"action\":\"Send discovery deck\",\"dueAt\":\"2026-09-25T04:30:00.000Z\",\"priority\":\"High\",\"status\":\"PENDING\",\"notes\":\"Send deck before the client review call.\",\"outcome\":null,\"completedAt\":null,\"completedBy\":null,\"completedByName\":null,\"successorFollowupId\":null,\"statusReason\":null,\"createdAt\":\"2026-09-24T00:04:55.000Z\",\"updatedAt\":\"2026-09-24T00:04:55.000Z\",\"displayStatus\":\"Upcoming\"}', '{\"leadCode\":\"LED-3002\",\"followupCode\":\"FUP-B473D6A191\"}', '::1', 'PostmanRuntime/2.7.0', '2026-09-24 00:04:55'),
(33, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"stage\":\"Lost\",\"status\":\"Not interested\"}', '{\"reason\":\"Test Nurture\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:16:20'),
(34, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Lost\",\"status\":\"Not interested\"}', '{\"stage\":\"Connected\",\"status\":\"Open\"}', '{\"reason\":\"Test connected\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:17:30'),
(35, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Connected\",\"status\":\"Open\"}', '{\"stage\":\"Lost\",\"status\":\"Not interested\"}', '{\"reason\":\"test lost\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:19:18'),
(36, 1, 'NURTURE', 2, 'NURTURE_UPDATED', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T06:49:18.000Z\",\"leadFollowUpAt\":\"2026-09-25T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":null,\"reason\":null,\"buyingStage\":null,\"communicationStatus\":null,\"reconnectAt\":\"2026-09-25T04:30:00.000Z\",\"enteredAt\":null,\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T06:49:18.000Z\",\"leadFollowUpAt\":\"2026-09-25T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-09-25T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 12:19:22'),
(37, 1, 'NURTURE', 2, 'NURTURE_UPDATED', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T06:49:18.000Z\",\"leadFollowUpAt\":\"2026-09-25T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-09-25T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T06:49:18.000Z\",\"leadFollowUpAt\":\"2026-09-25T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-09-25T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 12:19:51'),
(38, 1, 'NURTURE', 2, 'NURTURE_RECONNECT_SCHEDULED', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T06:49:18.000Z\",\"leadFollowUpAt\":\"2026-09-25T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-09-25T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T06:50:22.000Z\",\"leadFollowUpAt\":\"2026-11-17T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-11-17T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', '{\"followupId\":6,\"followupCode\":\"FUP-03CB0E6FA8\",\"dueAt\":\"2026-11-17T04:30:00.000Z\",\"action\":\"Reconnect regarding Q1 campaign\"}', '::1', 'PostmanRuntime/2.7.0', '2026-09-24 12:20:22'),
(39, 1, 'NURTURE', 2, 'NURTURE_RECONNECT_SCHEDULED', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T06:50:22.000Z\",\"leadFollowUpAt\":\"2026-11-17T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-11-17T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T07:01:16.000Z\",\"leadFollowUpAt\":\"2026-10-24T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-10-24T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', '{\"followupId\":7,\"followupCode\":\"FUP-4577097202\",\"dueAt\":\"2026-10-24T04:30:00.000Z\",\"action\":\"Reconnect\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:31:16'),
(40, 1, 'NURTURE', 2, 'NURTURE_RECONNECT_SCHEDULED', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T07:01:16.000Z\",\"leadFollowUpAt\":\"2026-10-24T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-10-24T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', '{\"leadId\":2,\"leadCode\":\"LED-3002\",\"leadStage\":\"Lost\",\"leadStatus\":\"Not interested\",\"serviceInterest\":\"Integrated branding and digital launch campaign\",\"lastTouchAt\":\"2026-09-24T07:17:31.000Z\",\"leadFollowUpAt\":\"2026-10-25T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":8,\"companyName\":\"Nova Infra Projects\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"geography\":\"Hyderabad, India\",\"contactId\":3,\"contactName\":\"Arjun Reddy\",\"designation\":\"Marketing Manager\",\"phone\":\"9876543210\",\"email\":\"arjun.reddy@novainfra.example.com\",\"nurtureCategory\":\"LOST_NOT_INTERESTED\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-10-25T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T06:49:22.000Z\",\"category\":\"LOST_NOT_INTERESTED\",\"categoryLabel\":\"Lost / Not Interested\"}', '{\"followupId\":8,\"followupCode\":\"FUP-1958830197\",\"dueAt\":\"2026-10-25T04:30:00.000Z\",\"action\":\"Reconnect\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:47:31'),
(41, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Lost\",\"status\":\"Not interested\"}', '{\"stage\":\"Connected\",\"status\":\"Open\"}', '{\"reason\":\"Test Lost to connected\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:49:55'),
(42, 1, 'LEAD', 1, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Connected\",\"status\":\"Open\"}', '{\"stage\":\"Lost\",\"status\":\"Not interested\"}', '{\"reason\":\"Test Lost\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:56:18'),
(43, 1, 'LEAD', 1, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Lost\",\"status\":\"Not interested\"}', '{\"stage\":\"Nurture\",\"status\":\"Later\"}', '{\"reason\":\"Test Nurture\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:57:11'),
(44, 1, 'NURTURE', 1, 'NURTURE_RECONNECT_SCHEDULED', '{\"leadId\":1,\"leadCode\":\"LED-3001\",\"leadStage\":\"Nurture\",\"leadStatus\":\"Later\",\"serviceInterest\":\"Integrated launch campaign\",\"lastTouchAt\":\"2026-09-24T07:27:11.000Z\",\"leadFollowUpAt\":\"2026-09-24T10:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":1,\"companyName\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"geography\":\"Hyderabad, Telangana, India\",\"contactId\":1,\"contactName\":\"Ravi Menon\",\"designation\":\"Chief Marketing Officer\",\"phone\":\"9000010001\",\"email\":\"ravi@asterhabitat.demo\",\"nurtureCategory\":null,\"reason\":null,\"buyingStage\":null,\"communicationStatus\":null,\"reconnectAt\":\"2026-09-24T10:30:00.000Z\",\"enteredAt\":null,\"category\":\"LATER\",\"categoryLabel\":\"Later\"}', '{\"leadId\":1,\"leadCode\":\"LED-3001\",\"leadStage\":\"Nurture\",\"leadStatus\":\"Later\",\"serviceInterest\":\"Integrated launch campaign\",\"lastTouchAt\":\"2026-09-24T07:27:43.000Z\",\"leadFollowUpAt\":\"2026-10-25T04:30:00.000Z\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"companyId\":1,\"companyName\":\"Aster Habitat\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":\"Telangana\",\"country\":\"India\",\"geography\":\"Hyderabad, Telangana, India\",\"contactId\":1,\"contactName\":\"Ravi Menon\",\"designation\":\"Chief Marketing Officer\",\"phone\":\"9000010001\",\"email\":\"ravi@asterhabitat.demo\",\"nurtureCategory\":\"LATER\",\"reason\":null,\"buyingStage\":null,\"communicationStatus\":\"NOT_CONTACTED\",\"reconnectAt\":\"2026-10-25T04:30:00.000Z\",\"enteredAt\":\"2026-09-24T07:27:43.000Z\",\"category\":\"LATER\",\"categoryLabel\":\"Later\"}', '{\"followupId\":9,\"followupCode\":\"FUP-EB9367DCD5\",\"dueAt\":\"2026-10-25T04:30:00.000Z\",\"action\":\"Reconnect Test\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:57:43'),
(45, 1, 'LEAD', 2, 'LEAD_MARKED_LOST', '{\"stage\":\"Connected\",\"status\":\"Open\",\"nextAction\":\"Reconnect\",\"followUpAt\":\"2026-10-25T04:30:00.000Z\"}', '{\"stage\":\"Nurture\",\"status\":\"Not interested\",\"nextAction\":\"Reconnect when relevant\",\"followUpAt\":\"2026-10-25T04:30:00.000Z\"}', '{\"reason\":\"No response\",\"comment\":\"Testing Mark as Lost\",\"moveToNurture\":true,\"nurtureCategory\":\"LOST_NOT_INTERESTED\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:38:58'),
(46, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Nurture\",\"status\":\"Not interested\"}', '{\"stage\":\"Connected\",\"status\":\"Not interested\"}', '{\"reason\":\"Test Nurture to Connected Stage\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:40:16'),
(47, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Connected\",\"status\":\"Not interested\"}', '{\"stage\":\"Nurture\",\"status\":\"Open\"}', '{\"reason\":\"Test Nurture\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:42:21'),
(48, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Nurture\",\"status\":\"Open\"}', '{\"stage\":\"Meeting\",\"status\":\"Open\"}', '{\"reason\":\"Test Changed to Meeting\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:44:04'),
(49, 1, 'LEAD', 1, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Nurture\",\"status\":\"Later\"}', '{\"stage\":\"Connected\",\"status\":\"Later\"}', '{\"reason\":\"Testing moved nurture to connected\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:46:11'),
(50, 1, 'LEAD', 1, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Connected\",\"status\":\"Later\"}', '{\"stage\":\"Nurture\",\"status\":\"Open\"}', '{\"reason\":\"Test moved to nurture\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:50:22'),
(51, 1, 'LEAD', 1, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Nurture\",\"status\":\"Open\"}', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"reason\":\"Test Moved from nurture to Brief\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:51:30'),
(52, 1, 'BRIEF', 1, 'BRIEF_CREATED', NULL, '{\"id\":1,\"leadId\":2,\"leadCode\":\"LED-3002\",\"companyName\":\"Nova Infra Projects\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"businessObjective\":\"Generate qualified residential property enquiries and improve brand awareness for the upcoming premium apartment launch in Hyderabad.\",\"clientProblem\":\"The client is receiving a high volume of low-quality digital enquiries and has limited awareness among premium home buyers in the target micro-market.\",\"targetAudience\":\"Working professionals, business owners and NRIs aged 28–50 with household income above ₹20 lakh per year, primarily located in Hyderabad and nearby IT corridors.\",\"campaignRequirement\":\"Create an integrated launch campaign covering brand positioning, creative communication, digital lead generation, social media, performance marketing, outdoor advertising and sales-support materials.\",\"currentActivity\":\"The client is currently running basic Meta and Google lead-generation campaigns through an existing media partner, with limited creative variation and no integrated campaign strategy.\",\"potentialScope\":\"Brand strategy, campaign concept, creative development, social media, performance marketing, outdoor communication, launch collateral, landing page and lead-generation support.\",\"timeline\":\"Campaign development within 6 weeks, followed by a 3-month launch campaign.\",\"budget\":\"₹18–25 lakh for creative, digital, media and launch communication.\",\"decisionMaker\":\"Rajesh Kumar – Director, Marketing & Sales.\",\"approvalProcess\":\"Marketing team review → Sales Director review → Managing Director final approval.\",\"expectedDeliverables\":\"Campaign strategy, key visual, campaign tagline, digital banners, social media creatives, landing page, Google and Meta ads, outdoor adaptations, brochures and sales presentation.\",\"clientExpectations\":\"Premium positioning, stronger differentiation from nearby competitors, high-quality enquiries and consistent communication across digital and offline channels.\",\"competitors\":\"Prestige Group, Aparna Constructions, My Home Group, Rajapushpa Properties and local premium residential developments.\",\"categoryInsights\":\"Home buyers compare projects heavily on location, developer credibility, amenities, possession timeline, pricing and lifestyle value. Digital research strongly influences the final shortlist before a site visit.\",\"mandatoryRequirements\":\"All communication must include the approved project logo, RERA details, location map, legal disclaimer, possession timeline and approved pricing information.\",\"status\":\"READY\",\"routeType\":\"KNOWN_EXISTING\",\"routeDecisionNote\":\"Tempest has previously worked with real-estate clients and understands the premium residential category, buyer journey and media requirements.\",\"routeDecidedBy\":1,\"routeDecidedByName\":\"Super Admin\",\"routeDecidedAt\":\"2026-09-24T09:55:06.000Z\",\"approvedBy\":null,\"approvedByName\":null,\"approvedAt\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"updatedBy\":1,\"updatedByName\":\"Super Admin\",\"createdAt\":\"2026-09-24T15:25:06.000Z\",\"updatedAt\":\"2026-09-24T15:25:06.000Z\"}', '{\"leadId\":2,\"completeness\":100,\"missingFields\":[]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 15:25:06'),
(53, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Meeting\",\"status\":\"Open\"}', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"reason\":\"Test Brief\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 15:25:52'),
(54, 1, 'TEAM_ASSIGNMENT', 1, 'TEAM_ASSIGNMENT_CREATED', NULL, '{\"id\":1,\"leadId\":1,\"leadCode\":\"LED-3001\",\"companyName\":\"Aster Habitat\",\"userId\":2,\"userName\":\"Venu Myakam\",\"userRole\":\"OWNER\",\"responsibility\":\"STRATEGY\",\"assignedBy\":1,\"assignedByName\":\"Super Admin\",\"assignedAt\":\"2026-09-24T10:08:49.000Z\",\"dueAt\":\"2026-10-05T12:00:00.000Z\",\"status\":\"PENDING\",\"createdAt\":\"2026-09-24T15:38:49.000Z\",\"updatedAt\":\"2026-09-24T15:38:49.000Z\"}', '{\"leadId\":1,\"responsibility\":\"STRATEGY\"}', '::1', 'PostmanRuntime/2.7.0', '2026-09-24 15:38:49'),
(55, 1, 'TEAM_ASSIGNMENT', 2, 'TEAM_ASSIGNMENT_CREATED', NULL, '{\"id\":2,\"leadId\":2,\"leadCode\":\"LED-3002\",\"companyName\":\"Nova Infra Projects\",\"userId\":2,\"userName\":\"Venu Myakam\",\"userRole\":\"OWNER\",\"responsibility\":\"ACCOUNT_SERVICING\",\"assignedBy\":1,\"assignedByName\":\"Super Admin\",\"assignedAt\":\"2026-09-24T10:44:47.000Z\",\"dueAt\":\"2026-09-30T06:30:00.000Z\",\"status\":\"IN_PROGRESS\",\"createdAt\":\"2026-09-24T16:14:47.000Z\",\"updatedAt\":\"2026-09-24T16:14:47.000Z\"}', '{\"leadId\":2,\"responsibility\":\"ACCOUNT_SERVICING\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:14:47'),
(56, 1, 'TEAM_ASSIGNMENT', 2, 'TEAM_ASSIGNMENT_STATUS_CHANGED', '{\"status\":\"IN_PROGRESS\"}', '{\"status\":\"PENDING\"}', '{\"leadId\":2,\"responsibility\":\"ACCOUNT_SERVICING\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:15:13'),
(57, 1, 'TEAM_ASSIGNMENT', 2, 'TEAM_ASSIGNMENT_STATUS_CHANGED', '{\"status\":\"PENDING\"}', '{\"status\":\"IN_PROGRESS\"}', '{\"leadId\":2,\"responsibility\":\"ACCOUNT_SERVICING\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:15:18'),
(58, 1, 'TEAM_ASSIGNMENT', 2, 'TEAM_ASSIGNMENT_STATUS_CHANGED', '{\"status\":\"IN_PROGRESS\"}', '{\"status\":\"COMPLETED\"}', '{\"leadId\":2,\"responsibility\":\"ACCOUNT_SERVICING\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:15:30'),
(59, 1, 'TEAM_ASSIGNMENT', 2, 'TEAM_ASSIGNMENT_STATUS_CHANGED', '{\"status\":\"COMPLETED\"}', '{\"status\":\"PENDING\"}', '{\"leadId\":2,\"responsibility\":\"ACCOUNT_SERVICING\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:15:32'),
(60, 1, 'TEAM_ASSIGNMENT', 2, 'TEAM_ASSIGNMENT_STATUS_CHANGED', '{\"status\":\"PENDING\"}', '{\"status\":\"IN_PROGRESS\"}', '{\"leadId\":2,\"responsibility\":\"ACCOUNT_SERVICING\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:15:38'),
(61, 1, 'TEAM_ASSIGNMENT', 3, 'TEAM_ASSIGNMENT_CREATED', NULL, '{\"id\":3,\"leadId\":2,\"leadCode\":\"LED-3002\",\"companyName\":\"Nova Infra Projects\",\"userId\":2,\"userName\":\"Venu Myakam\",\"userRole\":\"OWNER\",\"responsibility\":\"CREATIVE\",\"assignedBy\":1,\"assignedByName\":\"Super Admin\",\"assignedAt\":\"2026-09-24T10:46:12.000Z\",\"dueAt\":\"2026-09-24T10:46:00.000Z\",\"status\":\"PENDING\",\"createdAt\":\"2026-09-24T16:16:12.000Z\",\"updatedAt\":\"2026-09-24T16:16:12.000Z\"}', '{\"leadId\":2,\"responsibility\":\"CREATIVE\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:16:12'),
(62, 1, 'TEAM_ASSIGNMENT', 4, 'TEAM_ASSIGNMENT_CREATED', NULL, '{\"id\":4,\"leadId\":2,\"leadCode\":\"LED-3002\",\"companyName\":\"Nova Infra Projects\",\"userId\":2,\"userName\":\"Venu Myakam\",\"userRole\":\"OWNER\",\"responsibility\":\"STRATEGY\",\"assignedBy\":1,\"assignedByName\":\"Super Admin\",\"assignedAt\":\"2026-09-24T10:46:28.000Z\",\"dueAt\":\"2026-09-24T10:46:00.000Z\",\"status\":\"PENDING\",\"createdAt\":\"2026-09-24T16:16:28.000Z\",\"updatedAt\":\"2026-09-24T16:16:28.000Z\"}', '{\"leadId\":2,\"responsibility\":\"STRATEGY\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:16:28'),
(63, 1, 'LEAD', 2, 'LEAD_OWNER_CHANGED', '{\"ownerId\":1,\"ownerName\":\"Super Admin\"}', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"reason\":null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:59:12');
INSERT INTO `audit_logs` (`id`, `actor_user_id`, `entity_type`, `entity_id`, `action`, `previous_values`, `new_values`, `metadata`, `ip_address`, `user_agent`, `created_at`) VALUES
(64, 2, 'LEAD', 3, 'LEAD_CREATED', NULL, '{\"id\":3,\"leadCode\":\"LED-3003\",\"companyId\":9,\"companyName\":\"Test Ads\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"website\":\"https://lucide.dev/\",\"primaryContactId\":4,\"primaryContactName\":\"Tester 01\",\"primaryContactDesignation\":\"Testing\",\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":\"test@gmail.com\",\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"LinkedIn\",\"serviceRequired\":\"Testing\",\"description\":\"Testing\",\"estimatedValueRupees\":150000,\"knownRelationship\":true,\"lastTouchAt\":\"2026-09-28T04:49:47.000Z\",\"nextAction\":\"Meeting\",\"followUpAt\":\"2026-09-28T05:00:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-09-28T10:19:47.000Z\",\"updatedAt\":\"2026-09-28T10:19:47.000Z\"}', '{\"leadCode\":\"LED-3003\",\"companyId\":9,\"primaryContactId\":4,\"companyReused\":false,\"contactReused\":false,\"branchId\":1}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:19:47'),
(65, 1, 'MEETING', 2, 'MEETING_COMPLETED', '{\"id\":2,\"meetingCode\":\"MET-1002\",\"leadId\":1,\"leadCode\":\"LED-3001\",\"companyName\":\"Aster Habitat\",\"contactId\":1,\"contactCode\":\"CON-2001\",\"contactName\":\"Ravi Menon\",\"title\":\"Test Schedule meeting\",\"startsAt\":\"2026-09-24T05:30:00.000Z\",\"endsAt\":\"2026-09-24T06:30:00.000Z\",\"meetingType\":\"PHONE_CALL\",\"status\":\"SCHEDULED\",\"participantsJson\":null,\"meetingUrl\":null,\"location\":null,\"agenda\":\"Testing Schedule meeting\",\"notes\":null,\"outcome\":null,\"nextAction\":null,\"followUpAt\":null,\"completedAt\":null,\"completedBy\":null,\"statusReason\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":null,\"ownerId\":1,\"ownerName\":\"Super Admin\",\"createdAt\":\"2026-09-23T23:04:08.000Z\",\"updatedAt\":\"2026-09-23T23:04:08.000Z\",\"participants\":[]}', '{\"id\":2,\"meetingCode\":\"MET-1002\",\"leadId\":1,\"leadCode\":\"LED-3001\",\"companyName\":\"Aster Habitat\",\"contactId\":1,\"contactCode\":\"CON-2001\",\"contactName\":\"Ravi Menon\",\"title\":\"Test Schedule meeting\",\"startsAt\":\"2026-09-24T05:30:00.000Z\",\"endsAt\":\"2026-09-24T06:30:00.000Z\",\"meetingType\":\"PHONE_CALL\",\"status\":\"COMPLETED\",\"participantsJson\":null,\"meetingUrl\":null,\"location\":null,\"agenda\":\"Testing Schedule meeting\",\"notes\":\"Completed meeting\",\"outcome\":\"Test\",\"nextAction\":\"Testing\",\"followUpAt\":\"2026-09-29T04:30:00.000Z\",\"completedAt\":\"2026-09-28T04:53:22.000Z\",\"completedBy\":1,\"statusReason\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":\"Super Admin\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"createdAt\":\"2026-09-23T23:04:08.000Z\",\"updatedAt\":\"2026-09-28T10:23:22.000Z\",\"participants\":[]}', '{\"followupCode\":\"FUP-B865B12255\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:23:22'),
(66, 1, 'LEAD', 4, 'LEAD_CREATED', NULL, '{\"id\":4,\"leadCode\":\"LED-3004\",\"companyId\":10,\"companyName\":\"test\",\"industry\":\"Real Estate\",\"city\":\"test\",\"website\":\"test.com\",\"primaryContactId\":5,\"primaryContactName\":\"test01\",\"primaryContactDesignation\":\"tester\",\"primaryContactPhone\":\"8789456120\",\"primaryContactEmail\":\"test001@gmail.com\",\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"LinkedIn\",\"serviceRequired\":\"Testing\",\"description\":\"Test\",\"estimatedValueRupees\":120000,\"knownRelationship\":false,\"lastTouchAt\":\"2026-09-28T11:57:22.000Z\",\"nextAction\":\"Marketing\",\"followUpAt\":\"2026-09-30T04:30:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-09-28T17:27:22.000Z\",\"updatedAt\":\"2026-09-28T17:27:22.000Z\"}', '{\"leadCode\":\"LED-3004\",\"companyId\":10,\"primaryContactId\":5,\"companyReused\":false,\"contactReused\":false,\"branchId\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 17:27:23'),
(67, 1, 'LEAD', 5, 'LEAD_CREATED', NULL, '{\"id\":5,\"leadCode\":\"LED-3005\",\"companyId\":11,\"companyName\":\"lead test\",\"industry\":\"Real Estate\",\"city\":\"hyd\",\"website\":\"test.com\",\"primaryContactId\":6,\"primaryContactName\":\"test venu\",\"primaryContactDesignation\":\"tester\",\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":\"test@gmail.com\",\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"LinkedIn\",\"serviceRequired\":\"testing\",\"description\":\"test\",\"estimatedValueRupees\":120000,\"knownRelationship\":false,\"lastTouchAt\":\"2026-09-28T12:10:37.000Z\",\"nextAction\":\"meeting\",\"followUpAt\":\"2026-09-30T04:30:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-09-28T17:40:37.000Z\",\"updatedAt\":\"2026-09-28T17:40:37.000Z\"}', '{\"leadCode\":\"LED-3005\",\"companyId\":11,\"primaryContactId\":6,\"companyReused\":false,\"contactReused\":false,\"branchId\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 17:40:37'),
(68, 1, 'USER', 3, 'USER_CREATED', NULL, '{\"id\":3,\"userCode\":\"USR-1003\",\"fullName\":\"Test Hyderabad Owner\",\"email\":\"test.owner@tempest.demo\",\"role\":\"OWNER\",\"department\":\"Business Development\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":0,\"lastLoginAt\":null,\"createdAt\":\"2026-09-28T19:02:31.000Z\",\"updatedAt\":\"2026-09-28T19:02:31.000Z\"}', NULL, '127.0.0.1', 'PostmanRuntime/2.7.0', '2026-09-28 19:02:31'),
(69, 1, 'USER', 4, 'USER_CREATED', NULL, '{\"id\":4,\"userCode\":\"USR-1004\",\"fullName\":\"Subroto\",\"email\":\"subroto@gmail.com\",\"role\":\"OWNER\",\"department\":\"Account Manager\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":0,\"lastLoginAt\":null,\"createdAt\":\"2026-09-28T19:37:32.000Z\",\"updatedAt\":\"2026-09-28T19:37:32.000Z\"}', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:37:32'),
(70, 1, 'USER', 4, 'USER_UPDATED', '{\"id\":4,\"userCode\":\"USR-1004\",\"fullName\":\"Subroto\",\"email\":\"subroto@gmail.com\",\"role\":\"OWNER\",\"department\":\"Account Manager\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":0,\"lastLoginAt\":null,\"createdAt\":\"2026-09-28T19:37:32.000Z\",\"updatedAt\":\"2026-09-28T19:41:27.000Z\"}', '{\"id\":4,\"userCode\":\"USR-1004\",\"fullName\":\"Subroto\",\"email\":\"subroto@gmail.com\",\"role\":\"OWNER\",\"department\":\"Account Manager\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":0,\"lastLoginAt\":null,\"createdAt\":\"2026-09-28T19:37:32.000Z\",\"updatedAt\":\"2026-09-28T14:19:50.000Z\"}', '{\"branchId\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:49:50'),
(71, 1, 'USER', 3, 'USER_UPDATED', '{\"id\":3,\"userCode\":\"USR-1003\",\"fullName\":\"Test Hyderabad Owner\",\"email\":\"test.owner@tempest.demo\",\"role\":\"OWNER\",\"department\":\"Business Development\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":0,\"lastLoginAt\":null,\"createdAt\":\"2026-09-28T19:02:31.000Z\",\"updatedAt\":\"2026-09-28T19:02:31.000Z\"}', '{\"id\":3,\"userCode\":\"USR-1003\",\"fullName\":\"Test Hyderabad Owner\",\"email\":\"test.owner@tempest.demo\",\"role\":\"OWNER\",\"department\":\"Business Development\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":0,\"lastLoginAt\":null,\"createdAt\":\"2026-09-28T19:02:31.000Z\",\"updatedAt\":\"2026-09-28T14:20:29.000Z\"}', '{\"branchId\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:50:29'),
(72, 1, 'USER', 3, 'USER_DEACTIVATED', '{\"status\":\"ACTIVE\"}', '{\"status\":\"INACTIVE\"}', '{\"reassignedLeads\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 20:06:20'),
(73, 1, 'USER', 3, 'USER_ACTIVATED', '{\"status\":\"INACTIVE\"}', '{\"status\":\"ACTIVE\"}', '{\"reassignedLeads\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 20:06:25'),
(74, 1, 'USER', 3, 'USER_UPDATED', '{\"id\":3,\"userCode\":\"USR-1003\",\"fullName\":\"Test Hyderabad Owner\",\"email\":\"test.owner@tempest.demo\",\"role\":\"OWNER\",\"department\":\"Business Development\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":0,\"lastLoginAt\":\"2026-09-28T14:21:50.000Z\",\"createdAt\":\"2026-09-28T19:02:31.000Z\",\"updatedAt\":\"2026-09-28T14:36:25.000Z\"}', '{\"id\":3,\"userCode\":\"USR-1003\",\"fullName\":\"Test Hyderabad Owner\",\"email\":\"test.owner@tempest.demo\",\"role\":\"OWNER\",\"department\":\"Business Development\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":2,\"branchName\":\"Pune\",\"branchCode\":\"PUNE\",\"assignedLeads\":0,\"lastLoginAt\":\"2026-09-28T14:21:50.000Z\",\"createdAt\":\"2026-09-28T19:02:31.000Z\",\"updatedAt\":\"2026-09-29T06:15:25.000Z\"}', '{\"branchId\":2}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 11:45:25'),
(75, 1, 'LEAD', 6, 'LEAD_CREATED', NULL, '{\"id\":6,\"leadCode\":\"LED-3006\",\"companyId\":12,\"companyName\":\"TLead\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"website\":\"tlead.com\",\"primaryContactId\":7,\"primaryContactName\":\"Raju\",\"primaryContactDesignation\":\"Ceo\",\"primaryContactPhone\":\"9874561230\",\"primaryContactEmail\":\"raju.ceo@gmail.com\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"Employee referral\",\"serviceRequired\":\"Website Development\",\"description\":\"Website Development\",\"estimatedValueRupees\":150000,\"knownRelationship\":false,\"lastTouchAt\":\"2026-09-29T06:57:08.000Z\",\"nextAction\":\"Call with client\",\"followUpAt\":\"2026-09-29T09:30:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-09-29T12:27:08.000Z\",\"updatedAt\":\"2026-09-29T12:27:08.000Z\"}', '{\"leadCode\":\"LED-3006\",\"companyId\":12,\"companyName\":\"TLead\",\"companyCreated\":true,\"primaryContactId\":7,\"contactName\":\"Raju\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"ownerId\":4,\"ownerName\":\"Subroto\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:27:08'),
(76, 4, 'MEETING', 3, 'MEETING_CREATED', NULL, '{\"id\":3,\"meetingCode\":\"MET-1003\",\"leadId\":6,\"leadCode\":\"LED-3006\",\"companyName\":\"TLead\",\"contactId\":7,\"contactCode\":\"CON-2007\",\"contactName\":\"Raju\",\"title\":\"Call with Client\",\"startsAt\":\"2026-09-29T09:30:00.000Z\",\"endsAt\":\"2026-09-29T10:30:00.000Z\",\"meetingType\":\"PHONE_CALL\",\"status\":\"SCHEDULED\",\"participantsJson\":null,\"meetingUrl\":null,\"location\":null,\"agenda\":\"Call with Client\",\"notes\":null,\"outcome\":null,\"nextAction\":null,\"followUpAt\":null,\"completedAt\":null,\"completedBy\":null,\"statusReason\":null,\"createdBy\":4,\"createdByName\":\"Subroto\",\"completedByName\":null,\"ownerId\":4,\"ownerName\":\"Subroto\",\"createdAt\":\"2026-09-29T12:52:17.000Z\",\"updatedAt\":\"2026-09-29T12:52:17.000Z\",\"participants\":[]}', '{\"meetingCode\":\"MET-1003\",\"leadCode\":\"LED-3006\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:52:17'),
(77, 1, 'LEAD', 6, 'LEAD_OWNER_CHANGED', '{\"ownerId\":4,\"ownerName\":\"Subroto\"}', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"reason\":\"Testing Assign owner\",\"branchId\":1,\"branchName\":\"Hyderabad\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:58:00'),
(78, 1, 'LEAD', 6, 'LEAD_OWNER_CHANGED', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"ownerId\":4,\"ownerName\":\"Subroto\"}', '{\"reason\":\"Changed to Subroto\",\"branchId\":1,\"branchName\":\"Hyderabad\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:58:42'),
(79, 1, 'LEAD', 6, 'LEAD_OWNER_CHANGED', '{\"ownerId\":4,\"ownerName\":\"Subroto\"}', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"reason\":\"testing change owner\",\"branchId\":1,\"branchName\":\"Hyderabad\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 13:56:43'),
(80, 1, 'LEAD', 6, 'LEAD_OWNER_CHANGED', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"ownerId\":4,\"ownerName\":\"Subroto\"}', '{\"reason\":\"Test success\",\"branchId\":1,\"branchName\":\"Hyderabad\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 13:57:15'),
(81, 1, 'TEAM_ASSIGNMENT', 5, 'TEAM_ASSIGNMENT_CREATED', NULL, '{\"id\":5,\"leadId\":6,\"leadCode\":\"LED-3006\",\"companyName\":\"TLead\",\"userId\":3,\"userName\":\"Test Hyderabad Owner\",\"userRole\":\"OWNER\",\"memberBranchId\":2,\"memberBranchName\":\"Pune\",\"memberBranchCode\":\"PUNE\",\"isCrossBranch\":true,\"responsibility\":\"STRATEGY\",\"assignedBy\":1,\"assignedByName\":\"Super Admin\",\"assignedAt\":\"2026-09-29T08:39:53.000Z\",\"dueAt\":\"2026-09-29T08:39:00.000Z\",\"status\":\"PENDING\",\"createdAt\":\"2026-09-29T14:09:53.000Z\",\"updatedAt\":\"2026-09-29T14:09:53.000Z\"}', '{\"leadId\":6,\"leadBranchId\":1,\"memberBranchId\":2,\"crossBranch\":true}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:09:53'),
(82, 1, 'TEAM_ASSIGNMENT', 6, 'TEAM_ASSIGNMENT_CREATED', NULL, '{\"id\":6,\"leadId\":6,\"leadCode\":\"LED-3006\",\"companyName\":\"TLead\",\"userId\":4,\"userName\":\"Subroto\",\"userRole\":\"OWNER\",\"memberBranchId\":1,\"memberBranchName\":\"Hyderabad\",\"memberBranchCode\":\"HYDERABAD\",\"isCrossBranch\":false,\"responsibility\":\"ACCOUNT_SERVICING\",\"assignedBy\":1,\"assignedByName\":\"Super Admin\",\"assignedAt\":\"2026-09-29T08:40:20.000Z\",\"dueAt\":\"2026-09-29T08:40:00.000Z\",\"status\":\"IN_PROGRESS\",\"createdAt\":\"2026-09-29T14:10:20.000Z\",\"updatedAt\":\"2026-09-29T14:10:20.000Z\"}', '{\"leadId\":6,\"leadBranchId\":1,\"memberBranchId\":1,\"crossBranch\":false}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:10:20'),
(83, 1, 'TEAM_ASSIGNMENT', 5, 'TEAM_ASSIGNMENT_STATUS_CHANGED', '{\"status\":\"PENDING\"}', '{\"status\":\"IN_PROGRESS\"}', '{\"leadId\":6}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:10:41'),
(84, 1, 'USER', 2, 'USER_UPDATED', '{\"id\":2,\"userCode\":\"\",\"fullName\":\"Venu Myakam\",\"email\":\"venu@gmail.com\",\"role\":\"OWNER\",\"department\":null,\"location\":null,\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":4,\"lastLoginAt\":\"2026-09-28T08:58:11.000Z\",\"createdAt\":\"2026-09-23T21:32:20.000Z\",\"updatedAt\":\"2026-09-28T14:28:11.000Z\"}', '{\"id\":2,\"userCode\":\"\",\"fullName\":\"Venu Myakam\",\"email\":\"venu@gmail.com\",\"role\":\"OWNER\",\"department\":\"Developer\",\"location\":\"Hyderabad\",\"status\":\"ACTIVE\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"assignedLeads\":4,\"lastLoginAt\":\"2026-09-28T08:58:11.000Z\",\"createdAt\":\"2026-09-23T21:32:20.000Z\",\"updatedAt\":\"2026-09-29T09:18:31.000Z\"}', '{\"branchId\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:48:31'),
(85, 1, 'LEAD', 6, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Contact Research\",\"status\":\"Open\"}', '{\"reason\":\"gg\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 16:02:32'),
(86, 1, 'TEAM_ASSIGNMENT', 6, 'TEAM_ASSIGNMENT_STATUS_CHANGED', '{\"status\":\"IN_PROGRESS\"}', '{\"status\":\"COMPLETED\"}', '{\"leadId\":6}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 16:52:33'),
(87, 1, 'CONTACT', 8, 'CONTACT_CREATED', NULL, '{\"id\":8,\"contactCode\":\"CON-2008\",\"companyId\":12,\"companyCode\":\"CMP-1012\",\"companyName\":\"TLead\",\"name\":\"Ramesh\",\"designation\":\"Lead\",\"phone\":\"7856987410\",\"email\":\"ramesh@gmail.com\",\"isDecisionMaker\":false,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-29T17:42:51.000Z\",\"updatedAt\":\"2026-09-29T17:42:51.000Z\"}', '{\"contactCode\":\"CON-2008\",\"companyId\":12}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 17:42:51'),
(88, 1, 'CONTACT', 9, 'CONTACT_CREATED', NULL, '{\"id\":9,\"contactCode\":\"CON-2009\",\"companyId\":12,\"companyCode\":\"CMP-1012\",\"companyName\":\"TLead\",\"name\":\"Rakesh\",\"designation\":\"Tester\",\"phone\":\"7845121210\",\"email\":\"rakesh@gmail.com\",\"isDecisionMaker\":true,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-29T17:44:13.000Z\",\"updatedAt\":\"2026-09-29T17:44:13.000Z\"}', '{\"contactCode\":\"CON-2009\",\"companyId\":12}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 17:44:13'),
(89, 1, 'BRIEF', 2, 'BRIEF_CREATED', NULL, '{\"id\":2,\"leadId\":6,\"leadCode\":\"LED-3006\",\"companyName\":\"TLead\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"businessObjective\":\"Test Breif\",\"clientProblem\":\"Test Breif\",\"targetAudience\":\"Test Breif\",\"campaignRequirement\":\"Test Breif\",\"currentActivity\":\"Test Breif\",\"potentialScope\":\"Test Breif\",\"timeline\":\"5 weeks\",\"budget\":\"500000\",\"approvalProcess\":\"Test Breif\",\"expectedDeliverables\":\"Test Breif\",\"clientExpectations\":\"Test Breif\",\"competitors\":\"Test Breif\",\"categoryInsights\":\"Test Breif\",\"mandatoryRequirements\":\"Test Breif\",\"status\":\"APPROVED\",\"routeType\":\"NEW_UNKNOWN\",\"routeDecisionNote\":\"Test Breif\",\"routeDecidedBy\":1,\"routeDecidedByName\":\"Super Admin\",\"routeDecidedAt\":\"2026-09-29T13:12:07.000Z\",\"approvedBy\":1,\"approvedByName\":\"Super Admin\",\"approvedAt\":\"2026-09-29T13:12:07.000Z\",\"createdBy\":1,\"createdByName\":\"Super Admin\",\"updatedBy\":1,\"updatedByName\":\"Super Admin\",\"createdAt\":\"2026-09-29T18:42:07.000Z\",\"updatedAt\":\"2026-09-29T18:42:07.000Z\"}', '{\"leadId\":6,\"completeness\":100,\"missingFields\":[]}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:42:07'),
(90, 1, 'LEAD', 6, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Contact Research\",\"status\":\"Open\"}', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"reason\":\"Brief Received\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:34:42'),
(91, 1, 'LEAD', 6, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"reason\":\"Move back to new stage\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:38:55'),
(92, 1, 'LEAD', 6, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Contact Research\",\"status\":\"Open\"}', '{\"reason\":\"next stage\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:40:24'),
(93, 1, 'LEAD', 6, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Contact Research\",\"status\":\"Open\"}', '{\"stage\":\"Connected\",\"status\":\"Open\"}', '{\"reason\":\"moved to new stage\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:41:08'),
(94, 1, 'LEAD', 6, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Connected\",\"status\":\"Open\"}', '{\"stage\":\"Meeting\",\"status\":\"Open\"}', '{\"reason\":\"moved to next stage meeting\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:41:33'),
(95, 1, 'LEAD', 6, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Meeting\",\"status\":\"Open\"}', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"reason\":\"Changed to Brief stage, Brief received\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:42:13'),
(96, 1, 'CONTACT', 10, 'CONTACT_CREATED', NULL, '{\"id\":10,\"contactCode\":\"CON-2010\",\"companyId\":12,\"companyCode\":\"CMP-1012\",\"companyName\":\"TLead\",\"name\":\"test add contact\",\"designation\":\"add contact\",\"phone\":\"7894561230\",\"email\":\"test@gmail.com\",\"isDecisionMaker\":false,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-09-30T17:58:30.000Z\",\"updatedAt\":\"2026-09-30T17:58:30.000Z\"}', '{\"contactCode\":\"CON-2010\",\"companyId\":12}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:58:30'),
(97, 1, 'LEAD', 7, 'LEAD_CREATED', NULL, '{\"id\":7,\"leadCode\":\"LED-3007\",\"companyId\":13,\"companyName\":\"Static Modal\",\"industry\":\"Real Estate\",\"city\":\"Hyd\",\"website\":\"modal\",\"primaryContactId\":11,\"primaryContactName\":\"Modal\",\"primaryContactDesignation\":\"Modal\",\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":null,\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"Referral\",\"serviceRequired\":\"Static\",\"description\":\"\",\"estimatedValueRupees\":120000,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-01T05:55:35.000Z\",\"nextAction\":\"Call\",\"followUpAt\":\"2026-10-01T04:30:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-01T11:25:35.000Z\",\"updatedAt\":\"2026-10-01T11:25:35.000Z\"}', '{\"leadCode\":\"LED-3007\",\"companyId\":13,\"companyName\":\"Static Modal\",\"companyCreated\":true,\"primaryContactId\":11,\"contactName\":\"Modal\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:25:35'),
(98, 1, 'LEAD', 8, 'LEAD_CREATED', NULL, '{\"id\":8,\"leadCode\":\"LED-3008\",\"companyId\":14,\"companyName\":\"gg\",\"industry\":\"Real Estate\",\"city\":null,\"website\":null,\"primaryContactId\":12,\"primaryContactName\":\"gg\",\"primaryContactDesignation\":null,\"primaryContactPhone\":null,\"primaryContactEmail\":null,\"ownerId\":4,\"ownerName\":\"Subroto\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"Medium\",\"source\":\"LinkedIn\",\"serviceRequired\":\"gg\",\"description\":\"\",\"estimatedValueRupees\":0,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-01T06:22:14.000Z\",\"nextAction\":\"gg\",\"followUpAt\":\"2026-10-01T06:22:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-01T11:52:14.000Z\",\"updatedAt\":\"2026-10-01T11:52:14.000Z\"}', '{\"leadCode\":\"LED-3008\",\"companyId\":14,\"companyName\":\"gg\",\"companyCreated\":true,\"primaryContactId\":12,\"contactName\":\"gg\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"ownerId\":4,\"ownerName\":\"Subroto\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:52:14'),
(99, 1, 'FOLLOWUP', 16, 'FOLLOWUP_COMPLETED', '{\"id\":16,\"followupCode\":\"FUP-1790835734760-A3OGY\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-01T06:22:14.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"gg\",\"dueAt\":\"2026-10-01T06:22:00.000Z\",\"priority\":\"Medium\",\"status\":\"PENDING\",\"notes\":null,\"outcome\":null,\"completedAt\":null,\"completedBy\":null,\"completedByName\":null,\"successorFollowupId\":null,\"statusReason\":null,\"createdAt\":\"2026-10-01T11:52:14.000Z\",\"updatedAt\":\"2026-10-01T11:52:14.000Z\",\"displayStatus\":\"Due today\"}', '{\"id\":16,\"followupCode\":\"FUP-1790835734760-A3OGY\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-01T07:25:31.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"gg\",\"dueAt\":\"2026-10-01T06:22:00.000Z\",\"priority\":\"Medium\",\"status\":\"COMPLETED\",\"notes\":\"completed\",\"outcome\":\"follow up completed\",\"completedAt\":\"2026-10-01T07:25:31.000Z\",\"completedBy\":1,\"completedByName\":\"Super Admin\",\"successorFollowupId\":17,\"statusReason\":null,\"createdAt\":\"2026-10-01T11:52:14.000Z\",\"updatedAt\":\"2026-10-01T12:55:31.000Z\",\"displayStatus\":\"Completed\"}', '{\"successorFollowupId\":17,\"successorFollowupCode\":\"FUP-8C6A5D72BD\",\"nextAction\":\"Call\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 12:55:31'),
(100, 1, 'FOLLOWUP', 18, 'FOLLOWUP_CREATED', NULL, '{\"id\":18,\"followupCode\":\"FUP-75D03B39B0\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-01T08:55:46.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"meeting\",\"dueAt\":\"2026-10-02T04:30:00.000Z\",\"priority\":\"High\",\"status\":\"PENDING\",\"notes\":null,\"outcome\":null,\"completedAt\":null,\"completedBy\":null,\"completedByName\":null,\"successorFollowupId\":null,\"statusReason\":null,\"createdAt\":\"2026-10-01T14:25:46.000Z\",\"updatedAt\":\"2026-10-01T14:25:46.000Z\",\"displayStatus\":\"Upcoming\"}', '{\"leadCode\":\"LED-3008\",\"followupCode\":\"FUP-75D03B39B0\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:25:46'),
(101, 1, 'ACTIVITY', 75, 'ACTIVITY_CREATED', NULL, '{\"id\":75,\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadOwnerId\":4,\"companyId\":14,\"companyCode\":\"CMP-1014\",\"companyName\":\"gg\",\"contactId\":12,\"contactCode\":\"CON-2012\",\"contactName\":\"gg\",\"activityType\":\"Activity\",\"outcome\":\"test\",\"notes\":\"test\",\"occurredAt\":\"2026-10-01T08:56:04.000Z\",\"createdBy\":1,\"createdByName\":\"Super Admin\"}', '{\"leadId\":8,\"leadCode\":\"LED-3008\",\"followupCode\":\"FUP-D700863053\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:26:04'),
(102, 1, 'MEETING', 4, 'MEETING_CREATED', NULL, '{\"id\":4,\"meetingCode\":\"MET-1004\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"companyName\":\"gg\",\"contactId\":12,\"contactCode\":\"CON-2012\",\"contactName\":\"gg\",\"title\":\"test time\",\"startsAt\":\"2026-10-01T09:20:00.000Z\",\"endsAt\":\"2026-10-01T10:20:00.000Z\",\"meetingType\":\"VIDEO_CALL\",\"status\":\"SCHEDULED\",\"participantsJson\":null,\"meetingUrl\":null,\"location\":null,\"agenda\":null,\"notes\":null,\"outcome\":null,\"nextAction\":null,\"followUpAt\":null,\"completedAt\":null,\"completedBy\":null,\"statusReason\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":null,\"ownerId\":4,\"ownerName\":\"Subroto\",\"createdAt\":\"2026-10-01T14:41:04.000Z\",\"updatedAt\":\"2026-10-01T14:41:04.000Z\",\"participants\":[]}', '{\"meetingCode\":\"MET-1004\",\"leadCode\":\"LED-3008\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:41:04'),
(103, 1, 'FOLLOWUP', 20, 'FOLLOWUP_CREATED', NULL, '{\"id\":20,\"followupCode\":\"FUP-DC063DD82E\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-01T09:12:00.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"brief follow up\",\"dueAt\":\"2026-10-02T04:30:00.000Z\",\"priority\":\"High\",\"status\":\"PENDING\",\"notes\":null,\"outcome\":null,\"completedAt\":null,\"completedBy\":null,\"completedByName\":null,\"successorFollowupId\":null,\"statusReason\":null,\"createdAt\":\"2026-10-01T14:42:00.000Z\",\"updatedAt\":\"2026-10-01T14:42:00.000Z\",\"displayStatus\":\"Upcoming\"}', '{\"leadCode\":\"LED-3008\",\"followupCode\":\"FUP-DC063DD82E\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:42:00'),
(104, 1, 'FOLLOWUP', 17, 'FOLLOWUP_COMPLETED', '{\"id\":17,\"followupCode\":\"FUP-8C6A5D72BD\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-01T09:12:00.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"Call\",\"dueAt\":\"2026-10-01T04:30:00.000Z\",\"priority\":\"Medium\",\"status\":\"PENDING\",\"notes\":null,\"outcome\":null,\"completedAt\":null,\"completedBy\":null,\"completedByName\":null,\"successorFollowupId\":null,\"statusReason\":null,\"createdAt\":\"2026-10-01T12:55:31.000Z\",\"updatedAt\":\"2026-10-01T12:55:31.000Z\",\"displayStatus\":\"Due today\"}', '{\"id\":17,\"followupCode\":\"FUP-8C6A5D72BD\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-01T09:12:57.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"Call\",\"dueAt\":\"2026-10-01T04:30:00.000Z\",\"priority\":\"Medium\",\"status\":\"COMPLETED\",\"notes\":\"Completed follow-up\",\"outcome\":\"Completed follow-up\",\"completedAt\":\"2026-10-01T09:12:57.000Z\",\"completedBy\":1,\"completedByName\":\"Super Admin\",\"successorFollowupId\":21,\"statusReason\":null,\"createdAt\":\"2026-10-01T12:55:31.000Z\",\"updatedAt\":\"2026-10-01T14:42:57.000Z\",\"displayStatus\":\"Completed\"}', '{\"successorFollowupId\":21,\"successorFollowupCode\":\"FUP-8008AD0E00\",\"nextAction\":\"Meeting with Client\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:42:57'),
(105, 1, 'FOLLOWUP', 18, 'FOLLOWUP_RESCHEDULED', '{\"id\":18,\"followupCode\":\"FUP-75D03B39B0\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-01T09:12:57.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"meeting\",\"dueAt\":\"2026-10-02T04:30:00.000Z\",\"priority\":\"High\",\"status\":\"PENDING\",\"notes\":null,\"outcome\":null,\"completedAt\":null,\"completedBy\":null,\"completedByName\":null,\"successorFollowupId\":null,\"statusReason\":null,\"createdAt\":\"2026-10-01T14:25:46.000Z\",\"updatedAt\":\"2026-10-01T14:25:46.000Z\",\"displayStatus\":\"Upcoming\"}', '{\"id\":18,\"followupCode\":\"FUP-75D03B39B0\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-01T09:14:30.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"meeting\",\"dueAt\":\"2026-10-02T04:30:00.000Z\",\"priority\":\"High\",\"status\":\"RESCHEDULED\",\"notes\":null,\"outcome\":null,\"completedAt\":null,\"completedBy\":null,\"completedByName\":null,\"successorFollowupId\":22,\"statusReason\":\"Client not available\",\"createdAt\":\"2026-10-01T14:25:46.000Z\",\"updatedAt\":\"2026-10-01T14:44:30.000Z\",\"displayStatus\":\"Rescheduled\"}', '{\"successorFollowupId\":22,\"successorFollowupCode\":\"FUP-598789E0FF\",\"reason\":\"Client not available\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:44:30'),
(106, 1, 'ACTIVITY', 80, 'ACTIVITY_CREATED', NULL, '{\"id\":80,\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadOwnerId\":4,\"companyId\":14,\"companyCode\":\"CMP-1014\",\"companyName\":\"gg\",\"contactId\":12,\"contactCode\":\"CON-2012\",\"contactName\":\"gg\",\"activityType\":\"Activity\",\"outcome\":\"test add activity date function\",\"notes\":\"Testing date function\",\"occurredAt\":\"2026-10-01T09:19:26.000Z\",\"createdBy\":1,\"createdByName\":\"Super Admin\"}', '{\"leadId\":8,\"leadCode\":\"LED-3008\",\"followupCode\":\"FUP-B169DB0B19\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:49:26'),
(107, 1, 'FOLLOWUP', 24, 'FOLLOWUP_CREATED', NULL, '{\"id\":24,\"followupCode\":\"FUP-F65CA02FDC\",\"leadId\":8,\"leadCode\":\"LED-3008\",\"leadStage\":\"New\",\"leadStatus\":\"Open\",\"lastTouchAt\":\"2026-10-05T06:33:39.000Z\",\"ownerId\":4,\"ownerName\":\"Subroto\",\"companyName\":\"gg\",\"contactName\":\"gg\",\"contactPhone\":null,\"contactEmail\":null,\"assignedTo\":4,\"assignedToName\":\"Subroto\",\"action\":\"test follow up time\",\"dueAt\":\"2026-10-05T06:33:00.000Z\",\"priority\":\"Low\",\"status\":\"PENDING\",\"notes\":null,\"outcome\":null,\"completedAt\":null,\"completedBy\":null,\"completedByName\":null,\"successorFollowupId\":null,\"statusReason\":null,\"createdAt\":\"2026-10-05T12:03:39.000Z\",\"updatedAt\":\"2026-10-05T12:03:39.000Z\",\"displayStatus\":\"Due today\"}', '{\"leadCode\":\"LED-3008\",\"followupCode\":\"FUP-F65CA02FDC\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 12:03:39'),
(108, 1, 'COMPANY', 15, 'COMPANY_CREATED', NULL, '{\"id\":15,\"companyCode\":\"CMP-1015\",\"name\":\"company test\",\"industry\":\"Manufacturing\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"website\":\"company.com\",\"agencyRelationship\":\"Na\",\"source\":\"Other\",\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T12:55:47.000Z\",\"updatedAt\":\"2026-10-05T12:55:47.000Z\",\"contactsCount\":0}', '{\"companyCode\":\"CMP-1015\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 12:55:47'),
(109, 1, 'CONTACT', 13, 'CONTACT_CREATED', NULL, '{\"id\":13,\"contactCode\":\"CON-2013\",\"companyId\":15,\"companyCode\":\"CMP-1015\",\"companyName\":\"company test\",\"name\":\"Contact Admin\",\"designation\":\"Admin\",\"phone\":\"7894561230\",\"email\":\"admin@gmail.com\",\"isDecisionMaker\":true,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T12:58:13.000Z\",\"updatedAt\":\"2026-10-05T12:58:13.000Z\"}', '{\"contactCode\":\"CON-2013\",\"companyId\":15}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 12:58:13'),
(110, 1, 'LEAD', 9, 'LEAD_CREATED', NULL, '{\"id\":9,\"leadCode\":\"LED-3009\",\"companyId\":16,\"companyName\":\"New Lead\",\"industry\":\"Real Estate\",\"city\":\"Mumbai\",\"website\":\"lead@gmail.com\",\"primaryContactId\":14,\"primaryContactName\":\"M test\",\"primaryContactDesignation\":null,\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":null,\"ownerId\":4,\"ownerName\":\"Subroto\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"Medium\",\"source\":\"Newspaper\",\"serviceRequired\":\"Lead Testing\",\"description\":\"\",\"estimatedValueRupees\":250000,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-05T09:17:45.000Z\",\"nextAction\":\"Test\",\"followUpAt\":\"2026-10-05T11:00:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-05T14:47:45.000Z\",\"updatedAt\":\"2026-10-05T14:47:45.000Z\"}', '{\"leadCode\":\"LED-3009\",\"companyId\":16,\"companyName\":\"New Lead\",\"companyCreated\":true,\"primaryContactId\":14,\"contactName\":\"M test\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"ownerId\":4,\"ownerName\":\"Subroto\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 14:47:45'),
(111, 1, 'ACTIVITY', 83, 'ACTIVITY_CREATED', NULL, '{\"id\":83,\"leadId\":9,\"leadCode\":\"LED-3009\",\"leadStage\":\"New\",\"leadOwnerId\":4,\"companyId\":16,\"companyCode\":\"CMP-1016\",\"companyName\":\"New Lead\",\"contactId\":14,\"contactCode\":\"CON-2014\",\"contactName\":\"M test\",\"activityType\":\"Activity\",\"outcome\":\"Record an interaction\",\"notes\":\"Testing\",\"occurredAt\":\"2026-10-05T09:30:22.000Z\",\"createdBy\":1,\"createdByName\":\"Super Admin\"}', '{\"leadId\":9,\"leadCode\":\"LED-3009\",\"followupCode\":\"FUP-CC6B5BF114\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:00:22'),
(112, 1, 'LEAD', 8, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Contact Research\",\"status\":\"Open\"}', '{\"reason\":\"test\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:57:01'),
(113, 1, 'LEAD', 7, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Meeting\",\"status\":\"Open\"}', '{\"reason\":\"test\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:57:10'),
(114, 1, 'LEAD', 5, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Pitch\",\"status\":\"Open\"}', '{\"reason\":\"test\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:57:52'),
(115, 1, 'LEAD', 4, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Commercials\",\"status\":\"Open\"}', '{\"reason\":\"test\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:58:04'),
(116, 1, 'LEAD', 3, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Contract / PO\",\"status\":\"Open\"}', '{\"reason\":\"test\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:58:16'),
(117, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"stage\":\"Onboarding\",\"status\":\"Open\"}', '{\"reason\":\"test\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:58:31'),
(118, 1, 'LEAD', 1, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"stage\":\"Active Client\",\"status\":\"Active Client\"}', '{\"reason\":\"test\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:58:43'),
(119, 1, 'LEAD', 10, 'LEAD_CREATED', NULL, '{\"id\":10,\"leadCode\":\"LED-3010\",\"companyId\":17,\"companyName\":\"Nurture Test\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"website\":\"nurture.com\",\"primaryContactId\":15,\"primaryContactName\":\"Sunny\",\"primaryContactDesignation\":\"MD\",\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":null,\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"Digital/social\",\"serviceRequired\":\"test\",\"description\":\"\",\"estimatedValueRupees\":150000,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-05T10:30:27.000Z\",\"nextAction\":\"Call\",\"followUpAt\":\"2026-10-05T13:30:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-05T16:00:27.000Z\",\"updatedAt\":\"2026-10-05T16:00:27.000Z\"}', '{\"leadCode\":\"LED-3010\",\"companyId\":17,\"companyName\":\"Nurture Test\",\"companyCreated\":true,\"primaryContactId\":15,\"contactName\":\"Sunny\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:00:27'),
(120, 1, 'LEAD', 10, 'LEAD_STAGE_CHANGED', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"stage\":\"Nurture\",\"status\":\"Open\"}', '{\"reason\":\"test\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:00:41'),
(121, 1, 'COMPANY', 17, 'COMPANY_UPDATED', '{\"id\":17,\"companyCode\":\"CMP-1017\",\"name\":\"Nurture Test\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"website\":\"nurture.com\",\"agencyRelationship\":null,\"source\":\"Digital/social\",\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T16:00:27.000Z\",\"updatedAt\":\"2026-10-05T16:00:27.000Z\",\"contactsCount\":1}', '{\"id\":17,\"companyCode\":\"CMP-1017\",\"name\":\"Nurture Test\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"website\":\"nurture.com\",\"agencyRelationship\":null,\"source\":\"Digital/social\",\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T16:00:27.000Z\",\"updatedAt\":\"2026-10-05T16:00:27.000Z\",\"contactsCount\":1}', '{\"changedFields\":[\"name\",\"industry\",\"city\",\"website\",\"agencyRelationship\"]}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:16:34'),
(122, 1, 'CONTACT', 15, 'CONTACT_UPDATED', '{\"id\":15,\"contactCode\":\"CON-2015\",\"companyId\":17,\"companyCode\":\"CMP-1017\",\"companyName\":\"Nurture Test\",\"name\":\"Sunny\",\"designation\":\"MD\",\"phone\":\"7894561230\",\"email\":null,\"isDecisionMaker\":true,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T16:00:27.000Z\",\"updatedAt\":\"2026-10-05T16:00:27.000Z\"}', '{\"id\":15,\"contactCode\":\"CON-2015\",\"companyId\":17,\"companyCode\":\"CMP-1017\",\"companyName\":\"Nurture Test\",\"name\":\"Sunny test\",\"designation\":\"MD\",\"phone\":\"7894561230\",\"email\":null,\"isDecisionMaker\":true,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T16:00:27.000Z\",\"updatedAt\":\"2026-10-05T17:16:34.000Z\"}', '{\"changedFields\":[\"companyId\",\"name\",\"designation\",\"phone\",\"email\",\"isDecisionMaker\"]}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:16:34'),
(123, 1, 'LEAD', 10, 'LEAD_UPDATED', '{\"id\":10,\"leadCode\":\"LED-3010\",\"companyId\":17,\"companyName\":\"Nurture Test\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"website\":\"nurture.com\",\"primaryContactId\":15,\"primaryContactName\":\"Sunny test\",\"primaryContactDesignation\":\"MD\",\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":null,\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"Nurture\",\"status\":\"Open\",\"priority\":\"High\",\"source\":\"Digital/social\",\"serviceRequired\":\"test\",\"description\":\"\",\"estimatedValueRupees\":150000,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-05T10:30:27.000Z\",\"nextAction\":\"Call\",\"followUpAt\":\"2026-10-05T13:30:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-05T16:00:27.000Z\",\"updatedAt\":\"2026-10-05T10:30:40.000Z\"}', '{\"id\":10,\"leadCode\":\"LED-3010\",\"companyId\":17,\"companyName\":\"Nurture Test\",\"industry\":\"Real Estate\",\"city\":\"Hyderabad\",\"website\":\"nurture.com\",\"primaryContactId\":15,\"primaryContactName\":\"Sunny test\",\"primaryContactDesignation\":\"MD\",\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":null,\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"Nurture\",\"status\":\"Open\",\"priority\":\"Low\",\"source\":\"Digital/social\",\"serviceRequired\":\"test 10\",\"description\":null,\"estimatedValueRupees\":150000,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-05T10:30:27.000Z\",\"nextAction\":\"Call\",\"followUpAt\":\"2026-10-05T13:30:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-05T16:00:27.000Z\",\"updatedAt\":\"2026-10-05T17:16:34.000Z\"}', '{\"previousBranchId\":1,\"newBranchId\":1,\"previousBranchName\":\"Hyderabad\",\"newBranchName\":\"Hyderabad\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:16:34'),
(124, 1, 'LEAD', 11, 'LEAD_CREATED', NULL, '{\"id\":11,\"leadCode\":\"LED-3011\",\"companyId\":18,\"companyName\":\"Split\",\"industry\":\"IT / SaaS\",\"city\":\"Hyderabad\",\"website\":\"split.com\",\"primaryContactId\":16,\"primaryContactName\":\"Shekar\",\"primaryContactDesignation\":\"CEO\",\"primaryContactPhone\":null,\"primaryContactEmail\":null,\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"Low\",\"source\":\"Employee referral\",\"serviceRequired\":\"Demo\",\"description\":\"\",\"estimatedValueRupees\":0,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-05T11:50:00.000Z\",\"nextAction\":\"gg\",\"followUpAt\":\"2026-10-05T12:50:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-05T17:20:00.000Z\",\"updatedAt\":\"2026-10-05T17:20:00.000Z\"}', '{\"leadCode\":\"LED-3011\",\"companyId\":18,\"companyName\":\"Split\",\"companyCreated\":true,\"primaryContactId\":16,\"contactName\":\"Shekar\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:20:00');
INSERT INTO `audit_logs` (`id`, `actor_user_id`, `entity_type`, `entity_id`, `action`, `previous_values`, `new_values`, `metadata`, `ip_address`, `user_agent`, `created_at`) VALUES
(125, 1, 'COMPANY', 18, 'COMPANY_UPDATED', '{\"id\":18,\"companyCode\":\"CMP-1018\",\"name\":\"Split\",\"industry\":\"IT / SaaS\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"website\":\"split.com\",\"agencyRelationship\":null,\"source\":\"Employee referral\",\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T17:19:59.000Z\",\"updatedAt\":\"2026-10-05T17:19:59.000Z\",\"contactsCount\":1}', '{\"id\":18,\"companyCode\":\"CMP-1018\",\"name\":\"Split\",\"industry\":\"IT / SaaS\",\"city\":\"Hyderabad\",\"state\":null,\"country\":\"India\",\"website\":\"split.com\",\"agencyRelationship\":null,\"source\":\"Employee referral\",\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T17:19:59.000Z\",\"updatedAt\":\"2026-10-05T17:19:59.000Z\",\"contactsCount\":1}', '{\"changedFields\":[\"name\",\"industry\",\"city\",\"website\",\"agencyRelationship\"]}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:34:05'),
(126, 1, 'CONTACT', 16, 'CONTACT_UPDATED', '{\"id\":16,\"contactCode\":\"CON-2016\",\"companyId\":18,\"companyCode\":\"CMP-1018\",\"companyName\":\"Split\",\"name\":\"Shekar\",\"designation\":\"CEO\",\"phone\":null,\"email\":null,\"isDecisionMaker\":false,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T17:19:59.000Z\",\"updatedAt\":\"2026-10-05T17:19:59.000Z\"}', '{\"id\":16,\"contactCode\":\"CON-2016\",\"companyId\":18,\"companyCode\":\"CMP-1018\",\"companyName\":\"Split\",\"name\":\"Shekar\",\"designation\":\"CEO\",\"phone\":\"7894561230\",\"email\":null,\"isDecisionMaker\":true,\"status\":\"ACTIVE\",\"notes\":null,\"createdBy\":1,\"updatedBy\":1,\"createdAt\":\"2026-10-05T17:19:59.000Z\",\"updatedAt\":\"2026-10-05T17:34:05.000Z\"}', '{\"changedFields\":[\"companyId\",\"name\",\"designation\",\"phone\",\"email\",\"isDecisionMaker\"]}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:34:05'),
(127, 1, 'LEAD', 11, 'LEAD_UPDATED', '{\"id\":11,\"leadCode\":\"LED-3011\",\"companyId\":18,\"companyName\":\"Split\",\"industry\":\"IT / SaaS\",\"city\":\"Hyderabad\",\"website\":\"split.com\",\"primaryContactId\":16,\"primaryContactName\":\"Shekar\",\"primaryContactDesignation\":\"CEO\",\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":null,\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"Low\",\"source\":\"Employee referral\",\"serviceRequired\":\"Demo\",\"description\":\"\",\"estimatedValueRupees\":0,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-05T11:50:00.000Z\",\"nextAction\":\"gg\",\"followUpAt\":\"2026-10-05T12:50:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-05T17:20:00.000Z\",\"updatedAt\":\"2026-10-05T17:20:00.000Z\"}', '{\"id\":11,\"leadCode\":\"LED-3011\",\"companyId\":18,\"companyName\":\"Split\",\"industry\":\"IT / SaaS\",\"city\":\"Hyderabad\",\"website\":\"split.com\",\"primaryContactId\":16,\"primaryContactName\":\"Shekar\",\"primaryContactDesignation\":\"CEO\",\"primaryContactPhone\":\"7894561230\",\"primaryContactEmail\":null,\"ownerId\":2,\"ownerName\":\"Venu Myakam\",\"branchId\":1,\"branchName\":\"Hyderabad\",\"branchCode\":\"HYDERABAD\",\"stage\":\"New\",\"status\":\"Open\",\"priority\":\"Low\",\"source\":\"Employee referral\",\"serviceRequired\":\"Demo\",\"description\":null,\"estimatedValueRupees\":0,\"knownRelationship\":false,\"lastTouchAt\":\"2026-10-05T11:50:00.000Z\",\"nextAction\":\"gg\",\"followUpAt\":\"2026-10-05T12:50:00.000Z\",\"stageAgeDays\":0,\"createdAt\":\"2026-10-05T17:20:00.000Z\",\"updatedAt\":\"2026-10-05T17:34:05.000Z\"}', '{\"previousBranchId\":1,\"newBranchId\":1,\"previousBranchName\":\"Hyderabad\",\"newBranchName\":\"Hyderabad\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:34:05'),
(128, 1, 'LEAD', 11, 'LEAD_OWNER_CHANGED', '{\"ownerId\":2,\"ownerName\":\"Venu Myakam\"}', '{\"ownerId\":4,\"ownerName\":\"Subroto\"}', '{\"reason\":\"Lead details updated.\",\"branchId\":1,\"branchName\":\"Hyderabad\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:34:05');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(30) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `code`, `name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'HYDERABAD', 'Hyderabad', 1, '2026-09-24 16:51:45', '2026-09-24 16:51:45'),
(2, 'PUNE', 'Pune', 1, '2026-09-24 16:51:45', '2026-09-24 16:51:45'),
(3, 'BANGALORE', 'Bangalore', 1, '2026-09-24 16:51:45', '2026-09-24 16:51:45'),
(4, 'MUMBAI', 'Mumbai', 1, '2026-09-24 16:51:45', '2026-09-24 16:51:45');

-- --------------------------------------------------------

--
-- Table structure for table `briefs`
--

CREATE TABLE `briefs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `business_objective` text DEFAULT NULL,
  `client_problem` text DEFAULT NULL,
  `target_audience` text DEFAULT NULL,
  `campaign_requirement` text DEFAULT NULL,
  `current_activity` text DEFAULT NULL,
  `potential_scope` text DEFAULT NULL,
  `timeline` varchar(500) DEFAULT NULL,
  `budget` varchar(500) DEFAULT NULL,
  `decision_maker` varchar(500) DEFAULT NULL,
  `approval_process` text DEFAULT NULL,
  `expected_deliverables` text DEFAULT NULL,
  `client_expectations` text DEFAULT NULL,
  `competitors` text DEFAULT NULL,
  `category_insights` text DEFAULT NULL,
  `mandatory_requirements` text DEFAULT NULL,
  `status` enum('DRAFT','AWAITING_CLARIFICATION','READY','APPROVED') NOT NULL DEFAULT 'DRAFT',
  `route_type` enum('KNOWN_EXISTING','NEW_UNKNOWN') DEFAULT NULL,
  `route_decision_note` text DEFAULT NULL,
  `route_decided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `route_decided_at` datetime DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `updated_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `briefs`
--

INSERT INTO `briefs` (`id`, `lead_id`, `business_objective`, `client_problem`, `target_audience`, `campaign_requirement`, `current_activity`, `potential_scope`, `timeline`, `budget`, `decision_maker`, `approval_process`, `expected_deliverables`, `client_expectations`, `competitors`, `category_insights`, `mandatory_requirements`, `status`, `route_type`, `route_decision_note`, `route_decided_by`, `route_decided_at`, `approved_by`, `approved_at`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 2, 'Generate qualified residential property enquiries and improve brand awareness for the upcoming premium apartment launch in Hyderabad.', 'The client is receiving a high volume of low-quality digital enquiries and has limited awareness among premium home buyers in the target micro-market.', 'Working professionals, business owners and NRIs aged 28–50 with household income above ₹20 lakh per year, primarily located in Hyderabad and nearby IT corridors.', 'Create an integrated launch campaign covering brand positioning, creative communication, digital lead generation, social media, performance marketing, outdoor advertising and sales-support materials.', 'The client is currently running basic Meta and Google lead-generation campaigns through an existing media partner, with limited creative variation and no integrated campaign strategy.', 'Brand strategy, campaign concept, creative development, social media, performance marketing, outdoor communication, launch collateral, landing page and lead-generation support.', 'Campaign development within 6 weeks, followed by a 3-month launch campaign.', '₹18–25 lakh for creative, digital, media and launch communication.', 'Rajesh Kumar – Director, Marketing & Sales.', 'Marketing team review → Sales Director review → Managing Director final approval.', 'Campaign strategy, key visual, campaign tagline, digital banners, social media creatives, landing page, Google and Meta ads, outdoor adaptations, brochures and sales presentation.', 'Premium positioning, stronger differentiation from nearby competitors, high-quality enquiries and consistent communication across digital and offline channels.', 'Prestige Group, Aparna Constructions, My Home Group, Rajapushpa Properties and local premium residential developments.', 'Home buyers compare projects heavily on location, developer credibility, amenities, possession timeline, pricing and lifestyle value. Digital research strongly influences the final shortlist before a site visit.', 'All communication must include the approved project logo, RERA details, location map, legal disclaimer, possession timeline and approved pricing information.', 'READY', 'KNOWN_EXISTING', 'Tempest has previously worked with real-estate clients and understands the premium residential category, buyer journey and media requirements.', 1, '2026-09-24 09:55:06', NULL, NULL, 1, 1, '2026-09-24 15:25:06', '2026-09-24 15:25:06'),
(2, 6, 'Test Breif', 'Test Breif', 'Test Breif', 'Test Breif', 'Test Breif', 'Test Breif', '5 weeks', '500000', NULL, 'Test Breif', 'Test Breif', 'Test Breif', 'Test Breif', 'Test Breif', 'Test Breif', 'APPROVED', 'NEW_UNKNOWN', 'Test Breif', 1, '2026-09-29 13:12:07', 1, '2026-09-29 13:12:07', 1, 1, '2026-09-29 18:42:07', '2026-09-29 18:42:07');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_code` varchar(32) NOT NULL,
  `name` varchar(190) NOT NULL,
  `industry` varchar(120) DEFAULT NULL,
  `city` varchar(120) DEFAULT NULL,
  `state` varchar(120) DEFAULT NULL,
  `country` varchar(120) DEFAULT 'India',
  `website` varchar(500) DEFAULT NULL,
  `agency_relationship` varchar(255) DEFAULT NULL,
  `source` varchar(120) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `company_code`, `name`, `industry`, `city`, `state`, `country`, `website`, `agency_relationship`, `source`, `status`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'CMP-1001', 'Aster Habitat', 'Real Estate', 'Hyderabad', 'Telangana', 'India', 'https://asterhabitat.example.com', 'Media partner only', 'Referral', 'ACTIVE', 'Potential integrated branding and digital campaign opportunity.', 1, 1, '2026-09-23 14:24:50', '2026-09-23 14:24:50', NULL),
(8, 'CMP-1008', 'Nova Infra Projects', 'Real Estate', 'Hyderabad', NULL, 'India', 'https://novainfra.example.com', 'None', 'LinkedIn', 'ACTIVE', 'Running digital campaigns for a new residential project launch', 1, 1, '2026-09-23 18:13:07', '2026-09-23 18:13:07', NULL),
(9, 'CMP-1009', 'Test Ads', 'Real Estate', 'Hyderabad', NULL, 'India', 'https://lucide.dev/', 'Test', 'LinkedIn', 'ACTIVE', 'Test', 2, 2, '2026-09-28 10:19:47', '2026-09-28 10:19:47', NULL),
(10, 'CMP-1010', 'test', 'Real Estate', 'test', NULL, 'India', 'test.com', 'test', 'LinkedIn', 'ACTIVE', 'test', 1, 1, '2026-09-28 17:27:22', '2026-09-28 17:27:22', NULL),
(11, 'CMP-1011', 'lead test', 'Real Estate', 'hyd', NULL, 'India', 'test.com', 'test', 'LinkedIn', 'ACTIVE', 'testing', 1, 1, '2026-09-28 17:40:37', '2026-09-28 17:40:37', NULL),
(12, 'CMP-1012', 'TLead', 'Real Estate', 'Hyderabad', NULL, 'India', 'tlead.com', 'TLead', 'Employee referral', 'ACTIVE', NULL, 1, 1, '2026-09-29 12:27:08', '2026-09-29 12:27:08', NULL),
(13, 'CMP-1013', 'Static Modal', 'Real Estate', 'Hyd', NULL, 'India', 'modal', NULL, 'Referral', 'ACTIVE', NULL, 1, 1, '2026-10-01 11:25:35', '2026-10-01 11:25:35', NULL),
(14, 'CMP-1014', 'gg', 'Real Estate', NULL, NULL, 'India', NULL, NULL, 'LinkedIn', 'ACTIVE', NULL, 1, 1, '2026-10-01 11:52:14', '2026-10-01 11:52:14', NULL),
(15, 'CMP-1015', 'company test', 'Manufacturing', 'Hyderabad', NULL, 'India', 'company.com', 'Na', 'Other', 'ACTIVE', NULL, 1, 1, '2026-10-05 12:55:47', '2026-10-05 12:55:47', NULL),
(16, 'CMP-1016', 'New Lead', 'Real Estate', 'Mumbai', NULL, 'India', 'lead@gmail.com', 'Na', 'Newspaper', 'ACTIVE', NULL, 1, 1, '2026-10-05 14:47:45', '2026-10-05 14:47:45', NULL),
(17, 'CMP-1017', 'Nurture Test', 'Real Estate', 'Hyderabad', NULL, 'India', 'nurture.com', NULL, 'Digital/social', 'ACTIVE', NULL, 1, 1, '2026-10-05 16:00:27', '2026-10-05 16:00:27', NULL),
(18, 'CMP-1018', 'Split', 'IT / SaaS', 'Hyderabad', NULL, 'India', 'split.com', NULL, 'Employee referral', 'ACTIVE', NULL, 1, 1, '2026-10-05 17:19:59', '2026-10-05 17:19:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `contact_code` varchar(32) NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `is_decision_maker` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `contact_code`, `company_id`, `full_name`, `designation`, `phone`, `email`, `is_decision_maker`, `status`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'CON-2001', 1, 'Ravi Menon', 'Chief Marketing Officer', '9000010001', 'ravi@asterhabitat.demo', 1, 'ACTIVE', NULL, 1, 1, '2026-09-23 16:32:08', '2026-09-23 16:32:08', NULL),
(2, 'CON-2002', 3, 'Bala', 'Developer', '7894561230', 'bala@gmail.com', 1, 'ACTIVE', NULL, 1, 1, '2026-09-23 16:39:07', '2026-09-23 16:39:07', NULL),
(3, 'CON-2003', 8, 'Arjun Reddy', 'Marketing Manager', '9876543210', 'arjun.reddy@novainfra.example.com', 1, 'ACTIVE', NULL, 1, 1, '2026-09-23 18:13:07', '2026-09-23 18:13:07', NULL),
(4, 'CON-2004', 9, 'Tester 01', 'Testing', '7894561230', 'test@gmail.com', 1, 'ACTIVE', NULL, 2, 2, '2026-09-28 10:19:47', '2026-09-28 10:19:47', NULL),
(5, 'CON-2005', 10, 'test01', 'tester', '8789456120', 'test001@gmail.com', 1, 'ACTIVE', NULL, 1, 1, '2026-09-28 17:27:22', '2026-09-28 17:27:22', NULL),
(6, 'CON-2006', 11, 'test venu', 'tester', '7894561230', 'test@gmail.com', 1, 'ACTIVE', NULL, 1, 1, '2026-09-28 17:40:37', '2026-09-28 17:40:37', NULL),
(7, 'CON-2007', 12, 'Raju', 'Ceo', '9874561230', 'raju.ceo@gmail.com', 1, 'ACTIVE', NULL, 1, 1, '2026-09-29 12:27:08', '2026-09-29 12:27:08', NULL),
(8, 'CON-2008', 12, 'Ramesh', 'Lead', '7856987410', 'ramesh@gmail.com', 0, 'ACTIVE', NULL, 1, 1, '2026-09-29 17:42:51', '2026-09-29 17:42:51', NULL),
(9, 'CON-2009', 12, 'Rakesh', 'Tester', '7845121210', 'rakesh@gmail.com', 1, 'ACTIVE', NULL, 1, 1, '2026-09-29 17:44:13', '2026-09-29 17:44:13', NULL),
(10, 'CON-2010', 12, 'test add contact', 'add contact', '7894561230', 'test@gmail.com', 0, 'ACTIVE', NULL, 1, 1, '2026-09-30 17:58:30', '2026-09-30 17:58:30', NULL),
(11, 'CON-2011', 13, 'Modal', 'Modal', '7894561230', NULL, 1, 'ACTIVE', NULL, 1, 1, '2026-10-01 11:25:35', '2026-10-01 11:25:35', NULL),
(12, 'CON-2012', 14, 'gg', NULL, NULL, NULL, 0, 'ACTIVE', NULL, 1, 1, '2026-10-01 11:52:14', '2026-10-01 11:52:14', NULL),
(13, 'CON-2013', 15, 'Contact Admin', 'Admin', '7894561230', 'admin@gmail.com', 1, 'ACTIVE', NULL, 1, 1, '2026-10-05 12:58:13', '2026-10-05 12:58:13', NULL),
(14, 'CON-2014', 16, 'M test', NULL, '7894561230', NULL, 1, 'ACTIVE', NULL, 1, 1, '2026-10-05 14:47:45', '2026-10-05 14:47:45', NULL),
(15, 'CON-2015', 17, 'Sunny test', 'MD', '7894561230', NULL, 1, 'ACTIVE', NULL, 1, 1, '2026-10-05 16:00:27', '2026-10-05 17:16:34', NULL),
(16, 'CON-2016', 18, 'Shekar', 'CEO', '7894561230', NULL, 1, 'ACTIVE', NULL, 1, 1, '2026-10-05 17:19:59', '2026-10-05 17:34:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `followups`
--

CREATE TABLE `followups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `followup_code` varchar(32) NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `assigned_to` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(500) NOT NULL,
  `due_at` datetime NOT NULL,
  `priority` varchar(30) NOT NULL DEFAULT 'MEDIUM',
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `notes` text DEFAULT NULL,
  `outcome` varchar(500) DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `completed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `successor_followup_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status_reason` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `followups`
--

INSERT INTO `followups` (`id`, `followup_code`, `lead_id`, `assigned_to`, `action`, `due_at`, `priority`, `status`, `notes`, `outcome`, `completed_at`, `completed_by`, `successor_followup_id`, `status_reason`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'FUP-5DEB3A9727', 1, 1, 'Review client feedback', '2026-09-24 10:30:00', 'HIGH', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-23 16:58:51', '2026-09-23 21:53:25'),
(2, 'FUP-B7DABCF4AA', 2, 2, 'Schedule discovery meeting', '2026-09-25 04:30:00', 'HIGH', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-23 18:13:07', '2026-09-24 17:59:12'),
(3, 'FUP-90717E3099', 2, 2, 'Send discovery meeting invite', '2026-09-25 06:00:00', 'HIGH', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-23 22:11:29', '2026-09-24 17:59:12'),
(4, 'FUP-411332F14A', 2, 2, 'Send discovery meeting invite', '2026-09-25 04:30:00', 'HIGH', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-23 22:22:07', '2026-09-24 17:59:12'),
(5, 'FUP-B473D6A191', 2, 2, 'Send discovery deck', '2026-09-25 04:30:00', 'High', 'PENDING', 'Send deck before the client review call.', NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-24 00:04:55', '2026-09-24 17:59:12'),
(6, 'FUP-03CB0E6FA8', 2, 2, 'Reconnect regarding Q1 campaign', '2026-11-17 04:30:00', 'Medium', 'PENDING', 'Reconnect once the new-quarter marketing budget is confirmed.', NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-24 12:20:22', '2026-09-24 17:59:12'),
(7, 'FUP-4577097202', 2, 2, 'Reconnect', '2026-10-24 04:30:00', 'Medium', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-24 12:31:16', '2026-09-24 17:59:12'),
(8, 'FUP-1958830197', 2, 2, 'Reconnect', '2026-10-25 04:30:00', 'Medium', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-24 12:47:31', '2026-09-24 17:59:12'),
(9, 'FUP-EB9367DCD5', 1, 1, 'Reconnect Test', '2026-10-25 04:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-24 12:57:43', '2026-09-24 12:57:43'),
(10, 'FUP-1790570987515-IPF9H', 3, 2, 'Meeting', '2026-09-28 05:00:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 2, 2, '2026-09-28 10:19:47', '2026-09-28 10:19:47'),
(11, 'FUP-B865B12255', 1, 1, 'Testing', '2026-09-29 04:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-28 10:23:22', '2026-09-28 10:23:22'),
(12, 'FUP-1790596643000-BIMKN', 4, 2, 'Marketing', '2026-09-30 04:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-28 17:27:23', '2026-09-28 17:27:23'),
(13, 'FUP-1790597437381-KLJ2Z', 5, 2, 'meeting', '2026-09-30 04:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-28 17:40:37', '2026-09-28 17:40:37'),
(14, 'FUP-1790665028228-7R6HM', 6, 4, 'Call with client', '2026-09-29 09:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-29 12:27:08', '2026-09-29 08:27:15'),
(15, 'FUP-1790834135509-G71YJ', 7, 2, 'Call', '2026-10-01 04:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-01 11:25:35', '2026-10-01 11:25:35'),
(16, 'FUP-1790835734760-A3OGY', 8, 4, 'gg', '2026-10-01 06:22:00', 'Medium', 'COMPLETED', 'completed', 'follow up completed', '2026-10-01 07:25:31', 1, 17, NULL, 1, 1, '2026-10-01 11:52:14', '2026-10-01 12:55:31'),
(17, 'FUP-8C6A5D72BD', 8, 4, 'Call', '2026-10-01 04:30:00', 'Medium', 'COMPLETED', 'Completed follow-up', 'Completed follow-up', '2026-10-01 09:12:57', 1, 21, NULL, 1, 1, '2026-10-01 12:55:31', '2026-10-01 14:42:57'),
(18, 'FUP-75D03B39B0', 8, 4, 'meeting', '2026-10-02 04:30:00', 'High', 'RESCHEDULED', NULL, NULL, NULL, NULL, 22, 'Client not available', 1, 1, '2026-10-01 14:25:46', '2026-10-01 14:44:30'),
(19, 'FUP-D700863053', 8, 4, 'meeting', '2026-10-02 04:30:00', 'Medium', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-01 14:26:04', '2026-10-01 14:26:04'),
(20, 'FUP-DC063DD82E', 8, 4, 'brief follow up', '2026-10-02 04:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-01 14:42:00', '2026-10-01 14:42:00'),
(21, 'FUP-8008AD0E00', 8, 4, 'Meeting with Client', '2026-10-02 04:30:00', 'Medium', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-01 14:42:57', '2026-10-01 14:42:57'),
(22, 'FUP-598789E0FF', 8, 4, 'meeting', '2026-10-05 04:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-01 14:44:30', '2026-10-01 14:44:30'),
(23, 'FUP-B169DB0B19', 8, 4, 'date function', '2026-10-05 04:30:00', 'Medium', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-01 14:49:26', '2026-10-01 14:49:26'),
(24, 'FUP-F65CA02FDC', 8, 4, 'test follow up time', '2026-10-05 06:33:00', 'Low', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-05 12:03:39', '2026-10-05 12:03:39'),
(25, 'FUP-1791191865736-GJSX8', 9, 4, 'Test', '2026-10-05 11:00:00', 'Medium', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-05 14:47:45', '2026-10-05 14:47:45'),
(26, 'FUP-CC6B5BF114', 9, 4, 'Add Activity', '2026-10-05 04:30:00', 'Medium', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-05 15:00:22', '2026-10-05 15:00:22'),
(27, 'FUP-1791196227654-2H9XO', 10, 2, 'Call', '2026-10-05 13:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-05 16:00:27', '2026-10-05 16:00:27'),
(28, 'FUP-1791201000004-ZSCD9', 11, 4, 'gg', '2026-10-05 12:50:00', 'Low', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-10-05 17:20:00', '2026-10-05 12:04:05');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_code` varchar(32) NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `primary_contact_id` bigint(20) UNSIGNED DEFAULT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `stage` varchar(50) NOT NULL DEFAULT 'NEW',
  `status` varchar(50) NOT NULL DEFAULT 'OPEN',
  `priority` varchar(30) NOT NULL DEFAULT 'MEDIUM',
  `source` varchar(120) DEFAULT NULL,
  `service_required` varchar(255) DEFAULT NULL,
  `estimated_value_paise` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `next_action` varchar(500) DEFAULT NULL,
  `follow_up_at` datetime DEFAULT NULL,
  `last_touch_at` datetime DEFAULT NULL,
  `known_relationship` tinyint(1) NOT NULL DEFAULT 0,
  `lifecycle_reason` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `estimated_value_rupees` decimal(15,2) NOT NULL DEFAULT 0.00,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `lead_code`, `company_id`, `primary_contact_id`, `owner_id`, `stage`, `status`, `priority`, `source`, `service_required`, `estimated_value_paise`, `next_action`, `follow_up_at`, `last_touch_at`, `known_relationship`, `lifecycle_reason`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `estimated_value_rupees`, `branch_id`) VALUES
(1, 'LED-3001', 1, 1, 1, 'Active Client', 'Active Client', 'High', 'Referral', 'Integrated launch campaign', 250000000, 'Testing', '2026-09-29 04:30:00', '2026-09-28 04:53:22', 0, 'Test Nurture', 'Residential launch campaign with digital and media requirements.', 1, 1, '2026-09-23 16:58:51', '2026-10-05 10:28:43', NULL, 0.00, 1),
(2, 'LED-3002', 8, 3, 2, 'Onboarding', 'Open', 'High', 'LinkedIn', 'Integrated branding and digital launch campaign', 180000000, 'Reconnect when relevant', '2026-10-25 04:30:00', '2026-09-24 07:19:55', 1, 'Test Lost to connected', 'Client is planning a residential project launch and requires branding, social media, digital advertising, lead generation and campaign strategy.', 1, 1, '2026-09-23 18:13:07', '2026-10-05 10:28:31', NULL, 0.00, 1),
(3, 'LED-3003', 9, 4, 2, 'Contract / PO', 'Open', 'High', 'LinkedIn', 'Testing', 0, 'Meeting', '2026-09-28 05:00:00', '2026-09-28 04:49:47', 1, NULL, 'Testing', 2, 1, '2026-09-28 10:19:47', '2026-10-05 10:28:16', NULL, 150000.00, 1),
(4, 'LED-3004', 10, 5, 2, 'Commercials', 'Open', 'High', 'LinkedIn', 'Testing', 0, 'Marketing', '2026-09-30 04:30:00', '2026-09-28 11:57:22', 0, NULL, 'Test', 1, 1, '2026-09-28 17:27:22', '2026-10-05 10:28:04', NULL, 120000.00, 1),
(5, 'LED-3005', 11, 6, 2, 'Pitch', 'Open', 'High', 'LinkedIn', 'testing', 0, 'meeting', '2026-09-30 04:30:00', '2026-09-28 12:10:37', 0, NULL, 'test', 1, 1, '2026-09-28 17:40:37', '2026-10-05 10:27:52', NULL, 120000.00, 1),
(6, 'LED-3006', 12, 7, 4, 'Brief', 'Open', 'High', 'Employee referral', 'Website Development', 0, 'Call with client', '2026-09-29 09:30:00', '2026-09-29 06:57:08', 0, NULL, 'Website Development', 1, 1, '2026-09-29 12:27:08', '2026-09-30 11:12:13', NULL, 150000.00, 1),
(7, 'LED-3007', 13, 11, 2, 'Meeting', 'Open', 'High', 'Referral', 'Static', 0, 'Call', '2026-10-01 04:30:00', '2026-10-01 05:55:35', 0, NULL, '', 1, 1, '2026-10-01 11:25:35', '2026-10-05 10:27:10', NULL, 120000.00, 1),
(8, 'LED-3008', 14, 12, 4, 'Contact Research', 'Open', 'Medium', 'LinkedIn', 'gg', 0, 'test follow up time', '2026-10-05 06:33:00', '2026-10-05 06:33:39', 0, NULL, '', 1, 1, '2026-10-01 11:52:14', '2026-10-05 10:27:01', NULL, 0.00, 1),
(9, 'LED-3009', 16, 14, 4, 'New', 'Open', 'Medium', 'Newspaper', 'Lead Testing', 0, 'Add Activity', '2026-10-05 04:30:00', '2026-10-05 09:30:22', 0, NULL, '', 1, 1, '2026-10-05 14:47:45', '2026-10-05 15:00:22', NULL, 250000.00, 1),
(10, 'LED-3010', 17, 15, 2, 'Nurture', 'Open', 'Low', 'Digital/social', 'test 10', 0, 'Call', '2026-10-05 13:30:00', '2026-10-05 10:30:27', 0, NULL, NULL, 1, 1, '2026-10-05 16:00:27', '2026-10-05 17:16:34', NULL, 150000.00, 1),
(11, 'LED-3011', 18, 16, 4, 'New', 'Open', 'Low', 'Employee referral', 'Demo', 0, 'gg', '2026-10-05 12:50:00', '2026-10-05 11:50:00', 0, NULL, NULL, 1, 1, '2026-10-05 17:20:00', '2026-10-05 12:04:05', NULL, 0.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `lead_stage_history`
--

CREATE TABLE `lead_stage_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `previous_stage` varchar(100) DEFAULT NULL,
  `new_stage` varchar(100) DEFAULT NULL,
  `from_stage` varchar(50) DEFAULT NULL,
  `to_stage` varchar(50) NOT NULL,
  `changed_by` bigint(20) UNSIGNED NOT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_stage_history`
--

INSERT INTO `lead_stage_history` (`id`, `lead_id`, `previous_stage`, `new_stage`, `from_stage`, `to_stage`, `changed_by`, `reason`, `metadata`, `created_at`) VALUES
(1, 1, NULL, NULL, NULL, 'New', 1, 'Lead created.', '{\"initialStage\":true}', '2026-09-23 16:58:51'),
(2, 1, NULL, NULL, 'New', 'Contact Research', 1, 'Research', NULL, '2026-09-23 17:56:40'),
(3, 2, NULL, NULL, NULL, 'New', 1, 'Lead created.', '{\"initialStage\":true}', '2026-09-23 18:13:07'),
(4, 2, NULL, NULL, 'New', 'Brief', 1, 'Test Brief', NULL, '2026-09-23 18:47:54'),
(5, 2, NULL, NULL, 'Brief', 'New', 1, 'new', NULL, '2026-09-23 18:49:17'),
(6, 1, NULL, NULL, 'Contact Research', 'Connected', 1, 'Connected on call', NULL, '2026-09-23 22:22:45'),
(7, 2, NULL, NULL, 'New', 'Brief', 1, 'Testing Brief', NULL, '2026-09-23 22:37:02'),
(8, 2, NULL, NULL, 'Brief', 'Lost', 1, 'Test Nurture', NULL, '2026-09-24 12:16:20'),
(9, 2, NULL, NULL, 'Lost', 'Connected', 1, 'Test connected', NULL, '2026-09-24 12:17:30'),
(10, 2, NULL, NULL, 'Connected', 'Lost', 1, 'test lost', NULL, '2026-09-24 12:19:18'),
(11, 2, NULL, NULL, 'Lost', 'Connected', 1, 'Test Lost to connected', NULL, '2026-09-24 12:49:55'),
(12, 1, NULL, NULL, 'Connected', 'Lost', 1, 'Test Lost', NULL, '2026-09-24 12:56:18'),
(13, 1, NULL, NULL, 'Lost', 'Nurture', 1, 'Test Nurture', NULL, '2026-09-24 12:57:11'),
(14, 2, 'Connected', 'Nurture', NULL, '', 1, 'No response: Testing Mark as Lost', NULL, '2026-09-24 09:08:58'),
(15, 2, 'Nurture', 'Connected', NULL, '', 1, 'Test Nurture to Connected Stage', NULL, '2026-09-24 09:10:16'),
(16, 2, 'Connected', 'Nurture', NULL, '', 1, 'Test Nurture', NULL, '2026-09-24 09:12:21'),
(17, 2, 'Nurture', 'Meeting', NULL, '', 1, 'Test Changed to Meeting', NULL, '2026-09-24 09:14:04'),
(18, 1, 'Nurture', 'Connected', NULL, '', 1, 'Testing moved nurture to connected', NULL, '2026-09-24 09:16:11'),
(19, 1, 'Connected', 'Nurture', NULL, '', 1, 'Test moved to nurture', NULL, '2026-09-24 09:20:22'),
(20, 1, 'Nurture', 'Brief', NULL, '', 1, 'Test Moved from nurture to Brief', NULL, '2026-09-24 09:21:30'),
(21, 2, 'Meeting', 'Brief', NULL, '', 1, 'Test Brief', NULL, '2026-09-24 09:55:52'),
(22, 3, NULL, 'New', NULL, '', 2, 'Lead created.', NULL, '2026-09-28 04:49:47'),
(23, 4, NULL, 'New', NULL, '', 1, 'Lead created.', NULL, '2026-09-28 11:57:22'),
(24, 5, NULL, 'New', NULL, '', 1, 'Lead created.', NULL, '2026-09-28 12:10:37'),
(25, 6, NULL, 'New', NULL, '', 1, 'Lead created.', NULL, '2026-09-29 06:57:08'),
(26, 6, 'New', 'Contact Research', NULL, '', 1, 'gg', NULL, '2026-09-29 10:32:31'),
(27, 6, 'Contact Research', 'Brief', NULL, '', 1, 'Brief Received', NULL, '2026-09-30 11:04:42'),
(28, 6, 'Brief', 'New', NULL, '', 1, 'Move back to new stage', NULL, '2026-09-30 11:08:55'),
(29, 6, 'New', 'Contact Research', NULL, '', 1, 'next stage', NULL, '2026-09-30 11:10:24'),
(30, 6, 'Contact Research', 'Connected', NULL, '', 1, 'moved to new stage', NULL, '2026-09-30 11:11:08'),
(31, 6, 'Connected', 'Meeting', NULL, '', 1, 'moved to next stage meeting', NULL, '2026-09-30 11:11:33'),
(32, 6, 'Meeting', 'Brief', NULL, '', 1, 'Changed to Brief stage, Brief received', NULL, '2026-09-30 11:12:13'),
(33, 7, NULL, 'New', NULL, '', 1, 'Lead created.', NULL, '2026-10-01 05:55:35'),
(34, 8, NULL, 'New', NULL, '', 1, 'Lead created.', NULL, '2026-10-01 06:22:14'),
(35, 9, NULL, 'New', NULL, '', 1, 'Lead created.', NULL, '2026-10-05 09:17:45'),
(36, 8, 'New', 'Contact Research', NULL, '', 1, 'test', NULL, '2026-10-05 10:27:01'),
(37, 7, 'New', 'Meeting', NULL, '', 1, 'test', NULL, '2026-10-05 10:27:10'),
(38, 5, 'New', 'Pitch', NULL, '', 1, 'test', NULL, '2026-10-05 10:27:52'),
(39, 4, 'New', 'Commercials', NULL, '', 1, 'test', NULL, '2026-10-05 10:28:04'),
(40, 3, 'New', 'Contract / PO', NULL, '', 1, 'test', NULL, '2026-10-05 10:28:16'),
(41, 2, 'Brief', 'Onboarding', NULL, '', 1, 'test', NULL, '2026-10-05 10:28:31'),
(42, 1, 'Brief', 'Active Client', NULL, '', 1, 'test', NULL, '2026-10-05 10:28:43'),
(43, 10, NULL, 'New', NULL, '', 1, 'Lead created.', NULL, '2026-10-05 10:30:27'),
(44, 10, 'New', 'Nurture', NULL, '', 1, 'test', NULL, '2026-10-05 10:30:40'),
(45, 11, NULL, 'New', NULL, '', 1, 'Lead created.', NULL, '2026-10-05 11:50:00');

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `meeting_code` varchar(32) NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime DEFAULT NULL,
  `meeting_type` varchar(50) NOT NULL DEFAULT 'VIDEO_CALL',
  `participants_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`participants_json`)),
  `status` varchar(50) NOT NULL DEFAULT 'SCHEDULED',
  `meeting_url` varchar(500) DEFAULT NULL,
  `location` varchar(500) DEFAULT NULL,
  `agenda` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `next_action` varchar(500) DEFAULT NULL,
  `follow_up_at` datetime DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `completed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status_reason` text DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meetings`
--

INSERT INTO `meetings` (`id`, `meeting_code`, `lead_id`, `contact_id`, `title`, `starts_at`, `ends_at`, `meeting_type`, `participants_json`, `status`, `meeting_url`, `location`, `agenda`, `notes`, `outcome`, `next_action`, `follow_up_at`, `created_by`, `updated_by`, `completed_at`, `completed_by`, `status_reason`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(1, 'MET-1001', 2, 3, 'Nova Infra discovery meeting', '2026-09-25 05:30:00', '2026-09-25 06:30:00', 'VIDEO_CALL', '[\"Arjun Reddy\",\"Super Admin\"]', 'CANCELLED', 'https://meet.example.com/nova-discovery', NULL, 'Understand launch timeline, campaign objectives and media requirements.', NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, 'testing', NULL, '2026-09-23 22:50:03', '2026-09-23 23:42:14'),
(2, 'MET-1002', 1, 1, 'Test Schedule meeting', '2026-09-24 05:30:00', '2026-09-24 06:30:00', 'PHONE_CALL', NULL, 'COMPLETED', NULL, NULL, 'Testing Schedule meeting', 'Completed meeting', 'Test', 'Testing', '2026-09-29 04:30:00', 1, 1, '2026-09-28 04:53:22', 1, NULL, NULL, '2026-09-23 23:04:08', '2026-09-28 10:23:22'),
(3, 'MET-1003', 6, 7, 'Call with Client', '2026-09-29 09:30:00', '2026-09-29 10:30:00', 'PHONE_CALL', NULL, 'SCHEDULED', NULL, NULL, 'Call with Client', NULL, NULL, NULL, NULL, 4, 4, NULL, NULL, NULL, NULL, '2026-09-29 12:52:17', '2026-09-29 12:52:17'),
(4, 'MET-1004', 8, 12, 'test time', '2026-10-01 09:20:00', '2026-10-01 10:20:00', 'VIDEO_CALL', NULL, 'SCHEDULED', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL, '2026-10-01 14:41:04', '2026-10-01 14:41:04');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notification_type` varchar(80) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` varchar(1000) NOT NULL,
  `action_url` varchar(500) DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nurture_profiles`
--

CREATE TABLE `nurture_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `category` enum('LATER','NO_RESPONSE','LOST_NOT_INTERESTED','FUTURE_OPPORTUNITY') NOT NULL DEFAULT 'FUTURE_OPPORTUNITY',
  `reason` varchar(500) DEFAULT NULL,
  `buying_stage` varchar(150) DEFAULT NULL,
  `communication_status` enum('NOT_CONTACTED','CONTACTED','ENGAGED','NO_RESPONSE','DO_NOT_CONTACT') NOT NULL DEFAULT 'NOT_CONTACTED',
  `reconnect_at` datetime DEFAULT NULL,
  `entered_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nurture_profiles`
--

INSERT INTO `nurture_profiles` (`id`, `lead_id`, `category`, `reason`, `buying_stage`, `communication_status`, `reconnect_at`, `entered_at`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 2, 'LATER', 'Test Nurture', NULL, 'NOT_CONTACTED', '2026-10-25 04:30:00', '2026-09-24 06:49:22', 1, 1, '2026-09-24 12:19:22', '2026-09-24 14:42:21'),
(6, 1, 'LATER', 'Test moved to nurture', NULL, 'NOT_CONTACTED', '2026-10-25 04:30:00', '2026-09-24 07:27:43', 1, 1, '2026-09-24 12:57:43', '2026-09-24 14:50:22'),
(10, 10, 'LATER', 'test', NULL, 'NOT_CONTACTED', '2026-10-05 13:30:00', '2026-10-05 10:30:40', 1, 1, '2026-10-05 16:00:40', '2026-10-05 16:00:40');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `replaced_by_token_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_ip` varchar(64) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `replaced_by_token_id`, `created_ip`, `user_agent`, `created_at`) VALUES
(2, 1, '4b2d295d35da434a155f058b69040b3edf89d2c6cbaa7779f7101af4148bad64', '2026-09-29 10:08:04', '2026-09-22 10:26:33', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-22 15:38:04'),
(3, 1, '7ba604ffe0ee830bc9b368f15fe8bdabb387bbf89050c98435ab42ffb997ee20', '2026-09-29 10:19:43', '2026-09-22 10:19:59', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 15:49:43'),
(4, 1, '125713062d7f3020b3b763ddab889721d1796435798262734345c4ba79f5e08b', '2026-09-29 10:21:55', '2026-09-22 10:21:58', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 15:51:55'),
(5, 1, '5f23637963581e5fea23542aa03e33b2a9cfac4881cd49f080c1d7d85db633c1', '2026-09-29 10:22:39', '2026-09-22 10:23:56', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 15:52:39'),
(6, 1, '0601326ec0bd5b8e1571fcaf691a68fd3a85da2f16715516e06538aedfea0a47', '2026-09-29 10:24:05', '2026-09-22 10:26:33', 7, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 15:54:05'),
(7, 1, '794d22046a244119b6d3244a282452d239ed0bf3e17727991af9e5b14e85b156', '2026-09-29 10:26:33', '2026-09-22 10:26:33', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 15:56:33'),
(8, 1, 'f416404f1dbf91801dfda878115ceb4c68ab937453dcc23845f35c5bbed09ed4', '2026-09-29 10:33:01', '2026-09-22 10:34:24', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 16:03:01'),
(9, 1, '17384902ee940a3d84354cbb493516b0f5cabc6d27bf8662c83850a6628045d0', '2026-09-29 10:34:26', '2026-09-22 10:51:07', 10, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 16:04:26'),
(10, 1, 'b15f0e2fe20e1acbe299aa8b98e44b960899ce6bddb84bf52b83015f03785515', '2026-09-29 10:51:07', '2026-09-22 10:51:07', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 16:21:07'),
(11, 1, '5cadeba3ec03fdf4b6734455d2356472ff5be3decc38a981794399d2479c99cf', '2026-09-29 10:52:37', '2026-09-22 10:52:42', 12, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 16:22:37'),
(12, 1, '5295ecdedfa009b52c7429250536d76db225c83f6e30230a0421a77b6419c3d8', '2026-09-29 10:52:42', '2026-09-22 10:52:42', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 16:22:42'),
(13, 1, 'eaa596db3cc45b322a4a3f6bbcb6f226ac5543ac2441dd4be61e1b864d93d870', '2026-09-29 11:04:09', '2026-09-22 11:06:45', 14, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 16:34:09'),
(14, 1, 'b1376cb60b8c5a309859bed7643e4371c770b1e10ba022922cef39680a1c1001', '2026-09-29 11:06:45', '2026-09-22 11:06:45', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 16:36:45'),
(15, 1, '0b1112acf0f2aa36722d7e9f61fc3dc5e65d440b8ec2c531108cc6901ed6247f', '2026-09-29 11:09:31', '2026-09-23 04:51:00', 16, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-22 16:39:31'),
(16, 1, 'e48c1b5558cd876516b9a89423d34c531e6ced82fbd1fd36975ed377f0906f7b', '2026-09-30 04:51:00', '2026-09-23 04:51:03', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 10:21:00'),
(17, 1, '5e38c31e4c6d724e770ac61b29bc4ee721f86b43da470b61904070429bfb4900', '2026-09-30 04:51:13', '2026-09-23 04:51:16', 18, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 10:21:13'),
(18, 1, '1db3d50d7c63e7539f9797dbb615878fe71f06d9ff8f12c1afbdf922fab3dd48', '2026-09-30 04:51:16', '2026-09-23 05:05:05', 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 10:21:16'),
(19, 1, '0dd0aa99452ffc8e943eb97a51ff92216f70116d9940dfd163716f6c7335ce62', '2026-09-30 05:05:05', '2026-09-23 06:02:22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 10:35:05'),
(20, 1, 'd84b5829a6bad22d92b4cc089c024e4b362ae87096fcafad4c4090a8bcdb94bd', '2026-09-30 06:02:59', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 11:32:59'),
(21, 1, 'f9df88f601aa3f0fa8998741ccf4414c9d755112b9819d526e876ff591282cb4', '2026-09-30 06:06:39', '2026-09-23 06:29:51', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 11:36:39'),
(22, 1, 'a584458128867e447616e68f48d9222d51c8a33c28a05672f0db8434bf427de6', '2026-09-30 06:07:39', '2026-09-29 06:50:23', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 11:37:39'),
(23, 1, '015ba96a35f2e91c5579f70881999500d49ab107a2559b0cdcf34783a4edc537', '2026-09-30 06:29:51', '2026-09-23 06:34:58', 24, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 11:59:51'),
(24, 1, '032db0730bff3dc4370c1f72db38b81df7d42e63f2ae3a5f0bd08d01e7110f73', '2026-09-30 06:34:58', '2026-09-23 06:36:17', 25, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:04:58'),
(25, 1, '069b6e0f72596b78845b34a62fefcccf422f6b722efdb92d290cf8434c65f61b', '2026-09-30 06:36:17', '2026-09-23 07:08:43', 26, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:06:17'),
(26, 1, 'f846438f0435e41da042adbf9d629c1ac08250689974fc46601d1b49cae9c3cb', '2026-09-30 07:08:43', '2026-09-23 07:09:01', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:38:43'),
(27, 1, 'bbcc1d22267bb0114983033d7c06d809cac1de6ac4ea6ba00d521e3474f27357', '2026-09-30 07:09:03', '2026-09-23 07:13:36', 28, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:39:03'),
(28, 1, '1540e51faa23e54dda5d2c4ac1196e3be595d3439092a46b4a2e2e301cd11305', '2026-09-30 07:13:36', '2026-09-23 07:14:10', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:43:36'),
(29, 1, '201fb9f9c3de4081365229d24e65bb746e61130974d7d0c563afe99d4cc7ab64', '2026-09-30 07:14:12', '2026-09-23 07:14:14', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:44:12'),
(30, 1, '7c4a45b777edb7b09bf38de96e9606036ccf4f0f951ed471020bf6520e78b993', '2026-09-30 07:14:20', '2026-09-23 07:15:06', 31, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:44:20'),
(31, 1, 'ab8ad52868b157c7396f87a4f41727d8e46347b54dff789efd6c52de2c1ea185', '2026-09-30 07:15:06', '2026-09-23 07:31:54', 32, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 12:45:06'),
(32, 1, 'd93a1f35e727d128619fd7e99454a011bd527d6d126c8ba4b793ec12277d0cbc', '2026-09-30 07:31:54', '2026-09-23 08:42:07', 33, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 13:01:54'),
(33, 1, '22c9065851752c476bde0c9b0e48a9cda9ee16368d80fc7e39871eb4cd2b9fd5', '2026-09-30 08:42:07', '2026-09-23 08:42:11', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:12:07'),
(34, 1, 'e0ef0fab40d6e2ffe60f17c266f44dba112b6a9c670133104ab2de24b58dd2e0', '2026-09-30 08:42:12', '2026-09-23 08:46:56', 35, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:12:12'),
(35, 1, 'b8a8064f6eb0116ef801bd2d8d406b65b35b31065a871b1a4ef099b2a4fc5f2e', '2026-09-30 08:46:56', '2026-09-23 08:47:01', 36, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:16:56'),
(36, 1, '5eb3dad94763d382d504df727f05633a94c6c76105a1357e89fcc41323e11175', '2026-09-30 08:47:01', '2026-09-23 09:15:33', 37, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:17:01'),
(37, 1, '507c573882c119e0844c0f62c50099886e79545a5e06b8f95b08d2ddb0f9184a', '2026-09-30 09:15:33', '2026-09-23 10:37:24', 38, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 14:45:33'),
(38, 1, '4fbe7b6cfe8438b8808e6ac7a4c27794945c0668f28c5e48bee875b71b5ed4f5', '2026-09-30 10:37:24', '2026-09-23 10:37:25', 39, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:07:24'),
(39, 1, 'ef01b46fbde9493057a242bd833b86d65eeee33ad83051d0744501691f025131', '2026-09-30 10:37:25', '2026-09-23 10:40:01', 40, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:07:25'),
(40, 1, '579acf68313e3e9aa070bd3b9651f10a2ba349f0401bc3d50105058d4c5bd865', '2026-09-30 10:40:01', '2026-09-23 10:43:21', 41, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:10:01'),
(41, 1, '0b6a2fea8cb122866cd62ab8f90943c341a4ba9328e1f0500de2efde86e2f635', '2026-09-30 10:43:21', '2026-09-23 10:59:22', 42, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:13:21'),
(42, 1, '6f27b363c3ffbb968d30d80d116a086424ff527fad2d15a2566bc02f8c64095b', '2026-09-30 10:59:22', '2026-09-23 10:59:24', 43, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:29:22'),
(43, 1, '829b47159bddb7fd0e146d68c01a8a7d114c1b538112e17ee8cacbe16d19abf0', '2026-09-30 10:59:24', '2026-09-23 11:07:38', 45, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:29:24'),
(44, 1, 'f9b64169a23be82ee6679d2c68b38ee37fe8f03338fbae3ff10b44e83c94ed1b', '2026-09-30 11:01:51', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 16:31:51'),
(45, 1, 'd64c2efb30603923737af3f5b86e4f2e6fca9014f4eaf3a6715d60ab6cc68439', '2026-09-30 11:07:38', '2026-09-23 11:11:52', 46, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:37:38'),
(46, 1, '158e618f6e22c41395e1253bc2f5cbfdafe37d6e544622c8b5e10d57ae20d0a3', '2026-09-30 11:11:52', '2026-09-23 11:13:58', 47, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 16:41:52'),
(47, 1, '7aca1e16758a3f71f08beb5bc469d5a8e7540f33b56b81402185c07cf6205108', '2026-09-30 11:13:58', '2026-09-23 11:30:36', 49, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:43:58'),
(48, 1, '1615cf8a31733a911577d9082c95bd6fc9dd4a903cb603e797f2e0a969f181fa', '2026-09-30 11:27:54', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 16:57:54'),
(49, 1, 'e10097172925f9f2e440339b1610ff84fc31ffae6493037cec8e31ed505411a2', '2026-09-30 11:30:36', '2026-09-23 12:07:41', 50, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:00:36'),
(50, 1, '37f6af414b94826e6e07eaf5e2f4f761deb766dd276799db67a920b670034e38', '2026-09-30 12:07:41', '2026-09-23 12:07:43', 51, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:37:41'),
(51, 1, 'd572035e9ebdba3f3a91c80d76cc0aa6c94d361c6c7dbcb7162733ac0b5c4064', '2026-09-30 12:07:43', '2026-09-23 12:14:44', 52, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:37:43'),
(52, 1, '1c87f874ba7906d0a2fe7c1f076de531982d97d68b0fe868bdc8a9792a60f550', '2026-09-30 12:14:44', '2026-09-23 12:15:02', 53, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:44:44'),
(53, 1, '47e301714a8118447d5c675b2fbcc725444480d8ba2cef9888fc965dd4f176c9', '2026-09-30 12:15:02', '2026-09-23 12:15:11', 54, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:45:02'),
(54, 1, '1af392c510104eb3fbe289c543f9da2d9e9d7967fd940e848c36b81dd4461cdc', '2026-09-30 12:15:11', '2026-09-23 12:25:05', 55, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:45:11'),
(55, 1, '12197c5317170860c5ad3c5323f18581361fb59ab846ffa76fbbc777be40d6c5', '2026-09-30 12:25:05', '2026-09-23 12:25:34', 56, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:55:05'),
(56, 1, '8a41866801df404318e394fadcd66f75d943585f097d482205cccba2a1ebb873', '2026-09-30 12:25:34', '2026-09-23 12:25:37', 57, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:55:34'),
(57, 1, 'a0124a7d8742abfbe801d3c8e2df8897289f665814116d1efaf86298bc96af0b', '2026-09-30 12:25:37', '2026-09-23 12:27:08', 58, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:55:37'),
(58, 1, 'fc4dcffcd52f187e0c446240ea0fa2dbf124adc59e74cbb404dd7d8d86592d52', '2026-09-30 12:27:08', '2026-09-23 12:28:22', 59, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:57:08'),
(59, 1, '7b4a3457516b9d9ba12f7d57870ce3e5af6d0aa538d1c428d135c0fe393053ab', '2026-09-30 12:28:22', '2026-09-23 12:40:37', 60, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 17:58:22'),
(60, 1, 'c8183e4d35013ae16076af2053f93b46fa6715f6b3ae3cb9b889e94d5abe279c', '2026-09-30 12:40:37', '2026-09-23 12:40:40', 61, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:10:37'),
(61, 1, '248ebd6ac82f4a3cf5de1b93b44a731d7d22f688a5d1eae23abb1252a5410768', '2026-09-30 12:40:40', '2026-09-23 12:40:42', 62, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:10:40'),
(62, 1, 'd1f6bd8202af6b60aca39cc0d21bfc3f4c7bcad815c10c950f50ed1d57a64987', '2026-09-30 12:40:42', '2026-09-23 12:40:48', 63, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:10:42'),
(63, 1, '63727f66f5dee2fa9b422c0647d68194c7156f691f0a2fb49e9556605d8272e6', '2026-09-30 12:40:48', '2026-09-23 12:40:50', 64, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:10:48'),
(64, 1, '07d31edd6b6b58cd272f1f84ae9dbdaeb13f96d586bdbd198bbff9ad398911ed', '2026-09-30 12:40:50', '2026-09-23 12:45:03', 65, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:10:50'),
(65, 1, '99dd2f976131de0874f7eff799c999cda84af1948638cbf70772545d9a47d6bb', '2026-09-30 12:45:03', '2026-09-23 13:06:49', 66, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:15:03'),
(66, 1, '85cc23b4e88d9427a519d9768391b4dc97090d7864e0815aac6760cc37e8641a', '2026-09-30 13:06:49', '2026-09-23 13:07:54', 67, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:36:49'),
(67, 1, 'ebef5c4da70254496243541131b33ae4c19b04316e243c1ff8d246276517ed06', '2026-09-30 13:07:54', '2026-09-23 13:14:59', 68, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:37:54'),
(68, 1, 'af0ecd3e41399788965a9fd1499e2bcad1cd53841116c27ffdea79c8e53d2749', '2026-09-30 13:14:59', '2026-09-29 06:50:23', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:44:59'),
(69, 1, '4aecf9a6acadb7b56fec330c560d90d6ba8fc615bd5f4cbaf1436e8a0480765f', '2026-09-30 16:04:08', '2026-09-23 16:04:44', 70, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:34:08'),
(70, 1, 'd5905ac124df24007e74cb923ef3b13607098c9e79f3bde6eda3d5f2c4539af9', '2026-09-30 16:04:44', '2026-09-23 16:19:05', 71, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:34:44'),
(71, 1, '072eabb1351a23a51cf1573c999340fc64bf3b2a4aaeaf8810ba3fed90f19d5d', '2026-09-30 16:19:05', '2026-09-23 16:21:19', 72, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:49:05'),
(72, 1, '053f5244364ef2a66ceb51c288c17ed290c176f746e1b78d48131097bd04acba', '2026-09-30 16:21:19', '2026-09-23 16:26:14', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:51:19'),
(73, 2, 'cdb38879ffc8cefff210d16c3b43fa006175c94b24af50ae9b600924cb4102f1', '2026-09-30 16:26:47', '2026-09-23 16:27:19', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:56:47'),
(74, 1, '9c5a729706e47055b4a6ad76376861a3a31d5f839a931894c153612366ac4e8c', '2026-09-30 16:27:21', '2026-09-23 16:27:26', 75, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:57:21'),
(75, 1, '0f8b139876f692a33dec2922cd1bdf458e8a10c38c30b68c8dbddfb05ab264f8', '2026-09-30 16:27:26', '2026-09-23 16:27:32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:57:26'),
(76, 2, 'c561d5eca8944de8cb73c19da5d07e06bf53a0d0965a802aa5334ab7aa9e1382', '2026-09-30 16:27:47', '2026-09-23 16:27:51', 77, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:57:47'),
(77, 2, 'e3b9d7d11a0ceb69027385686414e8285fc5cb3f8266f7e03e96e89b2faefcc3', '2026-09-30 16:27:51', '2026-09-23 16:28:00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:57:51'),
(78, 1, '599ad50e4b816aa94d3d8764c1f8d5b09c3c8d7049e332efba40ba6f86c6f0d6', '2026-09-30 16:28:02', '2026-09-23 16:28:03', 79, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:58:02'),
(79, 1, '5a1dae7ead01de7b371aca52973f8a0a40d7847c56bdc1a019c9bc3e5fc1e672', '2026-09-30 16:28:03', '2026-09-23 16:36:58', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 21:58:03'),
(80, 1, '5dd7d919ab8a6c9e0d12f872554396799697f42c0105081e32b421f43a81544c', '2026-09-30 16:37:12', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 22:07:12'),
(81, 1, 'aea1ca4c8a09a72600283126e2207286b1877d61a58553aff19d7350d70e0d73', '2026-09-30 16:37:36', '2026-09-23 16:50:45', 82, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:07:36'),
(82, 1, 'b65358222da47294c6073b0d3340174aa06f97b4e2b698e65f1f257395feefcb', '2026-09-30 16:50:45', '2026-09-23 16:54:01', 83, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:20:45'),
(83, 1, '572f617c0ad7e668a70b25935aef7a00f3fe2535301ca14e5a1f6bbf0ff594b2', '2026-09-30 16:54:01', '2026-09-23 17:00:12', 84, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:24:01'),
(84, 1, 'be8dfbf19b6894ac5806fa86b8b433c7fd4d142eff62d334808652b0dd5ed69c', '2026-09-30 17:00:12', '2026-09-23 17:01:03', 85, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:30:12'),
(85, 1, 'dad9c104f7d9d2a8bc318daa823f4c8a313b8957bddc287564bd7efa6d0de633', '2026-09-30 17:01:03', '2026-09-23 17:01:38', 86, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:31:03'),
(86, 1, '5cae214503d6c5309b7d7eae25d7a4c0f220014e8ba8666ec1b970d49df44ebd', '2026-09-30 17:01:38', '2026-09-23 17:02:18', 87, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:31:38'),
(87, 1, 'a2c092f45315ce9a5d31483aebd7981c1b2aec9f878573259317de0826ec5b53', '2026-09-30 17:02:18', '2026-09-23 17:02:35', 88, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:32:18'),
(88, 1, 'b0b842ac0dbe9354f4bd01806be510771228e9f9790b8a5fcf3091741f440db6', '2026-09-30 17:02:35', '2026-09-23 17:03:14', 89, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:32:35'),
(89, 1, '03cb76e8b07009df5cfa9d35253db682ef99d6f8d5b7892de7727135cee9a361', '2026-09-30 17:03:14', '2026-09-23 17:03:16', 90, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:33:14'),
(90, 1, 'd0a7cbafee691e0c8fa76a7200677609e8558a3e390abaa5d3696da6f12588e7', '2026-09-30 17:03:16', '2026-09-23 17:03:17', 91, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:33:16'),
(91, 1, 'c7c3b30980ac47d5d103015ed1c0b1353ef3cdbb11f53f493199509ff4fb02ef', '2026-09-30 17:03:17', '2026-09-23 17:03:18', 92, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:33:17'),
(92, 1, '14c6d59131ed60954fc0f99909df132bfb9210806f16478c1424fd0a83ae60a3', '2026-09-30 17:03:18', '2026-09-23 17:03:37', 93, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:33:18'),
(93, 1, '36336adb62aeb61966f170b518ce7aee748ee9d6ce39d7887685e6e14768d8cb', '2026-09-30 17:03:37', '2026-09-23 17:03:47', 94, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:33:37'),
(94, 1, 'b6c5c16ff5210890feb76386525dcd0d2e98fcfa0a195f0d043da94a646d80e6', '2026-09-30 17:03:47', '2026-09-23 17:04:55', 95, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:33:47'),
(95, 1, 'a3900f283f1a1dfcf2d432c9c2f65eb096de83470b084d310fcff3a02dfdefa5', '2026-09-30 17:04:55', '2026-09-23 17:24:11', 97, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:34:55'),
(96, 1, '9a4345fb9c9aeba3137964620def4537cda58a200555529ca038e3af35f29702', '2026-09-30 17:18:12', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 22:48:12'),
(97, 1, '930647684122cf223dfa50f7ac1680c74700393a01631bfa69c6fe0b0cb67b52', '2026-09-30 17:24:11', '2026-09-23 17:32:58', 98, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:54:11'),
(98, 1, '7ec03c22fcd572a139c3c4cf8731fb0bcea4ee922d95d63ecac96867d711cf10', '2026-09-30 17:32:58', '2026-09-23 17:41:50', 99, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:02:58'),
(99, 1, '1de9e0e8d4f62260893a1591f4ee0ae86821e67599b4d54ec1b215830c4f2a10', '2026-09-30 17:41:50', '2026-09-23 17:42:18', 100, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:11:50'),
(100, 1, 'b8551f45162bff34072a1fb7bf064c65438a846d81962c1020fe01f894e2dd4e', '2026-09-30 17:42:18', '2026-09-23 17:45:57', 101, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:12:18'),
(101, 1, '729a7dd52a7ca362289f5d6c64478717707289d65d90300ab97d5663abc6fc02', '2026-09-30 17:45:57', '2026-09-23 17:53:28', 102, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:15:57'),
(102, 1, 'ce0c3858195b181112c73663facc8876bc9ffdc2ed2cd5a10fe872ef009de377', '2026-09-30 17:53:28', '2026-09-23 18:04:04', 104, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:23:28'),
(103, 1, 'e6d324f2cb21e7b206f5dcd5c4ddaf1edfb80131c7525aaa109aaf5d12ac1dbc', '2026-09-30 17:54:53', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 23:24:53'),
(104, 1, 'c74cdfa1d3969c810087f0e0979375c534da383b9723823fca28fdf4c1c88230', '2026-09-30 18:04:04', '2026-09-23 18:05:06', 105, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:34:04'),
(105, 1, 'd80404f51737caf4a81ad7558d8f03a82558ed19fcdc27caef80b3e550755a9f', '2026-09-30 18:05:06', '2026-09-23 18:14:35', 106, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:35:06'),
(106, 1, '38f38c0c2a3471ee031d6db00e4715bd1edbd9f7ad3c4171fe4f55df9df8d143', '2026-09-30 18:14:35', '2026-09-23 18:15:29', 107, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:44:35'),
(107, 1, 'a19e0e2d45af7d61d86919169797115127af90f7fe7d5204dea1c323a1e0df0a', '2026-09-30 18:15:29', '2026-09-23 18:18:54', 108, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:45:29'),
(108, 1, '39e7304aa7161c9aac16bd847b8ac68d8a4037d61c90255036e3b7fbf144538a', '2026-09-30 18:18:54', '2026-09-23 18:19:05', 109, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:48:54'),
(109, 1, 'a126991199ecf23ed2fce18751218b12168fe04e85c2b7bfc95eae4ab3e5f25b', '2026-09-30 18:19:05', '2026-09-23 18:19:53', 110, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:49:05'),
(110, 1, '1409005ff2b886217494bbcb033864abc80b3a5a2a597c04ad91b7cd2209c668', '2026-09-30 18:19:53', '2026-09-23 18:35:53', 112, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:49:53'),
(111, 1, 'f957640bbbc6be33132b4962f1e2f4be6782b579a2f2aa5370bcd695fb6e79ae', '2026-09-30 18:31:43', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 00:01:43'),
(112, 1, '10022a627927f19d04901f2b12958184352ba0ca223dac5493b6388b4b6e35ee', '2026-09-30 18:35:53', '2026-09-23 18:38:00', 113, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:05:53'),
(113, 1, '036b1c0bef7a2b8739f12314f83e10902857c6c9ab1516804e8f300c4623e071', '2026-09-30 18:38:00', '2026-09-23 18:39:00', 114, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:08:00'),
(114, 1, 'a2920090f76c0b1a55a177bab8d3ef91fd8cd60384ad156d563c0799a142e42e', '2026-09-30 18:39:00', '2026-09-23 18:40:00', 115, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:09:00'),
(115, 1, 'aaf8ecbd783770ca0a156f853528685571253990ce5786970c97d831cfa81c19', '2026-09-30 18:40:00', '2026-09-23 18:41:00', 116, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:10:00'),
(116, 1, '5d0ec0fbaedad31bc770360cd897d8a2a6018aed65d8e913dca75c7f45aafbde', '2026-09-30 18:41:00', '2026-09-23 18:42:00', 117, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:11:00'),
(117, 1, 'a04e5a53f4665dae304ab89fd2e2a754dd65087e572d6cccc758a5ef891da113', '2026-09-30 18:42:00', '2026-09-23 18:42:26', 118, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:00'),
(118, 1, 'e7bc525002e6af4aec08d18415fca7cb52d6e3617da58f9ada545a33003bd558', '2026-09-30 18:42:26', '2026-09-23 18:42:29', 119, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:26'),
(119, 1, 'f6a11ffb07f97ed1d4a40816c98136a01f1081d802298a7243e1b8fb70099871', '2026-09-30 18:42:29', '2026-09-23 18:42:48', 120, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:29'),
(120, 1, '24397df571723d6a4476fc17b5228cb54725f459a116d3689cb29619ba3564f4', '2026-09-30 18:42:48', '2026-09-23 18:42:51', 121, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:48'),
(121, 1, 'acf52a080fda2aaaf6ac389c209b143a29110a855b9e015a20bc2879e8154818', '2026-09-30 18:42:51', '2026-09-29 06:50:23', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:51'),
(122, 1, 'c78d752981637ab85331fc619eb068120aa09cde132322683fc49555e6b424a8', '2026-10-01 05:55:03', '2026-09-24 06:21:40', 124, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:25:03'),
(123, 1, '4436b6e179f2023c81e252bd8c409acdd094b974dff4dd763136a86d1cb3a3f6', '2026-10-01 06:07:52', '2026-09-24 06:25:32', 130, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:37:52'),
(124, 1, 'fb100703dc0ef82f59741eafce330a6c9ba3b29c16f650e54097e4f8ae880662', '2026-10-01 06:21:40', '2026-09-24 06:21:42', 125, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:51:40'),
(125, 1, '10dca9a56ad6578564cb316ced7824584eebe713d66cf5c2c52085eb1fa0d9a7', '2026-10-01 06:21:42', '2026-09-24 06:21:45', 126, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:51:42'),
(126, 1, '9bf26630fbdcb02357a73d9b24ab1b74d2873f297b0eb69fde9857333354855c', '2026-10-01 06:21:45', '2026-09-24 06:22:20', 127, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:51:45'),
(127, 1, '90a4dfc2e19297b7a3a1fcd53f9032d2ac5255625ba7f1319450f286d6c4a149', '2026-10-01 06:22:20', '2026-09-24 06:22:28', 128, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:52:20'),
(128, 1, '678ea241d28cf2243f41eca66c0c78a9ea12030da9b7962af1b7d7057693be40', '2026-10-01 06:22:28', '2026-09-24 06:25:21', 129, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:52:28'),
(129, 1, '2d539e7d0df0cc1141be113f54fdc705fab7895b89d67020dc5228b2d8dceadb', '2026-10-01 06:25:21', '2026-09-24 06:25:39', 131, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:55:21'),
(130, 1, '32321a8b86f9634c4dbce20e5f14bdcc68ae2b7666edc235e8a6064608e37f37', '2026-10-01 06:25:32', '2026-09-29 06:50:23', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:55:32'),
(131, 1, '33bbf9c5e9925be16796f50d96695237088af6b85509e198eb53e918252078e2', '2026-10-01 06:25:39', '2026-09-24 06:45:55', 133, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:55:39'),
(132, 1, '8f5f86ef245c93bb0d310de8e8ff7e583544f66b80e7c206088bf4f0349da193', '2026-10-01 06:43:47', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 12:13:47'),
(133, 1, '5224869aed85b484984c05ed1cc4a1d0c6783c2cbf67385bd907998b2fa756c0', '2026-10-01 06:45:55', '2026-09-24 06:50:31', 134, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:15:55'),
(134, 1, '8bc0cd49022b5f9afa35a60f0377a4640d36336e2e25149b2d2f255ce45c1db6', '2026-10-01 06:50:31', '2026-09-24 07:00:56', 135, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:20:31'),
(135, 1, '0eec85801726be341dd1ef67ebd5112b927402f0955ec2d53a4aee756f90d2b6', '2026-10-01 07:00:56', '2026-09-24 07:08:48', 136, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:30:56'),
(136, 1, 'a63677c128a3899a85d4238bd96e37c7765e66b9bda0eb614ce00bc98bf8d4ec', '2026-10-01 07:08:48', '2026-09-24 07:15:36', 137, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:38:48'),
(137, 1, '7eb6b9c0996f4b3e63f3c49331ebb8d0e7fe55182b9b092a1977845c8f3d1a36', '2026-10-01 07:15:36', '2026-09-24 07:19:09', 138, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:45:36'),
(138, 1, '9ec57be2ff28b953053daa0f5be9fd4966136c687c7b01e67781abd35e3d22a1', '2026-10-01 07:19:09', '2026-09-24 08:11:59', 139, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 12:49:09'),
(139, 1, 'dbef268c276ac33260ac93bc1688956b43f3d0165749ee9d4e6ab6e3419de0a6', '2026-10-01 08:11:59', '2026-09-24 08:49:35', 140, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 13:41:59'),
(140, 1, '73e01df385215fbafa031a03cbf743a6eb89e88d8e9a522dfd92709220a73171', '2026-10-01 08:49:35', '2026-09-24 08:52:28', 141, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:19:35'),
(141, 1, '89b9a91d5eb1d5b2a6d2bd1db3a897e21042c497cdcd64ce1cb0b01f3d6a5834', '2026-10-01 08:52:28', '2026-09-24 08:52:33', 142, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:22:28'),
(142, 1, 'e3c39012fa8b569c9ae5e8015f1ceba86bfa2f6fbcb7f8925a39bbe068c33d38', '2026-10-01 08:52:33', '2026-09-24 08:56:12', 143, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:22:33'),
(143, 1, '44cd88c91e7b6bde02aaeb4a1ce6c19d40db1c2a4d6fc90d70c193ed28e2285e', '2026-10-01 08:56:12', '2026-09-24 08:57:03', 144, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:26:12'),
(144, 1, '5becb432543ec6a0285227f367931d1580fcd02f4ebc976c4ad776594ac31539', '2026-10-01 08:57:03', '2026-09-24 08:59:41', 145, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:27:03'),
(145, 1, 'b3e71db7c8e2953c057b7232aa0edfbd2baa7d6375ef0e3af22b93716edd6217', '2026-10-01 08:59:41', '2026-09-24 09:07:18', 146, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:29:41'),
(146, 1, 'f0afc61d8cf30d3a36f50466437d02f8a3fe86b3538411dede2ac7e13b5a322b', '2026-10-01 09:07:18', '2026-09-24 09:07:20', 147, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:37:18'),
(147, 1, '8174bc6764852cdfcd4170a45e5e136eb6287717c190395ab281b88a2d8f8360', '2026-10-01 09:07:20', '2026-09-24 09:07:39', 148, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:37:20'),
(148, 1, 'a3d0ba14f1b9eb217d7b2909dd22b8f27576678f61ff03ba7c94e69b749306ba', '2026-10-01 09:07:39', '2026-09-24 09:10:24', 149, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:37:39'),
(149, 1, '10dc06638f7816db2e9d870f92f9264cda58232830995509275284dff8c9e0a0', '2026-10-01 09:10:24', '2026-09-24 09:49:26', 150, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 14:40:24'),
(150, 1, '4956239215806a61d7f77a0e48acd73e3e29bbb54b741e44d82c62543f480dc7', '2026-10-01 09:49:26', '2026-09-24 09:49:31', 151, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 15:19:26'),
(151, 1, '37ebf3f14514866a1dfe7d26430fd32a8d35fed778b1231d9b86a9ece826045d', '2026-10-01 09:49:31', '2026-09-24 10:28:45', 153, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 15:19:31'),
(152, 1, 'cee762c8ee7e5155e4d620a8cf9e386b118d288a5e62e072c4e9bf560631d23d', '2026-10-01 10:07:25', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 15:37:25'),
(153, 1, '30676fbc3f2b58da1b9e8f151320f9327b7aa6dd4da79b2e7f3cf8c8bf077db6', '2026-10-01 10:28:45', '2026-09-24 10:31:39', 154, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 15:58:45'),
(154, 1, '45cd0e8012da9be3dde8ad5bbd8a23cbf3a1e0f8edb8a31506747078f70c9272', '2026-10-01 10:31:39', '2026-09-24 10:47:28', 155, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:01:39'),
(155, 1, '9cec88f3becf679edafa9b409d9ce503ab88bc215dd57e99325f21fd48c78ed4', '2026-10-01 10:47:28', '2026-09-24 11:10:28', 156, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:17:28'),
(156, 1, '3f5f45675b22555e0dc046322120d3bbeea79b070bc5845c95266efb4d5f6a71', '2026-10-01 11:10:28', '2026-09-24 11:43:41', 157, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 16:40:28'),
(157, 1, '60fd33255d682a452d3c95b212f6655b23153f02be6f303e09c2c72b631f5166', '2026-10-01 11:43:41', '2026-09-24 11:45:27', 158, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:13:41'),
(158, 1, 'e12f7b46e6b7beb0e446c1b9f67ef3b2145affe52d4388c28057847d856ef19f', '2026-10-01 11:45:27', '2026-09-24 11:45:30', 159, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:15:27'),
(159, 1, '8ced2a7edeadc3c4af50ae1eb2ba20be821ff5ed5e394bdbba166d5179bb14ae', '2026-10-01 11:45:30', '2026-09-24 11:46:35', 160, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:15:30'),
(160, 1, 'dd3831c96580e1e5c573ca288d36500fbfc895417cf6060133c3e7d02638d9a8', '2026-10-01 11:46:35', '2026-09-24 11:48:57', 161, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:16:35'),
(161, 1, '12fb0d784b68f1024243d06c7cccd5cacaf77644ab0bb2f0994b98001daee51b', '2026-10-01 11:48:57', '2026-09-24 11:55:05', 162, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:18:57'),
(162, 1, '261141e4f9b0580aa03d4da6120753d3f48f33530d8401622f9f7082dcc0bbfc', '2026-10-01 11:55:05', '2026-09-24 11:55:35', 163, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:25:05'),
(163, 1, '4c6dd62d187c90b7a305d283dc81cbdaccac31784c25574a10708bb5e49fb363', '2026-10-01 11:55:35', '2026-09-24 11:55:40', 164, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:25:35'),
(164, 1, 'bdcc40c0f4daedc89f55b8cd056b83112a88fba5188ae3312c7af97ecbaf53d2', '2026-10-01 11:55:40', '2026-09-24 12:00:07', 165, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:25:40'),
(165, 1, 'ba0881882f5c64332c7f789390fbc6b72dfadad928138c8cc7e77cc33db534b8', '2026-10-01 12:00:07', '2026-09-24 12:01:29', 166, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:30:07'),
(166, 1, '2347eb7b780a2d565f19b8ffc2cb21f58c9c7aaf1af42fced2c8cd2c111da0c9', '2026-10-01 12:01:29', '2026-09-24 12:04:01', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:31:29'),
(167, 2, '9a8601ed0e222c867d20879209b09a68424095c3c1fd3bfe15e02af139d8c469', '2026-10-01 12:04:25', '2026-09-24 12:07:54', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:34:25'),
(168, 1, '63d2727c48ef2e6fbd98ff60ff9c43aedd1b1dbc35834aabc8ed2a9df267e3a8', '2026-10-01 12:05:37', '2026-09-24 12:24:15', 171, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:35:37'),
(169, 1, 'c791ac49e957734ab02850209de0bdd282846491d485f9a667278312405568fa', '2026-10-01 12:07:56', '2026-09-24 12:28:40', 173, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:37:56'),
(170, 1, '88a8f5b4168c71524bdbbb6f2baa3448ed70a4c1bf2f7cf092f94a69d89f6912', '2026-10-01 12:22:17', '2026-09-29 06:50:23', NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 17:52:17'),
(171, 1, '3c60300798589e67c9db1f820c74c248007f226b7d492b74dcad24b1ed8c2d04', '2026-10-01 12:24:15', '2026-09-24 12:34:36', 175, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:54:15'),
(173, 1, 'f97eb95c9dfddf9eb500bb493966295f8867e7653ef933e4aefe2801b0ded111', '2026-10-01 12:28:40', '2026-09-24 12:29:17', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:58:40'),
(174, 2, '7e8cb115d9b1d6bb61206228c6c78d295ebe89d461e678690c21affdb01d2724', '2026-10-01 12:29:40', '2026-09-24 12:44:28', 177, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:59:40'),
(175, 1, '9e53df7ef122e9ffbd0b351397abbfe87e0d4cfef6782a1a6f01966ad1414c18', '2026-10-01 12:34:36', '2026-09-24 12:34:37', 176, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:04:36'),
(176, 1, 'd8a96c78fcfcc8a170a3ee2a0323f70877f89f335335702dec95ac252a9a37e3', '2026-10-01 12:34:37', '2026-09-24 12:50:53', 178, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:04:37'),
(177, 2, '653d29b6b4c0e712695e1933e03eba3df0fef42a55f7a724c80d103d1b7cbde7', '2026-10-01 12:44:28', '2026-09-24 12:55:00', 182, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:14:28'),
(178, 1, 'a8e9defea09bfa3e5115f3feedd15bda5d7256232e5c5c31a6aa0e9eda817042', '2026-10-01 12:50:53', '2026-09-24 12:53:19', 179, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:20:53'),
(179, 1, '8db5f0bea86d354ffadcde057d51bf3adade85d1445da13ed5d8caac9f5478fb', '2026-10-01 12:53:19', '2026-09-24 12:53:20', 180, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:23:19'),
(180, 1, 'b7d34903824de53c023196a71070be082e394d577684244daaeade2aef0e6191', '2026-10-01 12:53:20', '2026-09-24 12:53:28', 181, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:23:20'),
(181, 1, '2f75fbb1ad352ef3ff0832a319cb4ea5a9116a66b30f811f85c29a15262c3d69', '2026-10-01 12:53:28', '2026-09-29 06:50:23', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:23:28'),
(182, 2, 'da21960fc2b656dfe8ee0ee4025732ce84df11caa1042af84b6cc57154a9de30', '2026-10-01 12:55:00', '2026-09-28 04:44:29', 183, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:25:00'),
(183, 2, 'eaa9ad1464b3f52517ac909efa89c4101d67a1d4904efad7bf68c4e1a25d3983', '2026-10-05 04:44:29', '2026-09-28 04:44:32', 184, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:14:29'),
(184, 2, '368debcae81c0c99d654e49dabf36a1ff2fee3231b119ae7aa3181b54656746c', '2026-10-05 04:44:32', '2026-09-28 04:44:58', 185, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:14:32'),
(185, 2, 'ff3ffb9aa90e842dd7063369826744574c68f84c99b7e08fe194054abee3bbd8', '2026-10-05 04:44:58', '2026-09-28 04:47:32', 186, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:14:58'),
(186, 2, '69c4aca513e76b932b20ae5fcfe0d42815ec8c4c0c53baa2c687bad6e3d2b793', '2026-10-05 04:47:32', '2026-09-28 04:51:43', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:17:32'),
(187, 2, '7da66ecc74353e5ff1d90b59228b6d0bbf79592941046f62a37740f6be358e28', '2026-10-05 04:50:55', '2026-09-28 05:55:48', 191, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:20:55'),
(188, 1, '3dde8e47325b4542f816073b604b73e08d3c9f4c5cbdab90d8493556423bfdc2', '2026-10-05 04:51:46', '2026-09-28 04:52:03', 189, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:21:46'),
(189, 1, '5db9297d11a7fddbec4cd344df26f80a8a7aa93916a4025df963c57fc26e57f7', '2026-10-05 04:52:03', '2026-09-28 05:42:35', 190, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:22:03');
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `replaced_by_token_id`, `created_ip`, `user_agent`, `created_at`) VALUES
(190, 1, 'b81ae11207d232724abc9703a191051edb242775158178ed057f0b8797f1aac0', '2026-10-05 05:42:35', '2026-09-28 08:47:45', 193, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 11:12:35'),
(191, 2, '9a9a453647c480587f0caa7b2f3b65533e6687736666f9f84dfd683a7a6df594', '2026-10-05 05:55:48', '2026-09-28 08:21:06', 192, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 11:25:48'),
(192, 2, '9f2e2910f31ba9dcf395754bb81b10d7453f65b626706da68723efc476e22841', '2026-10-05 08:21:06', '2026-09-28 08:55:51', 199, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 13:51:06'),
(193, 1, '7693959e7c187bbcacd63cf5c0b5762e6f6c7743a39cc902d4bd58bbe72a3b1e', '2026-10-05 14:17:45', '2026-09-28 08:47:47', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:17:45'),
(194, 1, '7fa4439c138c2be4e32951edd5a1cbc2dbc7a4ab450839e5810978518ea00d05', '2026-10-05 14:17:49', '2026-09-28 08:48:21', 195, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:17:49'),
(195, 1, '5615fb158a2e3a20da0009f9962dde950a339e089b8e3b70db68f1353b4b9968', '2026-10-05 14:18:21', '2026-09-28 08:55:16', 196, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:18:21'),
(196, 1, 'e5814ef7ad7124050afdf60883b6959555636b63d51065f0bc00c49376dec527', '2026-10-05 14:25:16', '2026-09-28 08:55:18', 197, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:25:16'),
(197, 1, '9174bf5734ef8d9326e5a3de34eccad5dd9e77d1cf1d814e68f31fb538e9c016', '2026-10-05 14:25:18', '2026-09-28 08:55:32', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:25:18'),
(198, 1, '6959e8bcd226bd4e1d30d4ff97592e84b103b474947b740f432b8f52c1b60332', '2026-10-05 14:25:38', '2026-09-28 09:09:11', 205, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:25:38'),
(199, 2, 'd201278e55fb939bad4f741cfe8d232bcf4c16522051d2729a871f0e5e40ad00', '2026-10-05 14:25:51', '2026-09-28 08:56:14', 200, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:25:51'),
(200, 2, '504415d3a0f5a85bbdf9b3216272f9cdbedf919208dff087be486937d68201bf', '2026-10-05 14:26:14', '2026-09-28 08:56:17', 201, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:26:14'),
(201, 2, '87cc818c0de3c226a2c13425a9096c8c074e53098f715ef024ad9323c9b03d61', '2026-10-05 14:26:17', '2026-09-28 08:56:19', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:26:17'),
(202, 1, 'a909fdf5db839d540c5f7acccf80c852c0a8c1748c1d886db7d6066422ef408d', '2026-10-05 14:26:26', '2026-09-28 08:57:33', 203, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:26:26'),
(203, 1, '5833fdf8687a381f5f0c4b75d8eacc37cb3d09d9e5018b684d6320b6e63d538b', '2026-10-05 14:27:33', '2026-09-28 08:57:49', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:27:33'),
(204, 2, 'e56d806a86b6e2551d280408361de13c426c208cc63d895d63b34a2acbb25ce9', '2026-10-05 14:28:11', '2026-09-28 13:51:42', 239, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:28:11'),
(205, 1, '1fd870b351a6c6edb6868f89e80ee910e25e82578b6b6c31adb8b8c5b0484ffb', '2026-10-05 14:39:11', '2026-09-28 09:09:13', 206, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:39:11'),
(206, 1, 'a3279cddb89b9cf4bff1958c089fc197f7c2cc59d7f81d407b9f72f8b2f20601', '2026-10-05 14:39:13', '2026-09-28 09:09:24', 207, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:39:13'),
(207, 1, '1db4bc8eb4520190ef3aa0f5485b3ea11fd807d08a4be20b264c5ecbac3597df', '2026-10-05 14:39:24', '2026-09-28 09:39:06', 208, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 14:39:24'),
(208, 1, 'db9a5c8c2a2c7b4d0690387c6baad77f53f4a3a82f6d6186d9d68c251301c026', '2026-10-05 15:09:06', '2026-09-28 09:58:51', 209, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 15:09:06'),
(209, 1, 'd4f98848cbdb384e36e555ab6b38d052a58446c45a93a867798f315b44066c46', '2026-10-05 15:28:51', '2026-09-28 10:04:41', 210, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 15:28:51'),
(210, 1, 'b6a2e2e42bfcca06fa44125136e531a8cc2b1a4ec5113fadaf1036a8bcf59ebf', '2026-10-05 15:34:41', '2026-09-28 10:35:04', 211, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 15:34:41'),
(211, 1, '77f3ba58a16a6466c31e587fe6103b5436c60c3cd8f74d1ad48dde4700768b60', '2026-10-05 10:35:04', '2026-09-28 10:45:11', 212, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:05:04'),
(212, 1, '585c898170f2e3d4343bda44f2ce38b49e18d72b3d44633cdefddae62d7a92a1', '2026-10-05 10:45:11', '2026-09-28 10:45:22', 213, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:15:11'),
(213, 1, '2aaec62d1e855dddf04cc00f43d308393b7d42dcfb549a0155c8e912594a5523', '2026-10-05 10:45:22', '2026-09-28 10:49:01', 214, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:15:22'),
(214, 1, 'fb4fa9d3da0117be59aa7148176c4409703d362118a676b6cf52adf2c67191d2', '2026-10-05 10:49:01', '2026-09-28 10:49:04', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:19:01'),
(215, 1, '394b1522a67866e6ce748f644cbd924c9cb060d824975dbe5cd32cd794a8e88d', '2026-10-05 10:49:05', '2026-09-28 11:06:55', 216, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:19:05'),
(216, 1, 'ac54d29b842f693f93495944fd5499bdd538589af5684bd8a27235e72bb2f698', '2026-10-05 11:06:55', '2026-09-28 11:06:57', 218, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:36:55'),
(218, 1, 'f6a2571357f40559e9f849733fbb9dce91cf2983ae64291e08e09db91e757d7e', '2026-10-05 11:06:57', '2026-09-28 11:08:31', 219, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:36:57'),
(219, 1, '85ff9f8544af955fd0c445ba2c55ca859a2bd68028ff61b4393c5c5290e20f52', '2026-10-05 11:08:31', '2026-09-28 11:08:33', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:38:31'),
(220, 1, '9960fb14584cee396ce6b75440aad3883acf76b254e8472aa61a185b1c6f072b', '2026-10-05 11:08:35', '2026-09-28 11:08:37', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:38:35'),
(221, 1, '9139658b45e24278e13996da4eac265f281a322e647311f0c2827e9ea3778afd', '2026-10-05 11:08:40', '2026-09-28 11:11:03', 222, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:38:40'),
(222, 1, '9c40cde8c7a1aa71fe77481515e836f7b6e760549d5e48b55cb8a26a4da4d4a2', '2026-10-05 11:11:03', '2026-09-28 11:11:04', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:41:03'),
(223, 1, '2b44b7eb63fc3fbc3d3325c029b2c9a0b964bc3403974c686988c0c4abe0e3f0', '2026-10-05 11:11:05', '2026-09-28 11:11:07', 224, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:41:05'),
(224, 1, '56a2d1246ff1262be76ebd56d5e114d84f390005754cdef3d095690317f1608e', '2026-10-05 11:11:07', '2026-09-28 11:11:10', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:41:07'),
(225, 1, '612c0c93370230c18d9bb115462aefe48b123d06e97e34b1902a8f8f227acf92', '2026-10-05 11:12:43', '2026-09-28 11:17:12', 226, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:42:43'),
(226, 1, '3123c61f846db34e599633ff77de6eb1501899389e9a81d1edc2df9c89ca69d6', '2026-10-05 11:17:12', '2026-09-28 11:17:14', 227, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:47:12'),
(227, 1, '972a930c8ed8a0808a16618432b840288a3afdaee900ea3f78dc11ad244f808b', '2026-10-05 11:17:14', '2026-09-28 11:17:22', 228, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:47:14'),
(228, 1, 'b51bcc72340d0f8f7e4d4ade6bce5268c9d95a8cb8de6c37d631483ce4a27a35', '2026-10-05 11:17:22', '2026-09-28 11:26:04', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:47:22'),
(229, 1, '160c147387a3658fa296d5f0af291e5e2debb114e0ba9ef8f4c60e2410592378', '2026-10-05 11:35:52', '2026-09-28 11:36:55', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 17:05:52'),
(230, 1, 'c763358675c67963988443c9f1a70fe9908f013fa9b3af4b964d9fa532cf205e', '2026-10-05 11:40:54', '2026-09-28 11:56:09', 231, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 17:10:54'),
(231, 1, '151a97fb8275b40b46bf0cafbac08decbfca26bbf0b421af5edf65bdbbbe62a2', '2026-10-05 11:56:09', '2026-09-28 12:09:06', 232, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 17:26:09'),
(232, 1, '7f1ce4f0a87166ac787bbd5dcac8ae0fbacef2e24631258fbe89f781bda30619', '2026-10-05 12:09:06', '2026-09-28 12:26:50', 233, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 17:39:06'),
(233, 1, 'd2eba9f938c4d10acef68744e57a6d6ab8c61e3a22b1f9757878256cea145f3c', '2026-10-05 12:26:50', '2026-09-28 13:20:53', 234, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 17:56:50'),
(234, 1, '030ad8c667ba39a4f00109eee2b2098091aa34d0c4b203cbe7ba0d658cb89783', '2026-10-05 13:20:53', '2026-09-28 13:37:38', 236, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 18:50:53'),
(235, 1, 'b736e389230d0d7fc3239cfd1b0c50c17333e8feb99676a63b58f76a962bbe87', '2026-10-05 13:29:18', '2026-09-29 06:50:23', NULL, '127.0.0.1', 'PostmanRuntime/2.7.0', '2026-09-28 18:59:18'),
(236, 1, '9b87f1b6038a67639355c4601b35c2106a9edda862398b650902acca74d442ad', '2026-10-05 13:37:38', '2026-09-28 13:50:54', 237, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:07:38'),
(237, 1, '6f99294b4e00188107df06fc2d73b86b72a671596c773b4127a2c3be944b6dea', '2026-10-05 13:50:54', '2026-09-28 13:50:56', 238, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:20:54'),
(238, 1, '1e2a0672df4112057f7ba8232c35f9d9db59c7aaad9e91fbbd77f320334beb83', '2026-10-05 13:50:56', '2026-09-28 13:52:43', 242, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:20:56'),
(239, 2, 'f2b14a2a7a98bec944141f39173d7d9b213f0f30ba08ad0c8333cd821019cca5', '2026-10-05 13:51:42', '2026-09-28 13:51:45', 240, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:21:42'),
(240, 2, 'e9e981e5ed00364afb9b8285e98189a7063e95fabe51983c160fbc37c354fd35', '2026-10-05 13:51:45', '2026-09-28 13:51:56', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:21:45'),
(241, 1, '5945cd0f0b5c3b0e6d0eae144730b27a6542bc2b2a5fca914928feec63fbbe32', '2026-10-05 13:52:04', '2026-09-28 14:07:51', 248, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:22:04'),
(242, 1, 'dbe37913e9aee212bd08821abefa427437cef8ba9ab2c9daad936778a4d6b86d', '2026-10-05 13:52:43', '2026-09-28 13:54:31', 243, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:22:43'),
(243, 1, '1e45f28373c1f6e76a337f5c4c0e1dd130eeea261ec9384b11695ee1957414c6', '2026-10-05 13:54:31', '2026-09-28 13:54:39', 244, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:24:31'),
(244, 1, '4c266b494841f396ec5c928b3bb3247370bbd6c8155de9fb023cd7f126b6c510', '2026-10-05 13:54:39', '2026-09-28 14:03:55', 245, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:24:39'),
(245, 1, '980971073803a0474c0892e0bfccdc758ca4b31d51b3def8f985ec6397924b85', '2026-10-05 14:03:55', '2026-09-28 14:04:33', 246, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:33:55'),
(246, 1, 'af515094dc4a74123c2b444bbd7f7a19ac6b768bb1948b5e4836ebdf599f6794', '2026-10-05 14:04:33', '2026-09-28 14:04:35', 247, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:34:33'),
(247, 1, '55e5a0340aa118c549301b03bba83f7d7b8f8562ffb71daeceea84de8d488a12', '2026-10-05 14:04:35', '2026-09-28 14:11:57', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:34:35'),
(248, 1, 'fe84db8d9a86e0815884770e6d60f56c8a9d94a7bb834993edca515c9aa5ea2b', '2026-10-05 14:07:51', '2026-09-28 14:07:54', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:37:51'),
(249, 1, '017f8bd7623a88df4c6d459ddd74609b8e62cf9b7cddcd8e9e33507c83fb97c8', '2026-10-05 14:10:21', '2026-09-29 06:50:23', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:40:21'),
(250, 1, 'e5e25f8b61cfa6e762f63cacc7ae9b60007659299de9d54d7ed8c3a9e4f2a6ca', '2026-10-05 14:19:21', '2026-09-28 14:20:32', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:49:21'),
(251, 1, '7b50c2b880452e2c5d7ff841d5b9f23f59c0c6398039afaaaada636405693860', '2026-10-05 14:20:38', '2026-09-28 14:35:50', 254, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:50:38'),
(252, 4, '9092870d741753461787a8a794c2753d519cd03f28c1dcd469b4eefa64e5d1f8', '2026-10-05 14:21:06', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:51:06'),
(253, 3, '330a4d8aa8cc4ec61d18c1255a5e054918c7b9f4c10b0b11971027b235f1b89f', '2026-10-05 14:21:50', '2026-09-28 14:22:31', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 19:51:50'),
(254, 1, 'b9627672b84b987c7caf8b4781fbed4274e6cdb87c13b6fb15aeb37f3c088aae', '2026-10-05 14:35:50', '2026-09-29 04:48:21', 255, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 20:05:50'),
(255, 1, '52f376d7ab58a0cf9630bfdd8ebd7cfb3d8588ce3de2df26255f9e0f44874443', '2026-10-06 04:48:21', '2026-09-29 04:48:26', 256, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 10:18:21'),
(256, 1, '915f6415d61c2f1c80927e2a486a78c49c14f48c877be51e163751e191515a90', '2026-10-06 04:48:26', '2026-09-29 06:50:23', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 10:18:26'),
(257, 1, '9675bb2f1ff27fd3705e59496f7392a7eb93bc300d52a3de15b0580303b3fc14', '2026-10-06 04:51:23', '2026-09-29 06:01:07', 258, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 10:21:23'),
(258, 1, 'ec7fb8aa6797a9f4ec771b4231de5654dbce67dae961502cbc1a54128b955fea', '2026-10-06 06:01:07', '2026-09-29 06:11:22', 259, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 11:31:07'),
(259, 1, 'dcfae2e7c5199e34b4fc8dd2333a7dc735e0b941f54c1ee8120ffef1a4830dda', '2026-10-06 06:11:21', '2026-09-29 06:11:25', 260, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 11:41:22'),
(260, 1, '84c506f934da6def0155bf32049925a11c09e4ebd65eb618ea4024cd3b30f8d7', '2026-10-06 06:11:25', '2026-09-29 06:19:27', 262, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 11:41:25'),
(261, 1, '373632325881992d95794c297e78db5ce83ff1d75609b98a95989b2fe5825c25', '2026-10-06 06:11:49', '2026-09-29 06:50:23', NULL, '127.0.0.1', 'PostmanRuntime/2.8.0', '2026-09-29 11:41:49'),
(262, 1, 'e0ecc33f66995a7db8ea3a83b7c56357f8ffb76b58375bdcb01ae7055d454709', '2026-10-06 06:19:27', '2026-09-29 06:19:30', 263, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 11:49:27'),
(263, 1, '832bba423fbd5aac114e61625e64185c77436a5221d56fce17531cf23171de4d', '2026-10-06 06:19:30', '2026-09-29 06:19:37', 264, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 11:49:30'),
(264, 1, '3cd09a7b78ac1b05a9e9b75e4cd8ffe0a65127fc9182a577872a652d13e6a89f', '2026-10-06 06:19:37', '2026-09-29 06:20:26', 265, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 11:49:37'),
(265, 1, '301d71b520392f54ef50cec5e20f09d75ae4d7319eac932fd02b36794b081433', '2026-10-06 06:20:26', '2026-09-29 06:50:23', 266, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 11:50:26'),
(266, 1, '03f52fc8f05ce61e7ac9e41194325eee3cc9b86c11efe9785962e9c19efd7c92', '2026-10-06 06:50:23', '2026-09-29 06:50:23', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:20:23'),
(267, 1, '7f7269efa20770b54646f008634aba2d1b192b44bee1767997114eb90a302e67', '2026-10-06 06:50:41', '2026-09-29 06:54:25', 268, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:20:41'),
(268, 1, '62ee4a0e566fb38fbf241684fd660e734997c356f70cbf68eda4475be37c2018', '2026-10-06 06:54:25', '2026-09-29 06:54:27', 269, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:24:25'),
(269, 1, '8fc4c387c9f3c41222da4a93919567cc7beea8309303b4571fb665582a75a1d9', '2026-10-06 06:54:27', '2026-09-29 06:54:29', 270, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:24:27'),
(270, 1, '9a995a3f406c715d415b349ff7a9ca6cab5919c22a1b3389ce3cc82ce4779eee', '2026-10-06 06:54:29', '2026-09-29 06:54:31', 271, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:24:29'),
(271, 1, '04d3acbf7fccfca8d9e9c36c06c1d5ca0eec27f27342fd6e783ec5fab6558254', '2026-10-06 06:54:31', '2026-09-29 07:19:11', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:24:31'),
(272, 4, '37365ce2c2e4fd0b5d6d277d6c5f9d423de29bdb72c374fd8ddb9089ea2c6fc7', '2026-10-06 07:19:36', '2026-09-29 07:24:24', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:49:36'),
(273, 1, '4d458cec6ad007801762282d771c9938b9bc04875ec0f1a156c325f221d6c236', '2026-10-06 07:24:29', '2026-09-29 08:17:53', 274, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 12:54:29'),
(274, 1, '85db1bbdc00f2fa5860777444e360875ab382aae72b5f879acb52af41a850da3', '2026-10-06 08:17:53', '2026-09-29 08:23:46', 275, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 13:47:53'),
(275, 1, '6d89056386b8aa91406c5f45995739502c7ce18dcd006e39288e9a63589ff182', '2026-10-06 08:23:46', '2026-09-29 08:26:04', 276, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 13:53:46'),
(276, 1, 'dc5bbc2ab63ca70e08e68471ff6d846acb4a1cd99ad38c148f9dfee020a82719', '2026-10-06 08:26:04', '2026-09-29 08:26:11', 277, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 13:56:04'),
(277, 1, '48d368991fe4fcc20819aad3f799cc149bc50c69a33b9700a6a0b9ceffbb858b', '2026-10-06 08:26:11', '2026-09-29 08:32:56', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 13:56:11'),
(278, 4, '289f742b0a26bfce4830d6f6b63cdc8d87fdccc6e0be1e1edd217d1efecc6c0e', '2026-10-06 08:33:02', '2026-09-29 08:33:07', 279, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:03:02'),
(279, 4, '8ac156330ab56f5b73149b8b766cdd9f636f1225c1360f75bbcca676963331e5', '2026-10-06 08:33:07', '2026-09-29 08:37:35', 280, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:03:07'),
(280, 4, '9c99b00b22bea74436a4cdb15abd1bd025814940e8713c190e39cd8915ee56a9', '2026-10-06 08:37:35', '2026-09-29 08:37:37', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:07:35'),
(281, 1, '71af8538d1a5be8259e04de8901d397b7308c1aa0bf56d4923b1e23c7db2a2ae', '2026-10-06 08:37:41', '2026-09-29 08:40:47', 282, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:07:41'),
(282, 1, 'fcc94fbbec7a1225a03b6949339e18ac4d1e56d006ae40657df3b61e16d76b3c', '2026-10-06 08:40:46', '2026-09-29 09:09:15', 283, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:10:47'),
(283, 1, '267d21222f729290fa570ec374e6f1c5b5b1295b06d151a353a11b0581e57953', '2026-10-06 09:09:15', '2026-09-29 09:11:52', 284, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:39:15'),
(284, 1, '4948d64e2c3167e8ae210181777632181595f53a1425ae7f74e15e47914dc0ff', '2026-10-06 09:11:52', '2026-09-29 10:02:08', 285, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 14:41:52'),
(285, 1, '0d158a8332839339425da9c9fb339773a8f2ac78270250076e6334e545997ac8', '2026-10-06 10:02:08', '2026-09-29 10:06:28', 286, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 15:32:08'),
(286, 1, '11fa3e2ae03fcd1485a5108310495d9461604ac1ecb94d0daebb7ad22b2f784e', '2026-10-06 10:06:28', '2026-09-29 10:17:22', 287, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 15:36:28'),
(287, 1, '3ffc9044f4b781ddbdbda312c7b787436248ac4e8e6d1166e53f702ac590f274', '2026-10-06 10:17:22', '2026-09-29 10:26:51', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 15:47:22'),
(288, 1, 'ca7dd527ad141dc08fdd0736b22a4daf6c48a91423319fc9b602798d6ce94b0d', '2026-10-06 10:26:53', '2026-09-29 11:02:46', 289, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 15:56:53'),
(289, 1, 'c3a86a0f46e46ce492c4e8392d7b76b82200079c0be93ad12ad0f1b09baeafc6', '2026-10-06 11:02:46', '2026-09-29 11:22:33', 290, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 16:32:46'),
(290, 1, 'd847f09cb0d3ef208cff55d03bbfde0c55fe24d170dcc1e8ff0c655f71fa9cce', '2026-10-06 11:22:33', '2026-09-29 11:32:21', 291, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 16:52:33'),
(291, 1, '365d16a07f58ad56fddf8d38f6141d2e95f3e19b1dcadfd2350309d5f34e5a56', '2026-10-06 11:32:20', '2026-09-29 11:32:29', 292, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-29 17:02:20'),
(292, 1, '8b94eaf85ea690965f4b18e2ad65e0c54346451bdfdd3624376eb612f21db915', '2026-10-06 11:32:29', '2026-09-29 11:48:04', 293, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 17:02:29'),
(293, 1, '7162bb7e1f5e30c6272f6b1dcf6ba15ac6a823f8ce0e34a0255a57237a90ac62', '2026-10-06 11:48:04', '2026-09-29 11:56:15', 294, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 17:18:04'),
(294, 1, 'd1f3adf3b12a7329364e62dda3f0dcdbd59f045455382135229f530fb59857a9', '2026-10-06 11:56:15', '2026-09-29 12:04:15', 295, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 17:26:15'),
(295, 1, '3e99fa6f8e645828a10b8c9971885c7216c95858225661ffcd77f7fb9f834b0b', '2026-10-06 12:04:15', '2026-09-29 12:33:27', 296, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 17:34:15'),
(296, 1, '5fdf133973f99951a7e8488be1320354872d9e08ed272dc1506010a2ac5684a8', '2026-10-06 12:33:27', '2026-09-29 12:39:16', 297, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:03:27'),
(297, 1, 'e36fccf0c62477c81dc44f5c3a236387e5527594430948b03fee349bab00bae7', '2026-10-06 12:39:16', '2026-09-29 12:40:12', 298, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:09:16'),
(298, 1, '9c38bbb5661df15951703707abf21a200dd838735a066cf8013c62fff4267d54', '2026-10-06 12:40:12', '2026-09-29 12:40:19', 299, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:10:12'),
(299, 1, 'b24e4b6bfa90d2ec026a28c22e3b9d6a2d33c372fdf4632f9c346b981e15f598', '2026-10-06 12:40:19', '2026-09-29 12:48:11', 300, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:10:19'),
(300, 1, '10d062cae27e557621ea2553c47830a1510d087390fdb1e11e7303326018051a', '2026-10-06 12:48:11', '2026-09-29 12:48:14', 301, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:18:11'),
(301, 1, '73d2587e5e58d6fffba90074fbeaa83c8bc53b7817d7d94c250055eb16a7a334', '2026-10-06 12:48:14', '2026-09-29 12:49:06', 302, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:18:14'),
(302, 1, 'dcb063f1d61c7d1fe0e2f870e1f6097896551e36d8bd0102fb6644ed6d7ad535', '2026-10-06 12:49:06', '2026-09-29 13:08:57', 303, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:19:06'),
(303, 1, 'fbfe4450067f1c0c6055f29877708c9f0f23e354b1883bab40d407f709d9f16b', '2026-10-06 13:08:57', '2026-09-29 13:11:05', 304, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:38:57'),
(304, 1, '73f28a4a3eda7c848529420cda5ab045b9ac0c47cc6d45e089318a2031d192a9', '2026-10-06 13:11:05', '2026-09-30 09:59:01', 305, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-29 18:41:05'),
(305, 1, '91eb4da06e3e6761e2c88153f76f5445e0e737c4bbeecdc500fdcfe10efd6a3f', '2026-10-07 09:59:01', '2026-09-30 09:59:04', 306, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 15:29:01'),
(306, 1, '9cde2570b28388f980764685e5faf9bf251f89a26482abc554b7ee015ec964f0', '2026-10-07 09:59:04', '2026-09-30 10:37:00', 307, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 15:29:04'),
(307, 1, '9731256117096a293958ac30583312d0e3ddff6e118224cbe4666afbe2265793', '2026-10-07 10:37:00', '2026-09-30 11:03:25', 308, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:07:00'),
(308, 1, 'b3b60ce243c90407a3b32efef1adf73d26ab6c33c24ab6d7f59247354cf29915', '2026-10-07 11:03:25', '2026-09-30 11:03:30', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:33:25'),
(309, 1, '52c753d6b6a8e0aad7a57d3b9664a5acd0c59711b74f3028a29217ad4cb481a8', '2026-10-07 11:03:31', '2026-09-30 11:03:33', 310, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:33:31'),
(310, 1, 'ffef1d441974def03fe9be8c5122b578d191888c6fdfd1ae5346e1ee18f1eb9b', '2026-10-07 11:03:33', '2026-09-30 11:29:56', 311, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:33:33'),
(311, 1, '9486037de53df6a4f8434a17440383d59ea12352b3fd8265d368b13fcff207ef', '2026-10-07 11:29:56', '2026-09-30 11:44:06', 312, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 16:59:56'),
(312, 1, '6f87a9a2faf96a0c012b264c80ec308347652807481a9a8729bc0db89ef4841d', '2026-10-07 11:44:06', '2026-09-30 11:44:39', 313, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:14:06'),
(313, 1, 'b6344811e360f1b3f3a1db71b1ae52cbb7a3e215fba506e388940e3b1a71148f', '2026-10-07 11:44:39', '2026-09-30 11:45:02', 314, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:14:39'),
(314, 1, 'd0a48978401694c3309869aab794d885c7528df31c154a2150d7372481e8c4f9', '2026-10-07 11:45:02', '2026-09-30 11:45:04', 315, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:15:02'),
(315, 1, '172ed78214e6de657287046a28145996d8682245cb31c6821f49c9dbc71c6f87', '2026-10-07 11:45:04', '2026-09-30 11:50:29', 316, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:15:04'),
(316, 1, '93fe61f188d315d4c81c4d49cbc9f51abac96133ee5e0653d5b4c5e0431be09b', '2026-10-07 11:50:29', '2026-09-30 12:11:09', 317, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:20:29'),
(317, 1, 'c4208d84170b3702d5938221753809f196677dc1a2c874bcf69c871fdb208aa4', '2026-10-07 12:11:09', '2026-09-30 12:26:13', 318, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:41:09'),
(318, 1, '40dd2956e2db487e07cdb20ff89bfc195def17f3e316dc371e1a31a250cb09f6', '2026-10-07 12:26:13', '2026-09-30 12:27:41', 319, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:56:13'),
(319, 1, 'c84b6e44e9194310feb5af12bd5df023429f9874ab0e3fee2cf2dbdcfd77325e', '2026-10-07 12:27:41', '2026-09-30 12:27:53', 320, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:57:41'),
(320, 1, 'af3638a3e801b7a842db514e820423bd9705c928c2b7f4954502b949d0a6d3c9', '2026-10-07 12:27:53', '2026-10-01 05:09:07', 321, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-09-30 17:57:53'),
(321, 1, '2b2cc99795b9860e5a6dc3a1cda2f5f8e7f78d69e96ecfc6d73e966eab0445c5', '2026-10-08 05:09:07', '2026-10-01 05:09:09', 322, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:39:07'),
(322, 1, 'bf7ae520fd5705887c834eb54caa989d5f939244ba446a1804eccd18b5b55833', '2026-10-08 05:09:09', '2026-10-01 05:09:11', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:39:09'),
(323, 1, 'f5495f8fa767fd62472ead9704ea3e2e485eb5d0e3318198d05feeb81b053847', '2026-10-08 05:09:12', '2026-10-01 05:09:15', 324, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:39:12'),
(324, 1, '0175fce66f5672910793b3ea929211386944016a83772b438d1d164c57822438', '2026-10-08 05:09:15', '2026-10-01 05:15:05', 325, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:39:15'),
(325, 1, 'b34790084a2dc490d5e5087822a6d5eb5926b9db0a7cc84432b97ed4a4572e9d', '2026-10-08 05:15:04', '2026-10-01 05:16:05', 326, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:45:04'),
(326, 1, '7662b4a67fcc0ba299450bae59a7677ce507e4f128842775e08a0d157109a93c', '2026-10-08 05:16:05', '2026-10-01 05:16:42', 327, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:46:05'),
(327, 1, 'fca1fc0cd8e4e14bf4914f7fdd9ac7224039a99801a5b68f56d974ca77c30a1b', '2026-10-08 05:16:42', '2026-10-01 05:31:52', 328, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:46:42'),
(328, 1, 'f109672366255228b7effacb4e01c6d6eb4b3e23b1d4d223f8e1054a9781ae9f', '2026-10-08 05:31:52', '2026-10-01 05:32:01', 329, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:01:52'),
(329, 1, '94dc4c4e09ef2815209801c940f5112c1879324d928ba5bb5c39eec9ec6da083', '2026-10-08 05:32:01', '2026-10-01 05:35:41', 330, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:02:01'),
(330, 1, '4d75ebbd3dd161704bc0c9f82ba291e3d5ec3cc5eaa0409e4bd3c6b77c365811', '2026-10-08 05:35:41', '2026-10-01 05:37:36', 331, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:05:41'),
(331, 1, '9f33199c747f9abb40afec34cb8aec35c398c31c764da9fb4cbc74552ce7e11c', '2026-10-08 05:37:36', '2026-10-01 05:40:13', 332, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:07:36'),
(332, 1, '0e1d5042bfe6dd5bafce745e66a6e68c228a43918a745aefcef479458862883b', '2026-10-08 05:40:13', '2026-10-01 05:43:31', 333, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:10:13'),
(333, 1, '1f168ca89ab58724d0b1c67df074fd613be1e052a32469bc7abe220c75f1d8ff', '2026-10-08 05:43:31', '2026-10-01 05:44:01', 334, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:13:31'),
(334, 1, 'ab7d8be98d4fcd1cda57c1da71f9adbd241207961ad9aad3d21d639ae2182b23', '2026-10-08 05:44:01', '2026-10-01 05:45:30', 335, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:14:01'),
(335, 1, '1f13e9d9fe8f0ea6f7c90cf9b7fcec70bf1fe39073a973833ada37eb2f0f7eeb', '2026-10-08 05:45:30', '2026-10-01 05:46:19', 336, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:15:30'),
(336, 1, '5113ae4312ddfe3626568856110d2ee937ce08c7b3ddbf062a19f53688775d47', '2026-10-08 05:46:19', '2026-10-01 05:48:31', 337, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:16:19'),
(337, 1, 'd4a120a275c503235f3a37584d2333a6c12a61b8efeef573d522a037c3a99986', '2026-10-08 05:48:31', '2026-10-01 06:03:47', 338, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:18:31'),
(338, 1, '23565bba0b19a0e5855a1aed0b2817051bcdf052e55eca63ed07f7ed07f28cc9', '2026-10-08 06:03:47', '2026-10-01 06:05:04', 339, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:33:47'),
(339, 1, '997879aa8c0800a364cf5cf48818242d329043c5f3e88506dc0576f3872f907f', '2026-10-08 06:05:04', '2026-10-01 06:20:52', 340, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:35:04'),
(340, 1, '1fcf21836e589544b0f5593df58b4e599defbf1fe7262e07486c2e74ed8d33bf', '2026-10-08 06:20:52', '2026-10-01 06:20:54', 341, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:50:52'),
(341, 1, '38565be8c4a8288119ffc64095cbfabe7cbfc9196b9aa3bff646595837506bcd', '2026-10-08 06:20:54', '2026-10-01 07:02:04', 342, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:50:54'),
(342, 1, '5133f095cacc5a2e4247c039906d23705cc4ebdafb4d26b810f559cb8c84c459', '2026-10-08 07:02:04', '2026-10-01 07:17:10', 343, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 12:32:04'),
(343, 1, 'efcbbd7cf24c3877fed713f328811020b162d5a7efaac2d50f897aade09554ed', '2026-10-08 07:17:10', '2026-10-01 07:24:31', 344, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 12:47:10'),
(344, 1, 'a04594fe27d06ba0956e177f1111c619f864ede08fde31dca8a31073b0ff6673', '2026-10-08 07:24:31', '2026-10-01 08:19:47', 345, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 12:54:31'),
(345, 1, '1da9e62e5850a205b92204eafef7e9a3cc24b4edda5d8e928f7d8c99c312d70d', '2026-10-08 08:19:47', '2026-10-01 08:24:03', 346, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 13:49:47'),
(346, 1, 'fa210ee2dd15ac0998dfce58b1a76bebff35774c64ae01ac9be7fc68577ec822', '2026-10-08 08:24:03', '2026-10-01 08:55:19', 347, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 13:54:03'),
(347, 1, '740f8a2691f5f6f7c9cea1756e35e05d137e562eb40d909384a91c2b3c355941', '2026-10-08 08:55:19', '2026-10-01 09:00:43', 348, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:25:19'),
(348, 1, '13e0cd29e47534adac0b2e2972f53ea6e72e0152b8abd35b86c7f1e2162051bc', '2026-10-08 09:00:43', '2026-10-01 09:09:50', 349, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:30:43'),
(349, 1, '90fe9285ab34246a216396e513738e345fd11036a78ab7b3184d2f86439c81c8', '2026-10-08 09:09:50', '2026-10-01 09:27:48', 350, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:39:50'),
(350, 1, '4b6b19331bb718735124d793af5704d3e0d696bf6fe57c6fdaa3c7a39c8795a4', '2026-10-08 09:27:48', '2026-10-01 10:01:09', 351, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 14:57:48'),
(351, 1, '5cc378213aaabcf9bbeb2f92d4439798d39353213f4ce89fe548a5bc186066dd', '2026-10-08 10:01:09', '2026-10-01 12:52:42', 352, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 15:31:09'),
(352, 1, '72ffb4c1a9e292e6e1411f0edcf6a83c1aa34b773438caee01a0b9c49000ffae', '2026-10-08 12:52:42', '2026-10-05 06:25:59', 353, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 18:22:42'),
(353, 1, 'c105a933ec694dd6b7e5466faae2e347c56523445d3d26bd68eb6fb59277aa7f', '2026-10-12 06:25:59', '2026-10-05 06:35:45', 354, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 11:55:59'),
(354, 1, '6747cd303093ba567a2432e3f603cd554ff7ed0580c713922e96ce86293e501b', '2026-10-12 06:35:43', '2026-10-05 07:24:26', 355, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 12:05:43'),
(355, 1, '167be5af9b243ba6490ae83dffe5fe40e0f3020da352c63014c0fcd7854519e5', '2026-10-12 07:24:26', '2026-10-05 07:24:28', 356, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 12:54:26'),
(356, 1, '5ad5fc5bf26e0684a3ee30b588a79f37b69959496bc8bd024b58edd226c79188', '2026-10-12 07:24:28', '2026-10-05 07:24:30', 357, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 12:54:28'),
(357, 1, '56ed3795ec9d922829f40c9aa2b67a2948fe1a0950bc911fa3345c0f4caf416b', '2026-10-12 07:24:30', '2026-10-05 08:54:37', 358, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 12:54:30'),
(358, 1, 'b42663437ccfd9dab2dc99a3845cf18a5e201a8e0db147d84509d8099271b202', '2026-10-12 08:54:37', '2026-10-05 09:02:49', 359, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 14:24:37'),
(359, 1, 'cda8f83b247bfede8498fe78c14689156c1be7fc36fbadf07787b70cda462315', '2026-10-12 09:02:49', '2026-10-05 09:14:36', 360, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 14:32:49'),
(360, 1, '508bac5bffbbff70548627b74a0497a58061b846940f45102f01741ed8319d06', '2026-10-12 09:14:36', '2026-10-05 09:29:44', 361, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 14:44:36'),
(361, 1, '897faeb81e7da14e14d305acb3fe72cf6ef4d7b60debf781303977c552de8979', '2026-10-12 09:29:44', '2026-10-05 09:54:20', 362, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 14:59:44'),
(362, 1, '551143a6bb283d1d30167f97f631e60003fa0fa35ae4b746d8cb4c946657e410', '2026-10-12 09:54:20', '2026-10-05 09:57:15', 363, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:24:20'),
(363, 1, 'a5dcfdb7e0586d0cfd785f84781446e64f6247dd5b00722ac8c661e10faa6456', '2026-10-12 09:57:15', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:27:15'),
(364, 1, 'ab50ec4973b9b2086e5958d288385c03018b3802a3e1213ae86917d4c7b730ea', '2026-10-12 09:57:28', '2026-10-05 10:05:18', 365, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:27:28'),
(365, 1, '9213f49d63b9233e5418930997a2195c29158b9b13e24f78461e76657ad75bf7', '2026-10-12 10:05:18', '2026-10-05 10:05:30', 366, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:35:18'),
(366, 1, '5c09ebe9d14d81bdc700452e67b6430ffb8ff2258b095bf494c4d7a6eca8cb14', '2026-10-12 10:05:30', '2026-10-05 10:20:41', 367, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:35:30'),
(367, 1, 'db513a74deb751702c66f8f179cbb85ff4d68f9a8b5e45e62ca8c81e24d88b70', '2026-10-12 10:20:41', '2026-10-05 10:24:21', 368, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:50:41'),
(368, 1, '4b63f8977f3c05106aff70edf1d1bf424a829fe3abbe15d532de9fd8ea552556', '2026-10-12 10:24:21', '2026-10-05 10:26:32', 369, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:54:21'),
(369, 1, '6f35969db4a2b1bc3fc2cd5e2978246a5b76c698e3fe2df95f78565567746d40', '2026-10-12 10:26:32', '2026-10-05 10:44:54', 370, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 15:56:32');
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `replaced_by_token_id`, `created_ip`, `user_agent`, `created_at`) VALUES
(370, 1, 'e2e7bacc826f57c5c1dfa0785598829b665a026e28b894cd72db48e09e89190d', '2026-10-12 10:44:54', '2026-10-05 10:46:52', 371, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:14:54'),
(371, 1, '1e7138327f92d39837c8626192a82849589a2471258f752e1b5570959df859d5', '2026-10-12 10:46:52', '2026-10-05 10:47:21', 372, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:16:52'),
(372, 1, '6fe5a8e2c1c6aa5956458e8041ef7d3acccc3009a986680b12a516978321e3fb', '2026-10-12 10:47:21', '2026-10-05 10:49:47', 373, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:17:21'),
(373, 1, '14f2dbfc0d64331edc5eeb812c81a654f4a38826c199fedea735ef0695b64138', '2026-10-12 10:49:47', '2026-10-05 10:51:30', 374, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:19:47'),
(374, 1, '2a1f3e6801bd2bf163f39f3a8a269547dfbbcf096af8dfdc4042829f1c9b9b2f', '2026-10-12 10:51:30', '2026-10-05 10:51:32', 375, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:21:30'),
(375, 1, '4486b80dc4d3bd4b5328291483647951659e7c4d314c141b99ed56f1041301f4', '2026-10-12 10:51:32', '2026-10-05 10:57:35', 376, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:21:32'),
(376, 1, 'df202dc90ff9afa3c73709a9b08b75bd195f2eae846534b8172a081ef5090f89', '2026-10-12 10:57:35', '2026-10-05 10:57:49', 377, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:27:35'),
(377, 1, 'a719237b5d2b1137892d3e48c2ba71ea5d80aa7c96bb4242c4080d362bace44f', '2026-10-12 10:57:49', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:27:49'),
(378, 1, '8f62b68ae3109f5a02c60c77bd52b5f4b6bf67564b5fe2dbf7d3ea78059fc711', '2026-10-12 10:58:24', '2026-10-05 10:58:28', 379, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:28:24'),
(379, 1, 'fcf2a238b5adcff9e5f35cf5dc90e7ae94101c3f83a56f5a730571df95d0a916', '2026-10-12 10:58:28', '2026-10-05 10:58:56', 380, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:28:28'),
(380, 1, '84f65bdb614c51ead93dc85d69f604cc4621f410e9b7643506f9047ee3d37ce6', '2026-10-12 10:58:56', '2026-10-05 11:03:06', 381, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:28:56'),
(381, 1, '717250bc3f3ef7cb6ce70cb4054ae349ebd24d6311bd0f64c7ed7ba7c9750b47', '2026-10-12 11:03:06', '2026-10-05 11:03:18', 382, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:33:06'),
(382, 1, 'aba958792dfea2e5dee81d75457aa0a2dd073d2b8b843cfe35d0f923aead1126', '2026-10-12 11:03:18', '2026-10-05 11:04:07', 383, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:33:18'),
(383, 1, '1078d6984312a7421fde0711ffc9a713c196d1efbf7ab440efeedf8926366ef8', '2026-10-12 11:04:07', '2026-10-05 11:08:17', 384, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:34:07'),
(384, 1, 'afc4e4828e7d7102dd7d8d181fe8d8ef53d446267a777e1d04f70707b1b54b09', '2026-10-12 11:08:17', '2026-10-05 11:11:53', 385, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:38:17'),
(385, 1, '713f72cc921ea9af07468943bb5f84fdbad98a12dff7b6ca8d4bf276b16db072', '2026-10-12 11:11:53', '2026-10-05 11:12:03', 386, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:41:53'),
(386, 1, '9f5e9536812fe656e94cab469a993eb033b2da4772b93f22d7d8e7847b740d16', '2026-10-12 11:12:03', '2026-10-05 11:15:08', 387, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:42:03'),
(387, 1, '23c4d19b8a48df7c5126ec17a7237f70309820622bbfd5fccae7a9f3611316cd', '2026-10-12 11:15:08', '2026-10-05 11:16:10', 388, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:45:08'),
(388, 1, '1dbe19c9e68cb4234d20bad35d6f6c1efd07588631e185830a4f7ab5115864af', '2026-10-12 11:16:10', '2026-10-05 11:19:47', 389, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:46:10'),
(389, 1, 'cc50983fe09a8d321d6780b7c02d8b5e47d245819b5f9d87866cecebd61bc912', '2026-10-12 11:19:47', '2026-10-05 11:44:18', 390, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 16:49:47'),
(390, 1, '0289c005c85f40e248510a0f15d58aea8c3be680db12863d9e9d025e78fccc61', '2026-10-12 11:44:18', '2026-10-05 11:45:47', 391, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:14:18'),
(391, 1, '4d5cbbf7bc1115fbc815486a71eb1df1997c59d3bfb02ad07a76f1fd6decc702', '2026-10-12 11:45:47', '2026-10-05 12:02:53', 392, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:15:47'),
(392, 1, '25d095c70c80a97d09870cabccfbbba8558193d29486bcc29b679678535a1b71', '2026-10-12 12:02:53', '2026-10-05 12:14:10', 393, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:32:53'),
(393, 1, 'a798e98365d267294923ec0a4dc56ad8f510a259c4cd6b7fb154718c108f59af', '2026-10-12 12:14:10', '2026-10-05 12:21:56', 394, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:44:10'),
(394, 1, '9ff77d37f5294dd12d26b2b4f1dd94ef765e4b0cdc6ddf7501f334260dce5f65', '2026-10-12 12:21:56', '2026-10-05 12:21:58', 395, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:51:56'),
(395, 1, '8b17821be2a5beff661326f75c3fcbb967bacc5da344d60115735a35b0c416c5', '2026-10-12 12:21:58', '2026-10-05 12:31:09', 396, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 17:51:58'),
(396, 1, 'c30858688114e5f71bace9fa4c37e7852452de7c54a30dca43f62b06d95af1a3', '2026-10-12 12:31:09', '2026-10-05 13:14:57', 397, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:01:09'),
(397, 1, '41f34b2ff4d1ebe9b2238e1b188237433f19d78bc93428ad30bde328c5ea20c0', '2026-10-12 13:14:57', '2026-10-05 13:15:06', 398, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:44:57'),
(398, 1, '1edab3c552af78c8f28b8a189251c808e3a941ee3f37b83fa31009b63b8f22c5', '2026-10-12 13:15:06', '2026-10-05 13:16:15', 399, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:45:06'),
(399, 1, '50bc7207931dcc7f510147a55cf34b1435218ab8c21e89a7fc9fea0da1530cb5', '2026-10-12 13:16:15', '2026-10-05 13:16:55', 400, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:46:15'),
(400, 1, 'e58215dc375a995a1e29b71fab79d4a6ac5aa724245015c2ada17ae62d191b7e', '2026-10-12 13:16:55', '2026-10-05 13:17:40', 401, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:46:55'),
(401, 1, '6493eb25e9ae6a34a0443c6eeb02626d902ef114bb996820e706c56e13c205ef', '2026-10-12 13:17:40', '2026-10-05 13:18:02', 402, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:47:40'),
(402, 1, '4e2f526666660a6496c2df0d391010a3eb8d7046281de7b74f50044c703801d0', '2026-10-12 13:18:02', '2026-10-05 13:18:07', 403, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:48:02'),
(403, 1, '8b7ebc2be6a9100f7e1415df4e7b6ff4d2327dc8c73b64e4ddc63e3a110b9c46', '2026-10-12 13:18:07', '2026-10-05 13:18:24', 405, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:48:07'),
(405, 1, 'ec8e1104f01689f34a5a99522cdd57144c9c9586a003f5d610501111bf8de8af', '2026-10-12 13:18:24', '2026-10-05 13:20:04', 406, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:48:24'),
(406, 1, 'ba1038d0a51a6cf914e9f888f01dd08ed689cd923a6c856383f60efd73ab42be', '2026-10-12 13:20:04', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:50:04'),
(408, 1, '5550f4d24feb9a42b0ba9f8044295b42e0d96f895e2d14865bfdba9cba970eeb', '2026-10-12 13:20:36', '2026-10-05 13:20:42', 409, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:50:36'),
(409, 1, 'e7e70cbaf7433aeefa675428fcfd2ea646412b2cd033dec289f69d9370c21ac1', '2026-10-12 13:20:42', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:50:42'),
(412, 1, 'f05288bd1caefa79063481ef9828ed360204c8315ed1411eb487c4fa7b2fd9dd', '2026-10-12 13:20:46', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:50:46'),
(413, 1, '792be94d2b3804416756fb250545ff5dccf4ac054d3a4e177dd689865df4c333', '2026-10-12 13:20:47', '2026-10-05 13:20:54', 414, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:50:47'),
(414, 1, '8c00af2bdff52e739737ec5549eac1c580aebe551d486bfaf574c81a6026dea3', '2026-10-12 13:20:54', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:50:54'),
(417, 1, '881107bb9cfea4ecf476ff498cc70bc4f2d7d75e79385b6ec1ae385be4d21be7', '2026-10-12 13:21:06', '2026-10-05 13:21:09', 418, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:51:06'),
(418, 1, 'd46f1cab309611f9fbd002a8964ff250c7fa077c659221f9235ffe34fff9de23', '2026-10-12 13:21:09', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-05 18:51:09');

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `filename` varchar(255) NOT NULL,
  `checksum` char(64) NOT NULL,
  `applied_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schema_migrations`
--

INSERT INTO `schema_migrations` (`id`, `filename`, `checksum`, `applied_at`) VALUES
(1, '001_initial_schema.sql', 'f5b0636603fe1c4397169a5fc1cac08eac47d02ef9af6e5f50489722dc051a19', '2026-09-22 14:57:45'),
(2, '002_expand_meetings.sql', 'f64c960ad6adb5b0abaf0a764e93abc6934b2d328e3d5257c0cc2c1eb21778c7', '2026-09-23 22:43:19'),
(3, '003_expand_followups.sql', 'f3e5799eb40d5bf6ac099a461ba3f381bed3f1657f3754f1f315ab6d86f60713', '2026-09-23 23:55:37'),
(4, '004_create_nurture_profiles.sql', 'eb6218f1a9a3b9b8173e82fb06f72b0b5e505a430e7505d8e34e8156f65fab47', '2026-09-24 12:00:34'),
(5, '006_fix_lead_stage_history.sql', '90bb4cdd90a5e630bf854587bea9a27ba4f2c64b38adc81d5a71a64614a4b2bf', '2026-09-24 14:33:48'),
(6, '005_add_lead_estimated_value.sql', '42f5c507dca4e9bc6163b1675db1c74284b3cc9746bbfcdee6101506f975cbd5', '2026-09-24 14:36:45'),
(7, '007_create_briefs.sql', 'a7a8e38284f777ce0f8f7fe87f0de47c5fa8ac674c89ddd3cfae7cbc331e77dc', '2026-09-24 14:56:44'),
(8, '008_create_team_assignments.sql', 'afaa4e5f34292d0ef38f793073f897d31bcbb2efec3a284963692a56e25adecd', '2026-09-24 15:32:44'),
(9, '009_add_branch_management.sql', '1e5b0af4eee90cc0ac1823120a40b5d7a745ef5d80bb18410fc8e87a9ad1da45', '2026-09-24 16:39:26');

-- --------------------------------------------------------

--
-- Table structure for table `team_assignments`
--

CREATE TABLE `team_assignments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `member_branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_cross_branch` tinyint(1) NOT NULL DEFAULT 0,
  `responsibility` varchar(50) NOT NULL,
  `assigned_by` bigint(20) UNSIGNED NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp(),
  `due_at` datetime DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_assignments`
--

INSERT INTO `team_assignments` (`id`, `lead_id`, `user_id`, `member_branch_id`, `is_cross_branch`, `responsibility`, `assigned_by`, `assigned_at`, `due_at`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 2, NULL, 0, 'STRATEGY', 1, '2026-09-24 10:08:49', '2026-10-05 12:00:00', 'PENDING', '2026-09-24 15:38:49', '2026-09-24 15:38:49'),
(2, 2, 2, NULL, 0, 'ACCOUNT_SERVICING', 1, '2026-09-24 10:44:47', '2026-09-30 06:30:00', 'IN_PROGRESS', '2026-09-24 16:14:47', '2026-09-24 10:45:38'),
(3, 2, 2, NULL, 0, 'CREATIVE', 1, '2026-09-24 10:46:12', '2026-09-24 10:46:00', 'PENDING', '2026-09-24 16:16:12', '2026-09-24 16:16:12'),
(4, 2, 2, NULL, 0, 'STRATEGY', 1, '2026-09-24 10:46:28', '2026-09-24 10:46:00', 'PENDING', '2026-09-24 16:16:28', '2026-09-24 16:16:28'),
(5, 6, 3, 2, 1, 'STRATEGY', 1, '2026-09-29 08:39:53', '2026-09-29 08:39:00', 'IN_PROGRESS', '2026-09-29 14:09:53', '2026-09-29 08:40:41'),
(6, 6, 4, 1, 0, 'ACCOUNT_SERVICING', 1, '2026-09-29 08:40:20', '2026-09-29 08:40:00', 'COMPLETED', '2026-09-29 14:10:20', '2026-09-29 11:22:33');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_code` varchar(32) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'OWNER',
  `department` varchar(120) DEFAULT NULL,
  `location` varchar(120) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  `last_login_at` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_code`, `full_name`, `email`, `password_hash`, `role`, `department`, `location`, `status`, `last_login_at`, `password_changed_at`, `created_at`, `updated_at`, `deleted_at`, `branch_id`) VALUES
(1, 'USR-C39E1A159C', 'Super Admin', 'admin@tempestadvertising.com', '$2b$12$i7WtIrUqkeweVIHFqv4GPujTyBN04kCbJSnznURJ56c3evflunLlG', 'SUPER_ADMIN', NULL, NULL, 'ACTIVE', '2026-10-05 13:21:06', NULL, '2026-09-22 15:37:34', '2026-10-05 18:51:06', NULL, NULL),
(2, '', 'Venu Myakam', 'venu@gmail.com', '$2a$12$uc2kFQap9IiUhSYzDNS1c.udCR01jkC3aZU9NbafF0PPacDiUUOG.', 'OWNER', 'Developer', 'Hyderabad', 'ACTIVE', '2026-09-28 08:58:11', NULL, '2026-09-23 21:32:20', '2026-09-29 09:18:31', NULL, 1),
(3, 'USR-1003', 'Test Hyderabad Owner', 'test.owner@tempest.demo', '$2b$12$2RaC6/7r7k3GP/g6l6brLugBlXFjymgoUpGEuh2eDpvSQ571nnohq', 'OWNER', 'Business Development', 'Hyderabad', 'ACTIVE', '2026-09-28 14:21:50', '2026-09-28 14:20:29', '2026-09-28 19:02:31', '2026-09-29 06:15:25', NULL, 2),
(4, 'USR-1004', 'Subroto', 'subroto@gmail.com', '$2b$12$LveAI0czyiO69T3mqUijwOGxBrhjIsxJWATQ2lnbe/Buf7ZhWwmUq', 'OWNER', 'Account Manager', 'Hyderabad', 'ACTIVE', '2026-09-29 08:33:02', '2026-09-28 14:19:50', '2026-09-28 19:37:32', '2026-09-29 14:03:02', NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activities_lead_id` (`lead_id`),
  ADD KEY `idx_activities_type` (`activity_type`),
  ADD KEY `idx_activities_occurred_at` (`occurred_at`),
  ADD KEY `idx_activities_created_by` (`created_by`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_actor_user_id` (`actor_user_id`),
  ADD KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_audit_action` (`action`),
  ADD KEY `idx_audit_created_at` (`created_at`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_branches_code` (`code`),
  ADD UNIQUE KEY `uq_branches_name` (`name`);

--
-- Indexes for table `briefs`
--
ALTER TABLE `briefs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_briefs_lead` (`lead_id`),
  ADD KEY `idx_briefs_status` (`status`),
  ADD KEY `idx_briefs_route` (`route_type`),
  ADD KEY `fk_briefs_route_decided_by` (`route_decided_by`),
  ADD KEY `fk_briefs_approved_by` (`approved_by`),
  ADD KEY `fk_briefs_created_by` (`created_by`),
  ADD KEY `fk_briefs_updated_by` (`updated_by`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_companies_company_code` (`company_code`),
  ADD KEY `idx_companies_name` (`name`),
  ADD KEY `idx_companies_industry` (`industry`),
  ADD KEY `idx_companies_city` (`city`),
  ADD KEY `idx_companies_status` (`status`),
  ADD KEY `idx_companies_deleted_at` (`deleted_at`),
  ADD KEY `fk_companies_created_by` (`created_by`),
  ADD KEY `fk_companies_updated_by` (`updated_by`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_contacts_contact_code` (`contact_code`),
  ADD KEY `idx_contacts_company_id` (`company_id`),
  ADD KEY `idx_contacts_email` (`email`),
  ADD KEY `idx_contacts_phone` (`phone`),
  ADD KEY `idx_contacts_name` (`full_name`),
  ADD KEY `idx_contacts_status` (`status`),
  ADD KEY `fk_contacts_created_by` (`created_by`),
  ADD KEY `fk_contacts_updated_by` (`updated_by`);

--
-- Indexes for table `followups`
--
ALTER TABLE `followups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_followups_followup_code` (`followup_code`),
  ADD KEY `idx_followups_lead_id` (`lead_id`),
  ADD KEY `idx_followups_assigned_to` (`assigned_to`),
  ADD KEY `idx_followups_due_at` (`due_at`),
  ADD KEY `idx_followups_status` (`status`),
  ADD KEY `idx_followups_priority` (`priority`),
  ADD KEY `idx_followups_assignee_status_due` (`assigned_to`,`status`,`due_at`),
  ADD KEY `fk_followups_created_by` (`created_by`),
  ADD KEY `fk_followups_updated_by` (`updated_by`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_leads_lead_code` (`lead_code`),
  ADD KEY `idx_leads_company_id` (`company_id`),
  ADD KEY `idx_leads_primary_contact_id` (`primary_contact_id`),
  ADD KEY `idx_leads_owner_id` (`owner_id`),
  ADD KEY `idx_leads_stage` (`stage`),
  ADD KEY `idx_leads_status` (`status`),
  ADD KEY `idx_leads_priority` (`priority`),
  ADD KEY `idx_leads_source` (`source`),
  ADD KEY `idx_leads_follow_up_at` (`follow_up_at`),
  ADD KEY `idx_leads_last_touch_at` (`last_touch_at`),
  ADD KEY `idx_leads_deleted_at` (`deleted_at`),
  ADD KEY `idx_leads_owner_stage` (`owner_id`,`stage`),
  ADD KEY `idx_leads_owner_follow_up` (`owner_id`,`follow_up_at`),
  ADD KEY `fk_leads_created_by` (`created_by`),
  ADD KEY `fk_leads_updated_by` (`updated_by`),
  ADD KEY `fk_leads_branch` (`branch_id`);

--
-- Indexes for table `lead_stage_history`
--
ALTER TABLE `lead_stage_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stage_history_lead_id` (`lead_id`),
  ADD KEY `idx_stage_history_changed_by` (`changed_by`),
  ADD KEY `idx_stage_history_created_at` (`created_at`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_meetings_meeting_code` (`meeting_code`),
  ADD KEY `idx_meetings_lead_id` (`lead_id`),
  ADD KEY `idx_meetings_starts_at` (`starts_at`),
  ADD KEY `idx_meetings_status` (`status`),
  ADD KEY `idx_meetings_created_by` (`created_by`),
  ADD KEY `fk_meetings_updated_by` (`updated_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_id` (`user_id`),
  ADD KEY `idx_notifications_lead_id` (`lead_id`),
  ADD KEY `idx_notifications_read_at` (`read_at`),
  ADD KEY `idx_notifications_created_at` (`created_at`),
  ADD KEY `idx_notifications_user_read` (`user_id`,`read_at`);

--
-- Indexes for table `nurture_profiles`
--
ALTER TABLE `nurture_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_nurture_profiles_lead` (`lead_id`),
  ADD KEY `idx_nurture_category` (`category`),
  ADD KEY `idx_nurture_reconnect` (`reconnect_at`),
  ADD KEY `idx_nurture_communication` (`communication_status`),
  ADD KEY `fk_nurture_created_by` (`created_by`),
  ADD KEY `fk_nurture_updated_by` (`updated_by`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_password_reset_token_hash` (`token_hash`),
  ADD KEY `idx_password_reset_user_id` (`user_id`),
  ADD KEY `idx_password_reset_expires_at` (`expires_at`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_refresh_tokens_hash` (`token_hash`),
  ADD KEY `idx_refresh_tokens_user_id` (`user_id`),
  ADD KEY `idx_refresh_tokens_expires_at` (`expires_at`),
  ADD KEY `idx_refresh_tokens_revoked_at` (`revoked_at`),
  ADD KEY `fk_refresh_tokens_replacement` (`replaced_by_token_id`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_schema_migrations_filename` (`filename`);

--
-- Indexes for table `team_assignments`
--
ALTER TABLE `team_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_team_assignment_role` (`lead_id`,`responsibility`),
  ADD KEY `idx_team_assignment_user` (`user_id`),
  ADD KEY `idx_team_assignment_status` (`status`),
  ADD KEY `idx_team_assignment_due` (`due_at`),
  ADD KEY `fk_team_assignment_assigned_by` (`assigned_by`),
  ADD KEY `fk_team_assignment_member_branch` (`member_branch_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_user_code` (`user_code`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_status` (`status`),
  ADD KEY `idx_users_deleted_at` (`deleted_at`),
  ADD KEY `fk_users_branch` (`branch_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `briefs`
--
ALTER TABLE `briefs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `followups`
--
ALTER TABLE `followups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `lead_stage_history`
--
ALTER TABLE `lead_stage_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nurture_profiles`
--
ALTER TABLE `nurture_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=419;

--
-- AUTO_INCREMENT for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `team_assignments`
--
ALTER TABLE `team_assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `fk_activities_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_activities_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `briefs`
--
ALTER TABLE `briefs`
  ADD CONSTRAINT `fk_briefs_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_briefs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_briefs_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  ADD CONSTRAINT `fk_briefs_route_decided_by` FOREIGN KEY (`route_decided_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_briefs_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `fk_companies_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_companies_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `fk_contacts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contacts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contacts_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `followups`
--
ALTER TABLE `followups`
  ADD CONSTRAINT `fk_followups_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_followups_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_followups_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_followups_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  ADD CONSTRAINT `fk_leads_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_primary_contact` FOREIGN KEY (`primary_contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lead_stage_history`
--
ALTER TABLE `lead_stage_history`
  ADD CONSTRAINT `fk_stage_history_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stage_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `fk_meetings_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_meetings_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_meetings_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `nurture_profiles`
--
ALTER TABLE `nurture_profiles`
  ADD CONSTRAINT `fk_nurture_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_nurture_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  ADD CONSTRAINT `fk_nurture_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_tokens_replacement` FOREIGN KEY (`replaced_by_token_id`) REFERENCES `refresh_tokens` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `team_assignments`
--
ALTER TABLE `team_assignments`
  ADD CONSTRAINT `fk_team_assignment_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_team_assignment_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  ADD CONSTRAINT `fk_team_assignment_member_branch` FOREIGN KEY (`member_branch_id`) REFERENCES `branches` (`id`),
  ADD CONSTRAINT `fk_team_assignment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
