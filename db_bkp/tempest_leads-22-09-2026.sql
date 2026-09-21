-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 21, 2026 at 08:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tempest_leads`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED DEFAULT NULL,
  `activity_type` varchar(30) NOT NULL,
  `direction` varchar(20) DEFAULT NULL,
  `subject` varchar(190) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `outcome` varchar(50) DEFAULT NULL,
  `occurred_at` datetime(3) NOT NULL,
  `created_by_user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `lead_id`, `contact_id`, `activity_type`, `direction`, `subject`, `notes`, `outcome`, `occurred_at`, `created_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 4, NULL, 'CALL', 'OUTBOUND', 'Demo', 'Demo Call', 'Connected', '2026-09-21 14:30:00.000', 1, '2026-09-21 17:24:31.357', '2026-09-21 17:24:31.357'),
(2, 1, 3, 'FOLLOW_UP', NULL, 'Follow-up completed', 'Action: Development\n\nOutcome: Spoke with client\n\nSpoke with client..\n\nNext action: Site Visit\n\nNext follow-up (UTC): 2026-09-28 05:00:00.000', NULL, '2026-09-21 17:59:18.057', 1, '2026-09-21 17:59:18.057', '2026-09-21 17:59:18.057');

-- --------------------------------------------------------

--
-- Table structure for table `auth_tokens`
--

CREATE TABLE `auth_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `purpose` enum('PASSWORD_RESET','INVITATION') NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `used_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_code` varchar(50) NOT NULL,
  `name` varchar(190) NOT NULL,
  `normalized_name` varchar(190) NOT NULL,
  `industry` varchar(100) NOT NULL,
  `sub_industry` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `geography` varchar(150) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `existing_agency` varchar(190) DEFAULT NULL,
  `marketing_activity` text DEFAULT NULL,
  `potential_requirement` text DEFAULT NULL,
  `lead_source` varchar(100) DEFAULT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `status` enum('PROSPECT','ACTIVE','INACTIVE') NOT NULL DEFAULT 'PROSPECT',
  `reconnect_date` date DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(10) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `company_code`, `name`, `normalized_name`, `industry`, `sub_industry`, `city`, `geography`, `website`, `existing_agency`, `marketing_activity`, `potential_requirement`, `lead_source`, `owner_id`, `created_by`, `status`, `reconnect_date`, `created_at`, `updated_at`, `version`) VALUES
(2, 'CMP-1b83c65b-a9b3-49d2-9243-dd1cc106fbf4', 'Aster Habitat Demo', 'aster habitat demo', 'Real Estate', NULL, 'Hyderabad', NULL, 'https://example.com', NULL, NULL, NULL, 'Referral', 1, 1, 'PROSPECT', '2026-09-20', '2026-09-20 17:08:34.259', '2026-09-20 17:08:34.259', 1),
(3, 'CMP-787d4c4d-a33d-4c1e-966c-b82af7e82f6e', 'Tempest', 'tempest', 'Advertising', 'Ads', 'Hyderabad', 'Hyderabad', 'https://www.tempestadvertising.com/', 'Advertising', NULL, NULL, 'Tempest Advertising', 1, 1, 'PROSPECT', '2026-09-22', '2026-09-21 07:15:02.479', '2026-09-21 07:16:46.291', 2);

-- --------------------------------------------------------

--
-- Table structure for table `company_change_history`
--

CREATE TABLE `company_change_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `previous_version` int(10) UNSIGNED NOT NULL,
  `new_version` int(10) UNSIGNED NOT NULL,
  `previous_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`previous_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`new_values`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_change_history`
--

INSERT INTO `company_change_history` (`id`, `company_id`, `actor_id`, `previous_version`, `new_version`, `previous_values`, `new_values`, `created_at`) VALUES
(1, 3, 1, 1, 2, '{\"id\":\"3\",\"company_code\":\"CMP-787d4c4d-a33d-4c1e-966c-b82af7e82f6e\",\"name\":\"Tempest\",\"industry\":\"Advertising\",\"sub_industry\":\"Ads\",\"city\":\"Hyderabad\",\"geography\":\"Hyderabad\",\"website\":\"https://www.tempestadvertising.com/\",\"existing_agency\":\"Advertising\",\"marketing_activity\":null,\"potential_requirement\":null,\"lead_source\":\"Tempest Advertising\",\"status\":\"PROSPECT\",\"owner_id\":\"1\",\"created_by\":\"1\",\"version\":1,\"created_at\":\"2026-09-21T07:15:02.479Z\",\"updated_at\":\"2026-09-21T07:15:02.479Z\",\"owner_name\":\"Venu Myakam\",\"created_by_name\":\"Venu Myakam\",\"reconnect_date\":\"2026-09-22\"}', '{\"id\":\"3\",\"company_code\":\"CMP-787d4c4d-a33d-4c1e-966c-b82af7e82f6e\",\"name\":\"Tempest\",\"industry\":\"Advertising\",\"sub_industry\":\"Ads\",\"city\":\"Hyderabad\",\"geography\":\"Hyderabad\",\"website\":\"https://www.tempestadvertising.com/\",\"existing_agency\":\"Advertising\",\"marketing_activity\":null,\"potential_requirement\":null,\"lead_source\":\"Tempest Advertising\",\"status\":\"PROSPECT\",\"owner_id\":\"1\",\"created_by\":\"1\",\"version\":2,\"created_at\":\"2026-09-21T07:15:02.479Z\",\"updated_at\":\"2026-09-21T07:16:46.291Z\",\"owner_name\":\"Venu Myakam\",\"created_by_name\":\"Venu Myakam\",\"reconnect_date\":\"2026-09-22\"}', '2026-09-21 07:16:46.293');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `contact_code` varchar(50) NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `whatsapp` varchar(30) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `linkedin` varchar(500) DEFAULT NULL,
  `decision_maker` tinyint(1) NOT NULL DEFAULT 0,
  `communication_status` enum('UNKNOWN','CONTACTABLE','DO_NOT_CONTACT') NOT NULL DEFAULT 'UNKNOWN',
  `notes` text DEFAULT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(10) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `contact_code`, `company_id`, `name`, `designation`, `department`, `phone`, `whatsapp`, `email`, `linkedin`, `decision_maker`, `communication_status`, `notes`, `owner_id`, `created_by`, `created_at`, `updated_at`, `version`) VALUES
(1, 'CON-29038ecb-6fc5-41f1-a7fa-324e450a4514', 2, 'Sudha', 'Manager', 'Manager', '9123456789', '9123456789', 'sudha@gmail.com', 'https://www.linkedin.com/feed/', 1, 'UNKNOWN', NULL, 1, 1, '2026-09-20 18:35:27.920', '2026-09-20 18:35:27.920', 1),
(2, 'CON-17c46a83-d4ff-4faa-8b9b-e4f7ff05d8e4', 2, 'Venu Tempest', 'Developer', 'Digital', '9133448857', '9133448857', 'venu.m@tempestadvertising.com', 'https://www.linkedin.com/', 0, 'UNKNOWN', NULL, 1, 1, '2026-09-21 07:13:35.917', '2026-09-21 07:13:35.917', 1),
(3, 'CON-71975eba-657f-4639-9a14-a5daac4e98e1', 3, 'Rekha', 'Branch Head', 'Branch Head', '9123456789', '9123456789', 'rekha@tempestadvertising.com', 'https://www.linkedin.com/rekha', 1, 'UNKNOWN', NULL, 1, 1, '2026-09-21 07:16:31.467', '2026-09-21 07:16:31.467', 1);

-- --------------------------------------------------------

--
-- Table structure for table `contact_change_history`
--

CREATE TABLE `contact_change_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `previous_version` int(10) UNSIGNED NOT NULL,
  `new_version` int(10) UNSIGNED NOT NULL,
  `previous_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`previous_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`new_values`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `follow_ups`
--

CREATE TABLE `follow_ups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(500) NOT NULL,
  `due_at` datetime(3) NOT NULL,
  `status` enum('PENDING','COMPLETED','RESCHEDULED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `outcome` varchar(190) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `completed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `previous_follow_up_id` bigint(20) UNSIGNED DEFAULT NULL,
  `version` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `follow_ups`
--

INSERT INTO `follow_ups` (`id`, `lead_id`, `contact_id`, `owner_id`, `created_by`, `action`, `due_at`, `status`, `outcome`, `notes`, `completed_at`, `completed_by`, `previous_follow_up_id`, `version`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 1, 1, 'Development', '2026-09-25 05:30:00.000', 'COMPLETED', 'Spoke with client', 'Spoke with client..', '2026-09-21 17:59:18.057', 1, NULL, 2, '2026-09-21 08:53:40.674', '2026-09-21 17:59:18.057'),
(2, 2, 2, 1, 1, 'Call Client to discuss requirements', '2026-09-30 10:30:00.000', 'PENDING', NULL, NULL, NULL, NULL, NULL, 1, '2026-09-21 10:24:30.098', '2026-09-21 10:24:30.098'),
(4, 4, 3, 1, 1, 'Demo Call', '2026-09-30 06:30:00.000', 'PENDING', NULL, NULL, NULL, NULL, NULL, 1, '2026-09-21 16:53:40.529', '2026-09-21 16:53:40.529'),
(5, 1, 3, 1, 1, 'Site Visit', '2026-09-28 05:00:00.000', 'PENDING', NULL, NULL, NULL, NULL, 1, 1, '2026-09-21 17:59:18.057', '2026-09-21 17:59:18.057');

-- --------------------------------------------------------

--
-- Table structure for table `knex_migrations`
--

CREATE TABLE `knex_migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `knex_migrations`
--

INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES
(1, '001_create_users.js', 1, '2026-09-20 15:55:58'),
(2, '002_create_sessions_and_auth_tokens.js', 1, '2026-09-20 15:55:58'),
(3, '003_create_auth_tokens.js', 1, '2026-09-20 15:55:58'),
(4, '004_create_companies.js', 2, '2026-09-20 16:52:38'),
(5, '005_add_company_version.js', 3, '2026-09-20 17:50:05'),
(6, '006_create_company_change_history.js', 3, '2026-09-20 17:50:05'),
(7, '007_create_contacts.js', 4, '2026-09-20 18:21:59'),
(8, '008_add_contact_edit_history.js', 5, '2026-09-21 06:47:51'),
(9, '009_create_leads.js', 6, '2026-09-21 07:30:55'),
(10, '010_create_lead_creation_requests.js', 7, '2026-09-21 09:16:30'),
(11, '011_create_activities.js', 8, '2026-09-21 16:56:43'),
(12, '012_create_meetings.js', 9, '2026-09-21 18:15:05');

-- --------------------------------------------------------

--
-- Table structure for table `knex_migrations_lock`
--

CREATE TABLE `knex_migrations_lock` (
  `index` int(10) UNSIGNED NOT NULL,
  `is_locked` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `knex_migrations_lock`
--

INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES
(1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_code` varchar(50) NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `primary_contact_id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `potential_requirement` text NOT NULL,
  `opportunity_description` text DEFAULT NULL,
  `service_interest` varchar(190) NOT NULL,
  `lead_source` varchar(100) NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  `stage` varchar(50) NOT NULL DEFAULT 'NEW',
  `status` enum('OPEN','LOST','NURTURE','ACTIVE_CLIENT') NOT NULL DEFAULT 'OPEN',
  `workflow_route` enum('UNDECIDED','KNOWN','NEW') NOT NULL DEFAULT 'UNDECIDED',
  `route_decided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `route_decided_at` datetime(3) DEFAULT NULL,
  `route_decision_note` text DEFAULT NULL,
  `opportunity_value` decimal(15,2) DEFAULT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'INR',
  `next_action` varchar(500) NOT NULL,
  `next_follow_up_at` datetime(3) NOT NULL,
  `last_touch_at` datetime(3) DEFAULT NULL,
  `stage_entered_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `lost_reason` varchar(100) DEFAULT NULL,
  `lost_notes` text DEFAULT NULL,
  `stage_lost` varchar(50) DEFAULT NULL,
  `closed_at` datetime(3) DEFAULT NULL,
  `closed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `version` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `lead_code`, `company_id`, `primary_contact_id`, `owner_id`, `created_by`, `potential_requirement`, `opportunity_description`, `service_interest`, `lead_source`, `priority`, `stage`, `status`, `workflow_route`, `route_decided_by`, `route_decided_at`, `route_decision_note`, `opportunity_value`, `currency`, `next_action`, `next_follow_up_at`, `last_touch_at`, `stage_entered_at`, `lost_reason`, `lost_notes`, `stage_lost`, `closed_at`, `closed_by`, `version`, `created_at`, `updated_at`) VALUES
(1, 'LEAD-216fa5de-9a10-4660-acc2-576796789063', 3, 3, 1, 1, 'Application Development', 'Web Application Development', 'Development', 'LinkedIn', 'HIGH', 'NEW', 'OPEN', 'UNDECIDED', NULL, NULL, NULL, 150000.00, 'INR', 'Site Visit', '2026-09-28 05:00:00.000', '2026-09-21 17:59:18.057', '2026-09-21 08:53:40.669', NULL, NULL, NULL, NULL, NULL, 2, '2026-09-21 08:53:40.669', '2026-09-21 17:59:18.057'),
(2, 'LEAD-3f1e22b2-ae15-4605-9ba3-c536a66cdf2c', 2, 2, 1, 1, 'Test', 'Test', 'Test', 'Tempest Advertising', 'MEDIUM', 'NEW', 'OPEN', 'UNDECIDED', NULL, NULL, NULL, 50000.00, 'INR', 'Call Client to discuss requirements', '2026-09-30 10:30:00.000', NULL, '2026-09-21 10:24:30.088', NULL, NULL, NULL, NULL, NULL, 1, '2026-09-21 10:24:30.088', '2026-09-21 10:24:30.088'),
(4, 'LEAD-4db7d77b-c906-4491-915e-5d43abb76299', 3, 3, 1, 1, 'Demo', 'Demo', 'Demo', 'Demo', 'MEDIUM', 'NEW', 'OPEN', 'UNDECIDED', NULL, NULL, NULL, 120000.00, 'INR', 'Demo Call', '2026-09-30 06:30:00.000', '2026-09-21 14:30:00.000', '2026-09-21 16:53:40.527', NULL, NULL, NULL, NULL, NULL, 2, '2026-09-21 16:53:40.527', '2026-09-21 17:24:31.361');

-- --------------------------------------------------------

--
-- Table structure for table `lead_creation_requests`
--

CREATE TABLE `lead_creation_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `request_key` varchar(36) NOT NULL,
  `payload_hash` varchar(64) NOT NULL,
  `lead_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lead_creation_requests`
--

INSERT INTO `lead_creation_requests` (`id`, `actor_id`, `request_key`, `payload_hash`, `lead_id`, `created_at`) VALUES
(1, 1, '31eac9ed-5ea8-47d7-bd37-46c4a042115c', '9695c5669cd1ad6d9a5acd5965c4baf32417d1561b945be18ebcb1fbee86087a', 2, '2026-09-21 10:24:30.083'),
(5, 1, 'ed5f1807-9ddb-4b8a-86d0-62b60ed519b1', '180601edc2bf3587ad9bf857f7349f5952883700a80440a894ad114cdb55f080', 4, '2026-09-21 16:53:40.522');

-- --------------------------------------------------------

--
-- Table structure for table `lead_stage_history`
--

CREATE TABLE `lead_stage_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `previous_stage` varchar(50) DEFAULT NULL,
  `new_stage` varchar(50) NOT NULL,
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `reason` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lead_stage_history`
--

INSERT INTO `lead_stage_history` (`id`, `lead_id`, `previous_stage`, `new_stage`, `actor_id`, `reason`, `created_at`) VALUES
(1, 1, NULL, 'NEW', 1, 'Lead created.', '2026-09-21 08:53:40.673'),
(2, 2, NULL, 'NEW', 1, 'Lead created.', '2026-09-21 10:24:30.096'),
(4, 4, NULL, 'NEW', 1, 'Lead created.', '2026-09-21 16:53:40.528');

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `meeting_code` varchar(50) NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(190) NOT NULL,
  `meeting_type` enum('IN_PERSON','VIDEO_CALL','PHONE_CALL') NOT NULL,
  `starts_at` datetime(3) NOT NULL,
  `ends_at` datetime(3) NOT NULL,
  `location` varchar(500) DEFAULT NULL,
  `meeting_url` varchar(2000) DEFAULT NULL,
  `agenda` text DEFAULT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `status` enum('SCHEDULED','COMPLETED','RESCHEDULED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
  `notes` text DEFAULT NULL,
  `outcome` varchar(190) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `completed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status_reason` text DEFAULT NULL,
  `status_changed_at` datetime(3) DEFAULT NULL,
  `status_changed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `previous_meeting_id` bigint(20) UNSIGNED DEFAULT NULL,
  `completion_activity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `next_follow_up_id` bigint(20) UNSIGNED DEFAULT NULL,
  `version` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_history`
--

CREATE TABLE `meeting_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `meeting_id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `action` enum('CREATED','UPDATED','RESCHEDULED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL,
  `reason` text NOT NULL,
  `previous_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`previous_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`new_values`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_participants`
--

CREATE TABLE `meeting_participants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `meeting_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `contact_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name_snapshot` varchar(190) NOT NULL,
  `email_snapshot` varchar(190) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `sid` varchar(128) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `data` longtext NOT NULL CHECK (json_valid(`data`)),
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`sid`, `user_id`, `data`, `expires_at`, `created_at`, `updated_at`) VALUES
('-JLAc76ASsMIqxPunpOcrfqpyCArqHWr', NULL, '{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-09-21T00:42:03.222Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"csrfToken\":\"66b7d2e5d6d49596c2c10056882098205895daf454528579a5bffaa073353224\"}', '2026-09-21 00:42:03.222', '2026-09-20 16:42:03.223', '2026-09-20 16:42:03.223'),
('2E1Q0eWxlJQHIKk_t87Jf3HY9w2TKC6H', NULL, '{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-09-21T13:48:11.521Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"csrfToken\":\"322428c764c0a42a98658f3e39092eacf7d3eacc2d56c8d792917757a2750314\"}', '2026-09-21 13:48:11.521', '2026-09-21 05:48:11.522', '2026-09-21 05:48:11.522'),
('AILScv9MtkFbDrH1OlYLonl3mz0_O6Kq', NULL, '{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-09-21T01:27:54.382Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"csrfToken\":\"33551ba7199206a6ee643480d248d45d29187689ac4231bb4732b82e0768ddee\"}', '2026-09-21 01:27:54.382', '2026-09-20 17:27:54.385', '2026-09-20 17:27:54.385'),
('H2iD7GqnZa5dljLRIHgUtQu-FhsRT3BN', 1, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-09-28T16:49:27.056Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":\"1\",\"sessionVersion\":1,\"csrfToken\":\"212d0fc25c153577a44bc3b9a13cac1cb771471070c25a3021c26e02387cfed4\"}', '2026-09-28 18:55:26.841', '2026-09-21 16:49:27.058', '2026-09-21 18:55:26.843'),
('HdKUtCVUfFm5g5JaKk2wEt9ySBXGz3Yz', NULL, '{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-09-21T14:40:18.649Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"csrfToken\":\"6883cff48ee33e0dc50eca0fce1ae9333f3f2cf6c8f1007c56a6f8c9f0284f89\"}', '2026-09-21 14:40:18.649', '2026-09-21 06:40:18.650', '2026-09-21 06:40:18.650'),
('I3Sqkfa1dI2wyeOu49oNwzICL8AfXRMc', 1, '{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-09-21T02:03:03.379Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":\"1\",\"sessionVersion\":1,\"csrfToken\":\"b50713830f887aae9386e9ca1bc16dd896a3c2770f3791347f909f9f6d8152d3\"}', '2026-09-21 02:36:33.280', '2026-09-20 18:03:03.379', '2026-09-20 18:36:33.280'),
('L-9DVdly8gAi6JPMQJuYBVvQPgm_3dbt', 1, '{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-09-21T14:40:21.766Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":\"1\",\"sessionVersion\":1,\"csrfToken\":\"305ef084e3ddafd68f54dbd6f74fcf7d79a90394662d1527c1ec21f81c69ff0e\"}', '2026-09-21 18:26:41.220', '2026-09-21 06:40:21.766', '2026-09-21 10:26:41.221'),
('ZSjYaacuEsstEFucz3tk-9CBveKZLgZl', NULL, '{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-09-22T00:49:09.928Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"csrfToken\":\"51332b827b27aa0c3e0fa6b0962f29f94e664878f2a10562eb22b875dc13585d\"}', '2026-09-22 00:49:09.928', '2026-09-21 16:49:09.939', '2026-09-21 16:49:09.939'),
('zakX840UHIvNnpd6G7FJfHEW83_wDqt6', NULL, '{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-09-21T01:23:11.629Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"csrfToken\":\"a5b32be435eb1a83ae64a4861313a783f8994ba1028b614c74c27902d86fdb94\"}', '2026-09-21 01:23:11.629', '2026-09-20 17:23:11.631', '2026-09-20 17:23:11.631');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `role` enum('SUPER_ADMIN','OWNER') NOT NULL DEFAULT 'OWNER',
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `session_version` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `last_login_at` datetime(3) DEFAULT NULL,
  `password_changed_at` datetime(3) DEFAULT NULL,
  `deactivated_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `employee_id`, `department`, `location`, `role`, `status`, `session_version`, `last_login_at`, `password_changed_at`, `deactivated_at`, `created_at`, `updated_at`) VALUES
(1, 'Venu Myakam', 'venu.m@tempestadvertising.com', '$argon2id$v=19$m=65536,p=1,t=3$9HpuY9AjQaxjs8mCwYfb/g$eUztamOH2RsfEcW2usj+vOiMnyFQny4IS2WWeOj+xKM', NULL, NULL, NULL, NULL, 'SUPER_ADMIN', 'ACTIVE', 1, '2026-09-21 16:49:27.055', '2026-09-20 16:04:43.212', NULL, '2026-09-20 16:04:43.212', '2026-09-21 16:49:27.055');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activities_lead_occurred_index` (`lead_id`,`occurred_at`),
  ADD KEY `activities_contact_index` (`contact_id`),
  ADD KEY `activities_created_by_index` (`created_by_user_id`),
  ADD KEY `activities_type_index` (`activity_type`),
  ADD KEY `activities_occurred_index` (`occurred_at`);

--
-- Indexes for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_tokens_token_hash_unique` (`token_hash`),
  ADD KEY `auth_tokens_user_purpose_index` (`user_id`,`purpose`),
  ADD KEY `auth_tokens_expiry_index` (`expires_at`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `companies_company_code_unique` (`company_code`),
  ADD UNIQUE KEY `companies_normalized_name_unique` (`normalized_name`),
  ADD KEY `companies_created_by_foreign` (`created_by`),
  ADD KEY `companies_owner_id_id_index` (`owner_id`,`id`),
  ADD KEY `companies_industry_index` (`industry`);

--
-- Indexes for table `company_change_history`
--
ALTER TABLE `company_change_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_change_history_actor_id_foreign` (`actor_id`),
  ADD KEY `company_change_history_company_id_id_index` (`company_id`,`id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `contacts_contact_code_unique` (`contact_code`),
  ADD KEY `contacts_created_by_foreign` (`created_by`),
  ADD KEY `contacts_company_id_id_index` (`company_id`,`id`),
  ADD KEY `contacts_owner_id_id_index` (`owner_id`,`id`),
  ADD KEY `contacts_email_index` (`email`);

--
-- Indexes for table `contact_change_history`
--
ALTER TABLE `contact_change_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_change_history_contact_id_id_index` (`contact_id`,`id`),
  ADD KEY `contact_change_history_actor_id_index` (`actor_id`);

--
-- Indexes for table `follow_ups`
--
ALTER TABLE `follow_ups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `follow_ups_previous_follow_up_id_unique` (`previous_follow_up_id`),
  ADD KEY `follow_ups_contact_id_foreign` (`contact_id`),
  ADD KEY `follow_ups_created_by_foreign` (`created_by`),
  ADD KEY `follow_ups_completed_by_foreign` (`completed_by`),
  ADD KEY `follow_ups_lead_status_due_index` (`lead_id`,`status`,`due_at`),
  ADD KEY `follow_ups_owner_status_due_index` (`owner_id`,`status`,`due_at`);

--
-- Indexes for table `knex_migrations`
--
ALTER TABLE `knex_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  ADD PRIMARY KEY (`index`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `leads_lead_code_unique` (`lead_code`),
  ADD KEY `leads_primary_contact_id_foreign` (`primary_contact_id`),
  ADD KEY `leads_created_by_foreign` (`created_by`),
  ADD KEY `leads_route_decided_by_foreign` (`route_decided_by`),
  ADD KEY `leads_closed_by_foreign` (`closed_by`),
  ADD KEY `leads_owner_status_follow_up_index` (`owner_id`,`status`,`next_follow_up_at`),
  ADD KEY `leads_company_id_index` (`company_id`,`id`),
  ADD KEY `leads_stage_status_index` (`stage`,`status`),
  ADD KEY `leads_status_follow_up_index` (`status`,`next_follow_up_at`);

--
-- Indexes for table `lead_creation_requests`
--
ALTER TABLE `lead_creation_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_creation_requests_actor_key_unique` (`actor_id`,`request_key`),
  ADD KEY `lead_creation_requests_lead_id_foreign` (`lead_id`);

--
-- Indexes for table `lead_stage_history`
--
ALTER TABLE `lead_stage_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_stage_history_actor_id_foreign` (`actor_id`),
  ADD KEY `lead_stage_history_lead_id_index` (`lead_id`,`id`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `meetings_meeting_code_unique` (`meeting_code`),
  ADD UNIQUE KEY `meetings_previous_meeting_id_unique` (`previous_meeting_id`),
  ADD UNIQUE KEY `meetings_completion_activity_id_unique` (`completion_activity_id`),
  ADD UNIQUE KEY `meetings_next_follow_up_id_unique` (`next_follow_up_id`),
  ADD KEY `meetings_contact_id_foreign` (`contact_id`),
  ADD KEY `meetings_created_by_foreign` (`created_by`),
  ADD KEY `meetings_completed_by_foreign` (`completed_by`),
  ADD KEY `meetings_status_changed_by_foreign` (`status_changed_by`),
  ADD KEY `meetings_lead_start_index` (`lead_id`,`starts_at`,`id`),
  ADD KEY `meetings_owner_status_start_index` (`owner_id`,`status`,`starts_at`),
  ADD KEY `meetings_status_start_index` (`status`,`starts_at`);

--
-- Indexes for table `meeting_history`
--
ALTER TABLE `meeting_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meeting_history_actor_id_foreign` (`actor_id`),
  ADD KEY `meeting_history_meeting_index` (`meeting_id`,`id`);

--
-- Indexes for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `meeting_participants_user_unique` (`meeting_id`,`user_id`),
  ADD UNIQUE KEY `meeting_participants_contact_unique` (`meeting_id`,`contact_id`),
  ADD KEY `meeting_participants_user_id_foreign` (`user_id`),
  ADD KEY `meeting_participants_contact_id_foreign` (`contact_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sid`),
  ADD KEY `sessions_expiry_index` (`expires_at`),
  ADD KEY `sessions_user_index` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_employee_id_unique` (`employee_id`),
  ADD KEY `users_status_role_index` (`status`,`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `company_change_history`
--
ALTER TABLE `company_change_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `contact_change_history`
--
ALTER TABLE `contact_change_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `follow_ups`
--
ALTER TABLE `follow_ups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `knex_migrations`
--
ALTER TABLE `knex_migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  MODIFY `index` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lead_creation_requests`
--
ALTER TABLE `lead_creation_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `lead_stage_history`
--
ALTER TABLE `lead_stage_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_history`
--
ALTER TABLE `meeting_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `activities_contact_id_foreign` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activities_created_by_user_id_foreign` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `activities_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `auth_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `companies_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `company_change_history`
--
ALTER TABLE `company_change_history`
  ADD CONSTRAINT `company_change_history_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `company_change_history_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `contacts_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `contacts_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `contact_change_history`
--
ALTER TABLE `contact_change_history`
  ADD CONSTRAINT `contact_change_history_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `contact_change_history_contact_id_foreign` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`);

--
-- Constraints for table `follow_ups`
--
ALTER TABLE `follow_ups`
  ADD CONSTRAINT `follow_ups_completed_by_foreign` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `follow_ups_contact_id_foreign` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  ADD CONSTRAINT `follow_ups_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `follow_ups_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  ADD CONSTRAINT `follow_ups_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `follow_ups_previous_follow_up_id_foreign` FOREIGN KEY (`previous_follow_up_id`) REFERENCES `follow_ups` (`id`);

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `leads_closed_by_foreign` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `leads_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `leads_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `leads_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `leads_primary_contact_id_foreign` FOREIGN KEY (`primary_contact_id`) REFERENCES `contacts` (`id`),
  ADD CONSTRAINT `leads_route_decided_by_foreign` FOREIGN KEY (`route_decided_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `lead_creation_requests`
--
ALTER TABLE `lead_creation_requests`
  ADD CONSTRAINT `lead_creation_requests_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `lead_creation_requests_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`);

--
-- Constraints for table `lead_stage_history`
--
ALTER TABLE `lead_stage_history`
  ADD CONSTRAINT `lead_stage_history_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `lead_stage_history_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`);

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_completed_by_foreign` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `meetings_completion_activity_id_foreign` FOREIGN KEY (`completion_activity_id`) REFERENCES `activities` (`id`),
  ADD CONSTRAINT `meetings_contact_id_foreign` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  ADD CONSTRAINT `meetings_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `meetings_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  ADD CONSTRAINT `meetings_next_follow_up_id_foreign` FOREIGN KEY (`next_follow_up_id`) REFERENCES `follow_ups` (`id`),
  ADD CONSTRAINT `meetings_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `meetings_previous_meeting_id_foreign` FOREIGN KEY (`previous_meeting_id`) REFERENCES `meetings` (`id`),
  ADD CONSTRAINT `meetings_status_changed_by_foreign` FOREIGN KEY (`status_changed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `meeting_history`
--
ALTER TABLE `meeting_history`
  ADD CONSTRAINT `meeting_history_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `meeting_history_meeting_id_foreign` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`);

--
-- Constraints for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  ADD CONSTRAINT `meeting_participants_contact_id_foreign` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  ADD CONSTRAINT `meeting_participants_meeting_id_foreign` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`),
  ADD CONSTRAINT `meeting_participants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
