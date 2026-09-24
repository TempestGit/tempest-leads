-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 23, 2026 at 03:27 PM
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
(5, 2, 'Stage change', 'Moved from Brief to New', 'new', '2026-09-23 13:19:17', 1, '2026-09-23 18:49:17', '2026-09-23 18:49:17');

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
(20, 1, 'LEAD', 2, 'LEAD_STAGE_CHANGED', '{\"stage\":\"Brief\",\"status\":\"Open\"}', '{\"stage\":\"New\",\"status\":\"Open\"}', '{\"reason\":\"new\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:49:17');

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
(2, 'CMP-1002', 'Northstar Foods', 'FMCG', 'Bengaluru', 'Karnataka', 'India', 'https://northstarfoods.example.com', 'Existing creative agency', 'LinkedIn', 'ACTIVE', 'Interested in social media and performance marketing.', 1, 1, '2026-09-23 14:25:46', '2026-09-23 14:25:46', NULL),
(3, 'CMP-1003', 'BluePeak Technologies', 'Information Technology', 'Hyderabad', 'Telangana', 'India', 'https://bluepeaktech.example.com', 'No existing agency', 'Website Enquiry', 'NURTURE', 'Follow up next quarter regarding employer branding requirements.', 1, 1, '2026-09-23 14:26:46', '2026-09-23 14:26:46', NULL),
(4, 'CMP-1004', 'UrbanNest Developers', 'Real Estate', 'Pune', 'Maharashtra', 'India', 'https://urbannest.example.com', 'Working with another digital agency', 'Event', 'ACTIVE', 'Looking for campaign strategy for a new residential project.', 1, 1, '2026-09-23 14:27:34', '2026-09-23 14:27:34', NULL),
(5, 'CMP-1005', 'GreenLeaf Healthcare', 'Healthcare', 'Mumbai', 'Maharashtra', 'India', 'https://greenleafhealth.example.com', 'In-house marketing team', 'Cold Outreach', 'NURTURE', 'Decision expected after internal budget approval.', 1, 1, '2026-09-23 14:28:20', '2026-09-23 14:28:20', NULL),
(6, 'CMP-1006', 'Vertex Mobility', 'Automotive', 'Chennai', 'Tamil Nadu', 'India', 'https://vertexmobility.example.com', 'Creative agency retained', 'Referral', 'ACTIVE', 'Potential requirement for digital media planning and campaign execution.', 1, 1, '2026-09-23 14:29:15', '2026-09-23 14:29:15', NULL),
(7, 'CMP-1007', 'Tempest', 'Other', 'Hyderabad', NULL, 'India', 'https://www.tempestadvertising.com/', 'Creative agency', 'Other', 'ACTIVE', NULL, 1, 1, '2026-09-23 16:15:16', '2026-09-23 16:15:16', NULL),
(8, 'CMP-1008', 'Nova Infra Projects', 'Real Estate', 'Hyderabad', NULL, 'India', 'https://novainfra.example.com', 'None', 'LinkedIn', 'ACTIVE', 'Running digital campaigns for a new residential project launch', 1, 1, '2026-09-23 18:13:07', '2026-09-23 18:13:07', NULL);

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
(3, 'CON-2003', 8, 'Arjun Reddy', 'Marketing Manager', '9876543210', 'arjun.reddy@novainfra.example.com', 1, 'ACTIVE', NULL, 1, 1, '2026-09-23 18:13:07', '2026-09-23 18:13:07', NULL);

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
  `completed_at` datetime DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `followups`
--

INSERT INTO `followups` (`id`, `followup_code`, `lead_id`, `assigned_to`, `action`, `due_at`, `priority`, `status`, `notes`, `completed_at`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'FUP-5DEB3A9727', 1, 1, 'Review client feedback', '2026-09-24 10:30:00', 'HIGH', 'PENDING', NULL, NULL, 1, 1, '2026-09-23 16:58:51', '2026-09-23 16:58:51'),
(2, 'FUP-B7DABCF4AA', 2, 1, 'Schedule discovery meeting', '2026-09-25 04:30:00', 'HIGH', 'PENDING', NULL, NULL, 1, 1, '2026-09-23 18:13:07', '2026-09-23 18:13:07');

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
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `lead_code`, `company_id`, `primary_contact_id`, `owner_id`, `stage`, `status`, `priority`, `source`, `service_required`, `estimated_value_paise`, `next_action`, `follow_up_at`, `last_touch_at`, `known_relationship`, `lifecycle_reason`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'LED-3001', 1, 1, 1, 'Contact Research', 'Open', 'High', 'Referral', 'Integrated launch campaign', 250000000, 'Review client feedback', '2026-09-24 10:30:00', '2026-09-23 12:26:40', 0, 'Research', 'Residential launch campaign with digital and media requirements.', 1, 1, '2026-09-23 16:58:51', '2026-09-23 17:56:40', NULL),
(2, 'LED-3002', 8, 3, 1, 'New', 'Open', 'High', 'LinkedIn', 'Integrated branding and digital launch campaign', 180000000, 'Schedule discovery meeting', '2026-09-25 04:30:00', '2026-09-23 13:19:17', 0, 'new', 'Client is planning a residential project launch and requires branding, social media, digital advertising, lead generation and campaign strategy.', 1, 1, '2026-09-23 18:13:07', '2026-09-23 18:49:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_stage_history`
--

CREATE TABLE `lead_stage_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
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

INSERT INTO `lead_stage_history` (`id`, `lead_id`, `from_stage`, `to_stage`, `changed_by`, `reason`, `metadata`, `created_at`) VALUES
(1, 1, NULL, 'New', 1, 'Lead created.', '{\"initialStage\":true}', '2026-09-23 16:58:51'),
(2, 1, 'New', 'Contact Research', 1, 'Research', NULL, '2026-09-23 17:56:40'),
(3, 2, NULL, 'New', 1, 'Lead created.', '{\"initialStage\":true}', '2026-09-23 18:13:07'),
(4, 2, 'New', 'Brief', 1, 'Test Brief', NULL, '2026-09-23 18:47:54'),
(5, 2, 'Brief', 'New', 1, 'new', NULL, '2026-09-23 18:49:17');

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `meeting_code` varchar(32) NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime DEFAULT NULL,
  `meeting_type` varchar(50) NOT NULL DEFAULT 'VIDEO_CALL',
  `status` varchar(50) NOT NULL DEFAULT 'SCHEDULED',
  `meeting_url` varchar(500) DEFAULT NULL,
  `location` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(68, 1, 'af0ecd3e41399788965a9fd1499e2bcad1cd53841116c27ffdea79c8e53d2749', '2026-09-30 13:14:59', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-23 18:44:59');

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
(1, '001_initial_schema.sql', 'f5b0636603fe1c4397169a5fc1cac08eac47d02ef9af6e5f50489722dc051a19', '2026-09-22 14:57:45');

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
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_code`, `full_name`, `email`, `password_hash`, `role`, `department`, `location`, `status`, `last_login_at`, `password_changed_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'USR-C39E1A159C', 'Super Admin', 'admin@tempestadvertising.com', '$2b$12$i7WtIrUqkeweVIHFqv4GPujTyBN04kCbJSnznURJ56c3evflunLlG', 'SUPER_ADMIN', NULL, NULL, 'ACTIVE', '2026-09-23 11:27:54', NULL, '2026-09-22 15:37:34', '2026-09-23 16:57:54', NULL);

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
  ADD KEY `fk_leads_updated_by` (`updated_by`);

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
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_user_code` (`user_code`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_status` (`status`),
  ADD KEY `idx_users_deleted_at` (`deleted_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `followups`
--
ALTER TABLE `followups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lead_stage_history`
--
ALTER TABLE `lead_stage_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
