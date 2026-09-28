-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 28, 2026 at 08:17 AM
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
(50, 1, 'Meeting', 'Test', 'Completed meeting', '2026-09-28 04:53:22', 1, '2026-09-28 10:23:22', '2026-09-28 10:23:22');

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
(65, 1, 'MEETING', 2, 'MEETING_COMPLETED', '{\"id\":2,\"meetingCode\":\"MET-1002\",\"leadId\":1,\"leadCode\":\"LED-3001\",\"companyName\":\"Aster Habitat\",\"contactId\":1,\"contactCode\":\"CON-2001\",\"contactName\":\"Ravi Menon\",\"title\":\"Test Schedule meeting\",\"startsAt\":\"2026-09-24T05:30:00.000Z\",\"endsAt\":\"2026-09-24T06:30:00.000Z\",\"meetingType\":\"PHONE_CALL\",\"status\":\"SCHEDULED\",\"participantsJson\":null,\"meetingUrl\":null,\"location\":null,\"agenda\":\"Testing Schedule meeting\",\"notes\":null,\"outcome\":null,\"nextAction\":null,\"followUpAt\":null,\"completedAt\":null,\"completedBy\":null,\"statusReason\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":null,\"ownerId\":1,\"ownerName\":\"Super Admin\",\"createdAt\":\"2026-09-23T23:04:08.000Z\",\"updatedAt\":\"2026-09-23T23:04:08.000Z\",\"participants\":[]}', '{\"id\":2,\"meetingCode\":\"MET-1002\",\"leadId\":1,\"leadCode\":\"LED-3001\",\"companyName\":\"Aster Habitat\",\"contactId\":1,\"contactCode\":\"CON-2001\",\"contactName\":\"Ravi Menon\",\"title\":\"Test Schedule meeting\",\"startsAt\":\"2026-09-24T05:30:00.000Z\",\"endsAt\":\"2026-09-24T06:30:00.000Z\",\"meetingType\":\"PHONE_CALL\",\"status\":\"COMPLETED\",\"participantsJson\":null,\"meetingUrl\":null,\"location\":null,\"agenda\":\"Testing Schedule meeting\",\"notes\":\"Completed meeting\",\"outcome\":\"Test\",\"nextAction\":\"Testing\",\"followUpAt\":\"2026-09-29T04:30:00.000Z\",\"completedAt\":\"2026-09-28T04:53:22.000Z\",\"completedBy\":1,\"statusReason\":null,\"createdBy\":1,\"createdByName\":\"Super Admin\",\"completedByName\":\"Super Admin\",\"ownerId\":1,\"ownerName\":\"Super Admin\",\"createdAt\":\"2026-09-23T23:04:08.000Z\",\"updatedAt\":\"2026-09-28T10:23:22.000Z\",\"participants\":[]}', '{\"followupCode\":\"FUP-B865B12255\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:23:22');

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
(1, 2, 'Generate qualified residential property enquiries and improve brand awareness for the upcoming premium apartment launch in Hyderabad.', 'The client is receiving a high volume of low-quality digital enquiries and has limited awareness among premium home buyers in the target micro-market.', 'Working professionals, business owners and NRIs aged 28–50 with household income above ₹20 lakh per year, primarily located in Hyderabad and nearby IT corridors.', 'Create an integrated launch campaign covering brand positioning, creative communication, digital lead generation, social media, performance marketing, outdoor advertising and sales-support materials.', 'The client is currently running basic Meta and Google lead-generation campaigns through an existing media partner, with limited creative variation and no integrated campaign strategy.', 'Brand strategy, campaign concept, creative development, social media, performance marketing, outdoor communication, launch collateral, landing page and lead-generation support.', 'Campaign development within 6 weeks, followed by a 3-month launch campaign.', '₹18–25 lakh for creative, digital, media and launch communication.', 'Rajesh Kumar – Director, Marketing & Sales.', 'Marketing team review → Sales Director review → Managing Director final approval.', 'Campaign strategy, key visual, campaign tagline, digital banners, social media creatives, landing page, Google and Meta ads, outdoor adaptations, brochures and sales presentation.', 'Premium positioning, stronger differentiation from nearby competitors, high-quality enquiries and consistent communication across digital and offline channels.', 'Prestige Group, Aparna Constructions, My Home Group, Rajapushpa Properties and local premium residential developments.', 'Home buyers compare projects heavily on location, developer credibility, amenities, possession timeline, pricing and lifestyle value. Digital research strongly influences the final shortlist before a site visit.', 'All communication must include the approved project logo, RERA details, location map, legal disclaimer, possession timeline and approved pricing information.', 'READY', 'KNOWN_EXISTING', 'Tempest has previously worked with real-estate clients and understands the premium residential category, buyer journey and media requirements.', 1, '2026-09-24 09:55:06', NULL, NULL, 1, 1, '2026-09-24 15:25:06', '2026-09-24 15:25:06');

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
(9, 'CMP-1009', 'Test Ads', 'Real Estate', 'Hyderabad', NULL, 'India', 'https://lucide.dev/', 'Test', 'LinkedIn', 'ACTIVE', 'Test', 2, 2, '2026-09-28 10:19:47', '2026-09-28 10:19:47', NULL);

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
(4, 'CON-2004', 9, 'Tester 01', 'Testing', '7894561230', 'test@gmail.com', 1, 'ACTIVE', NULL, 2, 2, '2026-09-28 10:19:47', '2026-09-28 10:19:47', NULL);

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
(11, 'FUP-B865B12255', 1, 1, 'Testing', '2026-09-29 04:30:00', 'High', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-09-28 10:23:22', '2026-09-28 10:23:22');

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
(1, 'LED-3001', 1, 1, 1, 'Brief', 'Open', 'High', 'Referral', 'Integrated launch campaign', 250000000, 'Testing', '2026-09-29 04:30:00', '2026-09-28 04:53:22', 0, 'Test Nurture', 'Residential launch campaign with digital and media requirements.', 1, 1, '2026-09-23 16:58:51', '2026-09-28 10:23:22', NULL, 0.00, 1),
(2, 'LED-3002', 8, 3, 2, 'Brief', 'Open', 'High', 'LinkedIn', 'Integrated branding and digital launch campaign', 180000000, 'Reconnect when relevant', '2026-10-25 04:30:00', '2026-09-24 07:19:55', 1, 'Test Lost to connected', 'Client is planning a residential project launch and requires branding, social media, digital advertising, lead generation and campaign strategy.', 1, 1, '2026-09-23 18:13:07', '2026-09-24 17:59:12', NULL, 0.00, 1),
(3, 'LED-3003', 9, 4, 2, 'New', 'Open', 'High', 'LinkedIn', 'Testing', 0, 'Meeting', '2026-09-28 05:00:00', '2026-09-28 04:49:47', 1, NULL, 'Testing', 2, 2, '2026-09-28 10:19:47', '2026-09-28 10:19:47', NULL, 150000.00, 1);

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
(22, 3, NULL, 'New', NULL, '', 2, 'Lead created.', NULL, '2026-09-28 04:49:47');

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
(2, 'MET-1002', 1, 1, 'Test Schedule meeting', '2026-09-24 05:30:00', '2026-09-24 06:30:00', 'PHONE_CALL', NULL, 'COMPLETED', NULL, NULL, 'Testing Schedule meeting', 'Completed meeting', 'Test', 'Testing', '2026-09-29 04:30:00', 1, 1, '2026-09-28 04:53:22', 1, NULL, NULL, '2026-09-23 23:04:08', '2026-09-28 10:23:22');

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
(6, 1, 'LATER', 'Test moved to nurture', NULL, 'NOT_CONTACTED', '2026-10-25 04:30:00', '2026-09-24 07:27:43', 1, 1, '2026-09-24 12:57:43', '2026-09-24 14:50:22');

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
(20, 1, 'd84b5829a6bad22d92b4cc089c024e4b362ae87096fcafad4c4090a8bcdb94bd', '2026-09-30 06:02:59', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 11:32:59'),
(21, 1, 'f9df88f601aa3f0fa8998741ccf4414c9d755112b9819d526e876ff591282cb4', '2026-09-30 06:06:39', '2026-09-23 06:29:51', 23, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 11:36:39'),
(22, 1, 'a584458128867e447616e68f48d9222d51c8a33c28a05672f0db8434bf427de6', '2026-09-30 06:07:39', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 11:37:39'),
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
(44, 1, 'f9b64169a23be82ee6679d2c68b38ee37fe8f03338fbae3ff10b44e83c94ed1b', '2026-09-30 11:01:51', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 16:31:51'),
(45, 1, 'd64c2efb30603923737af3f5b86e4f2e6fca9014f4eaf3a6715d60ab6cc68439', '2026-09-30 11:07:38', '2026-09-23 11:11:52', 46, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:37:38'),
(46, 1, '158e618f6e22c41395e1253bc2f5cbfdafe37d6e544622c8b5e10d57ae20d0a3', '2026-09-30 11:11:52', '2026-09-23 11:13:58', 47, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 16:41:52'),
(47, 1, '7aca1e16758a3f71f08beb5bc469d5a8e7540f33b56b81402185c07cf6205108', '2026-09-30 11:13:58', '2026-09-23 11:30:36', 49, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 16:43:58'),
(48, 1, '1615cf8a31733a911577d9082c95bd6fc9dd4a903cb603e797f2e0a969f181fa', '2026-09-30 11:27:54', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 16:57:54'),
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
(68, 1, 'af0ecd3e41399788965a9fd1499e2bcad1cd53841116c27ffdea79c8e53d2749', '2026-09-30 13:14:59', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:44:59'),
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
(80, 1, '5dd7d919ab8a6c9e0d12f872554396799697f42c0105081e32b421f43a81544c', '2026-09-30 16:37:12', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 22:07:12'),
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
(96, 1, '9a4345fb9c9aeba3137964620def4537cda58a200555529ca038e3af35f29702', '2026-09-30 17:18:12', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 22:48:12'),
(97, 1, '930647684122cf223dfa50f7ac1680c74700393a01631bfa69c6fe0b0cb67b52', '2026-09-30 17:24:11', '2026-09-23 17:32:58', 98, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 22:54:11'),
(98, 1, '7ec03c22fcd572a139c3c4cf8731fb0bcea4ee922d95d63ecac96867d711cf10', '2026-09-30 17:32:58', '2026-09-23 17:41:50', 99, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:02:58'),
(99, 1, '1de9e0e8d4f62260893a1591f4ee0ae86821e67599b4d54ec1b215830c4f2a10', '2026-09-30 17:41:50', '2026-09-23 17:42:18', 100, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:11:50'),
(100, 1, 'b8551f45162bff34072a1fb7bf064c65438a846d81962c1020fe01f894e2dd4e', '2026-09-30 17:42:18', '2026-09-23 17:45:57', 101, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:12:18'),
(101, 1, '729a7dd52a7ca362289f5d6c64478717707289d65d90300ab97d5663abc6fc02', '2026-09-30 17:45:57', '2026-09-23 17:53:28', 102, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:15:57'),
(102, 1, 'ce0c3858195b181112c73663facc8876bc9ffdc2ed2cd5a10fe872ef009de377', '2026-09-30 17:53:28', '2026-09-23 18:04:04', 104, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:23:28'),
(103, 1, 'e6d324f2cb21e7b206f5dcd5c4ddaf1edfb80131c7525aaa109aaf5d12ac1dbc', '2026-09-30 17:54:53', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-23 23:24:53'),
(104, 1, 'c74cdfa1d3969c810087f0e0979375c534da383b9723823fca28fdf4c1c88230', '2026-09-30 18:04:04', '2026-09-23 18:05:06', 105, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:34:04'),
(105, 1, 'd80404f51737caf4a81ad7558d8f03a82558ed19fcdc27caef80b3e550755a9f', '2026-09-30 18:05:06', '2026-09-23 18:14:35', 106, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:35:06'),
(106, 1, '38f38c0c2a3471ee031d6db00e4715bd1edbd9f7ad3c4171fe4f55df9df8d143', '2026-09-30 18:14:35', '2026-09-23 18:15:29', 107, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:44:35'),
(107, 1, 'a19e0e2d45af7d61d86919169797115127af90f7fe7d5204dea1c323a1e0df0a', '2026-09-30 18:15:29', '2026-09-23 18:18:54', 108, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:45:29'),
(108, 1, '39e7304aa7161c9aac16bd847b8ac68d8a4037d61c90255036e3b7fbf144538a', '2026-09-30 18:18:54', '2026-09-23 18:19:05', 109, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:48:54'),
(109, 1, 'a126991199ecf23ed2fce18751218b12168fe04e85c2b7bfc95eae4ab3e5f25b', '2026-09-30 18:19:05', '2026-09-23 18:19:53', 110, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:49:05'),
(110, 1, '1409005ff2b886217494bbcb033864abc80b3a5a2a597c04ad91b7cd2209c668', '2026-09-30 18:19:53', '2026-09-23 18:35:53', 112, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 23:49:53'),
(111, 1, 'f957640bbbc6be33132b4962f1e2f4be6782b579a2f2aa5370bcd695fb6e79ae', '2026-09-30 18:31:43', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 00:01:43'),
(112, 1, '10022a627927f19d04901f2b12958184352ba0ca223dac5493b6388b4b6e35ee', '2026-09-30 18:35:53', '2026-09-23 18:38:00', 113, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:05:53'),
(113, 1, '036b1c0bef7a2b8739f12314f83e10902857c6c9ab1516804e8f300c4623e071', '2026-09-30 18:38:00', '2026-09-23 18:39:00', 114, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:08:00'),
(114, 1, 'a2920090f76c0b1a55a177bab8d3ef91fd8cd60384ad156d563c0799a142e42e', '2026-09-30 18:39:00', '2026-09-23 18:40:00', 115, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:09:00'),
(115, 1, 'aaf8ecbd783770ca0a156f853528685571253990ce5786970c97d831cfa81c19', '2026-09-30 18:40:00', '2026-09-23 18:41:00', 116, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:10:00'),
(116, 1, '5d0ec0fbaedad31bc770360cd897d8a2a6018aed65d8e913dca75c7f45aafbde', '2026-09-30 18:41:00', '2026-09-23 18:42:00', 117, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:11:00'),
(117, 1, 'a04e5a53f4665dae304ab89fd2e2a754dd65087e572d6cccc758a5ef891da113', '2026-09-30 18:42:00', '2026-09-23 18:42:26', 118, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:00'),
(118, 1, 'e7bc525002e6af4aec08d18415fca7cb52d6e3617da58f9ada545a33003bd558', '2026-09-30 18:42:26', '2026-09-23 18:42:29', 119, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:26'),
(119, 1, 'f6a11ffb07f97ed1d4a40816c98136a01f1081d802298a7243e1b8fb70099871', '2026-09-30 18:42:29', '2026-09-23 18:42:48', 120, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:29'),
(120, 1, '24397df571723d6a4476fc17b5228cb54725f459a116d3689cb29619ba3564f4', '2026-09-30 18:42:48', '2026-09-23 18:42:51', 121, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:48'),
(121, 1, 'acf52a080fda2aaaf6ac389c209b143a29110a855b9e015a20bc2879e8154818', '2026-09-30 18:42:51', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 00:12:51'),
(122, 1, 'c78d752981637ab85331fc619eb068120aa09cde132322683fc49555e6b424a8', '2026-10-01 05:55:03', '2026-09-24 06:21:40', 124, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:25:03'),
(123, 1, '4436b6e179f2023c81e252bd8c409acdd094b974dff4dd763136a86d1cb3a3f6', '2026-10-01 06:07:52', '2026-09-24 06:25:32', 130, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:37:52'),
(124, 1, 'fb100703dc0ef82f59741eafce330a6c9ba3b29c16f650e54097e4f8ae880662', '2026-10-01 06:21:40', '2026-09-24 06:21:42', 125, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:51:40'),
(125, 1, '10dca9a56ad6578564cb316ced7824584eebe713d66cf5c2c52085eb1fa0d9a7', '2026-10-01 06:21:42', '2026-09-24 06:21:45', 126, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:51:42'),
(126, 1, '9bf26630fbdcb02357a73d9b24ab1b74d2873f297b0eb69fde9857333354855c', '2026-10-01 06:21:45', '2026-09-24 06:22:20', 127, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:51:45'),
(127, 1, '90a4dfc2e19297b7a3a1fcd53f9032d2ac5255625ba7f1319450f286d6c4a149', '2026-10-01 06:22:20', '2026-09-24 06:22:28', 128, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:52:20'),
(128, 1, '678ea241d28cf2243f41eca66c0c78a9ea12030da9b7962af1b7d7057693be40', '2026-10-01 06:22:28', '2026-09-24 06:25:21', 129, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:52:28'),
(129, 1, '2d539e7d0df0cc1141be113f54fdc705fab7895b89d67020dc5228b2d8dceadb', '2026-10-01 06:25:21', '2026-09-24 06:25:39', 131, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:55:21'),
(130, 1, '32321a8b86f9634c4dbce20e5f14bdcc68ae2b7666edc235e8a6064608e37f37', '2026-10-01 06:25:32', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:55:32'),
(131, 1, '33bbf9c5e9925be16796f50d96695237088af6b85509e198eb53e918252078e2', '2026-10-01 06:25:39', '2026-09-24 06:45:55', 133, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 11:55:39'),
(132, 1, '8f5f86ef245c93bb0d310de8e8ff7e583544f66b80e7c206088bf4f0349da193', '2026-10-01 06:43:47', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 12:13:47'),
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
(152, 1, 'cee762c8ee7e5155e4d620a8cf9e386b118d288a5e62e072c4e9bf560631d23d', '2026-10-01 10:07:25', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 15:37:25'),
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
(170, 1, '88a8f5b4168c71524bdbbb6f2baa3448ed70a4c1bf2f7cf092f94a69d89f6912', '2026-10-01 12:22:17', NULL, NULL, '::1', 'PostmanRuntime/2.7.0', '2026-09-24 17:52:17'),
(171, 1, '3c60300798589e67c9db1f820c74c248007f226b7d492b74dcad24b1ed8c2d04', '2026-10-01 12:24:15', '2026-09-24 12:34:36', 175, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:54:15'),
(173, 1, 'f97eb95c9dfddf9eb500bb493966295f8867e7653ef933e4aefe2801b0ded111', '2026-10-01 12:28:40', '2026-09-24 12:29:17', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:58:40'),
(174, 2, '7e8cb115d9b1d6bb61206228c6c78d295ebe89d461e678690c21affdb01d2724', '2026-10-01 12:29:40', '2026-09-24 12:44:28', 177, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 17:59:40'),
(175, 1, '9e53df7ef122e9ffbd0b351397abbfe87e0d4cfef6782a1a6f01966ad1414c18', '2026-10-01 12:34:36', '2026-09-24 12:34:37', 176, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:04:36'),
(176, 1, 'd8a96c78fcfcc8a170a3ee2a0323f70877f89f335335702dec95ac252a9a37e3', '2026-10-01 12:34:37', '2026-09-24 12:50:53', 178, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:04:37'),
(177, 2, '653d29b6b4c0e712695e1933e03eba3df0fef42a55f7a724c80d103d1b7cbde7', '2026-10-01 12:44:28', '2026-09-24 12:55:00', 182, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:14:28'),
(178, 1, 'a8e9defea09bfa3e5115f3feedd15bda5d7256232e5c5c31a6aa0e9eda817042', '2026-10-01 12:50:53', '2026-09-24 12:53:19', 179, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:20:53'),
(179, 1, '8db5f0bea86d354ffadcde057d51bf3adade85d1445da13ed5d8caac9f5478fb', '2026-10-01 12:53:19', '2026-09-24 12:53:20', 180, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:23:19'),
(180, 1, 'b7d34903824de53c023196a71070be082e394d577684244daaeade2aef0e6191', '2026-10-01 12:53:20', '2026-09-24 12:53:28', 181, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:23:20'),
(181, 1, '2f75fbb1ad352ef3ff0832a319cb4ea5a9116a66b30f811f85c29a15262c3d69', '2026-10-01 12:53:28', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:23:28'),
(182, 2, 'da21960fc2b656dfe8ee0ee4025732ce84df11caa1042af84b6cc57154a9de30', '2026-10-01 12:55:00', '2026-09-28 04:44:29', 183, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-24 18:25:00'),
(183, 2, 'eaa9ad1464b3f52517ac909efa89c4101d67a1d4904efad7bf68c4e1a25d3983', '2026-10-05 04:44:29', '2026-09-28 04:44:32', 184, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:14:29'),
(184, 2, '368debcae81c0c99d654e49dabf36a1ff2fee3231b119ae7aa3181b54656746c', '2026-10-05 04:44:32', '2026-09-28 04:44:58', 185, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:14:32'),
(185, 2, 'ff3ffb9aa90e842dd7063369826744574c68f84c99b7e08fe194054abee3bbd8', '2026-10-05 04:44:58', '2026-09-28 04:47:32', 186, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:14:58'),
(186, 2, '69c4aca513e76b932b20ae5fcfe0d42815ec8c4c0c53baa2c687bad6e3d2b793', '2026-10-05 04:47:32', '2026-09-28 04:51:43', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:17:32'),
(187, 2, '7da66ecc74353e5ff1d90b59228b6d0bbf79592941046f62a37740f6be358e28', '2026-10-05 04:50:55', '2026-09-28 05:55:48', 191, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:20:55'),
(188, 1, '3dde8e47325b4542f816073b604b73e08d3c9f4c5cbdab90d8493556423bfdc2', '2026-10-05 04:51:46', '2026-09-28 04:52:03', 189, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:21:46'),
(189, 1, '5db9297d11a7fddbec4cd344df26f80a8a7aa93916a4025df963c57fc26e57f7', '2026-10-05 04:52:03', '2026-09-28 05:42:35', 190, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 10:22:03'),
(190, 1, 'b81ae11207d232724abc9703a191051edb242775158178ed057f0b8797f1aac0', '2026-10-05 05:42:35', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 11:12:35');
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `replaced_by_token_id`, `created_ip`, `user_agent`, `created_at`) VALUES
(191, 2, '9a9a453647c480587f0caa7b2f3b65533e6687736666f9f84dfd683a7a6df594', '2026-10-05 05:55:48', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 11:25:48');

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
(4, 2, 2, NULL, 0, 'STRATEGY', 1, '2026-09-24 10:46:28', '2026-09-24 10:46:00', 'PENDING', '2026-09-24 16:16:28', '2026-09-24 16:16:28');

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
(1, 'USR-C39E1A159C', 'Super Admin', 'admin@tempestadvertising.com', '$2b$12$i7WtIrUqkeweVIHFqv4GPujTyBN04kCbJSnznURJ56c3evflunLlG', 'SUPER_ADMIN', NULL, NULL, 'ACTIVE', '2026-09-28 04:51:46', NULL, '2026-09-22 15:37:34', '2026-09-28 10:21:46', NULL, NULL),
(2, '', 'Venu Myakam', 'venu@gmail.com', '$2a$12$uc2kFQap9IiUhSYzDNS1c.udCR01jkC3aZU9NbafF0PPacDiUUOG.', 'OWNER', NULL, NULL, 'ACTIVE', '2026-09-28 04:50:55', NULL, '2026-09-23 21:32:20', '2026-09-28 10:20:55', NULL, 1);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `briefs`
--
ALTER TABLE `briefs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `followups`
--
ALTER TABLE `followups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `lead_stage_history`
--
ALTER TABLE `lead_stage_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nurture_profiles`
--
ALTER TABLE `nurture_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=192;

--
-- AUTO_INCREMENT for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `team_assignments`
--
ALTER TABLE `team_assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
