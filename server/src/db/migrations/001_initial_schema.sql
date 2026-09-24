/*
|--------------------------------------------------------------------------
| TEMPEST LEADS - Initial Database Schema
|--------------------------------------------------------------------------
|
| Core CRM entities:
|
| users
| refresh_tokens
| password_reset_tokens
| companies
| contacts
| leads
| lead_stage_history
| activities
| meetings
| followups
| notifications
| audit_logs
|
*/

SET NAMES utf8mb4;


/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_code VARCHAR(32) NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(190) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(50) NOT NULL DEFAULT 'OWNER',

    department VARCHAR(120) DEFAULT NULL,

    location VARCHAR(120) DEFAULT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    last_login_at DATETIME DEFAULT NULL,

    password_changed_at DATETIME DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    deleted_at DATETIME DEFAULT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uq_users_user_code (user_code),

    UNIQUE KEY uq_users_email (email),

    KEY idx_users_role (role),

    KEY idx_users_status (status),

    KEY idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| REFRESH TOKENS
|--------------------------------------------------------------------------
|
| Never store raw refresh tokens.
| Store only SHA-256 hashes.
|
*/

CREATE TABLE refresh_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NOT NULL,

    token_hash CHAR(64) NOT NULL,

    expires_at DATETIME NOT NULL,

    revoked_at DATETIME DEFAULT NULL,

    replaced_by_token_id BIGINT UNSIGNED DEFAULT NULL,

    created_ip VARCHAR(64) DEFAULT NULL,

    user_agent VARCHAR(500) DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_refresh_tokens_hash (token_hash),

    KEY idx_refresh_tokens_user_id (user_id),

    KEY idx_refresh_tokens_expires_at (expires_at),

    KEY idx_refresh_tokens_revoked_at (revoked_at),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_refresh_tokens_replacement
        FOREIGN KEY (replaced_by_token_id)
        REFERENCES refresh_tokens(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| PASSWORD RESET TOKENS
|--------------------------------------------------------------------------
*/

CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NOT NULL,

    token_hash CHAR(64) NOT NULL,

    expires_at DATETIME NOT NULL,

    used_at DATETIME DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_password_reset_token_hash (token_hash),

    KEY idx_password_reset_user_id (user_id),

    KEY idx_password_reset_expires_at (expires_at),

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| COMPANIES
|--------------------------------------------------------------------------
|
| Prototype fields include:
|
| name
| industry
| city
| website
| agency relationship
| source
| status
|
*/

CREATE TABLE companies (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    company_code VARCHAR(32) NOT NULL,

    name VARCHAR(190) NOT NULL,

    industry VARCHAR(120) DEFAULT NULL,

    city VARCHAR(120) DEFAULT NULL,

    state VARCHAR(120) DEFAULT NULL,

    country VARCHAR(120) DEFAULT 'India',

    website VARCHAR(500) DEFAULT NULL,

    agency_relationship VARCHAR(255) DEFAULT NULL,

    source VARCHAR(120) DEFAULT NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',

    notes TEXT DEFAULT NULL,

    created_by BIGINT UNSIGNED DEFAULT NULL,

    updated_by BIGINT UNSIGNED DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    deleted_at DATETIME DEFAULT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uq_companies_company_code (company_code),

    KEY idx_companies_name (name),

    KEY idx_companies_industry (industry),

    KEY idx_companies_city (city),

    KEY idx_companies_status (status),

    KEY idx_companies_deleted_at (deleted_at),

    CONSTRAINT fk_companies_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_companies_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| CONTACTS
|--------------------------------------------------------------------------
*/

CREATE TABLE contacts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    contact_code VARCHAR(32) NOT NULL,

    company_id BIGINT UNSIGNED NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    designation VARCHAR(150) DEFAULT NULL,

    phone VARCHAR(30) DEFAULT NULL,

    email VARCHAR(190) DEFAULT NULL,

    is_decision_maker TINYINT(1) NOT NULL DEFAULT 0,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    notes TEXT DEFAULT NULL,

    created_by BIGINT UNSIGNED DEFAULT NULL,

    updated_by BIGINT UNSIGNED DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    deleted_at DATETIME DEFAULT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uq_contacts_contact_code (contact_code),

    KEY idx_contacts_company_id (company_id),

    KEY idx_contacts_email (email),

    KEY idx_contacts_phone (phone),

    KEY idx_contacts_name (full_name),

    KEY idx_contacts_status (status),

    CONSTRAINT fk_contacts_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_contacts_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_contacts_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| LEADS
|--------------------------------------------------------------------------
|
| Stage values will initially include:
|
| NEW
| CONTACT_RESEARCH
| CONNECTED
| MEETING
| BRIEF
| PITCH
| COMMERCIALS
| CONTRACT_PO
| ONBOARDING
| ACTIVE_CLIENT
| LOST
| NURTURE
|
*/

CREATE TABLE leads (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    lead_code VARCHAR(32) NOT NULL,

    company_id BIGINT UNSIGNED NOT NULL,

    primary_contact_id BIGINT UNSIGNED DEFAULT NULL,

    owner_id BIGINT UNSIGNED NOT NULL,

    stage VARCHAR(50) NOT NULL DEFAULT 'NEW',

    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',

    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',

    source VARCHAR(120) DEFAULT NULL,

    service_required VARCHAR(255) DEFAULT NULL,

    estimated_value_paise BIGINT UNSIGNED NOT NULL DEFAULT 0,

    next_action VARCHAR(500) DEFAULT NULL,

    follow_up_at DATETIME DEFAULT NULL,

    last_touch_at DATETIME DEFAULT NULL,

    known_relationship TINYINT(1) NOT NULL DEFAULT 0,

    lifecycle_reason VARCHAR(500) DEFAULT NULL,

    notes TEXT DEFAULT NULL,

    created_by BIGINT UNSIGNED DEFAULT NULL,

    updated_by BIGINT UNSIGNED DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    deleted_at DATETIME DEFAULT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uq_leads_lead_code (lead_code),

    KEY idx_leads_company_id (company_id),

    KEY idx_leads_primary_contact_id (primary_contact_id),

    KEY idx_leads_owner_id (owner_id),

    KEY idx_leads_stage (stage),

    KEY idx_leads_status (status),

    KEY idx_leads_priority (priority),

    KEY idx_leads_source (source),

    KEY idx_leads_follow_up_at (follow_up_at),

    KEY idx_leads_last_touch_at (last_touch_at),

    KEY idx_leads_deleted_at (deleted_at),

    KEY idx_leads_owner_stage (
        owner_id,
        stage
    ),

    KEY idx_leads_owner_follow_up (
        owner_id,
        follow_up_at
    ),

    CONSTRAINT fk_leads_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_leads_primary_contact
        FOREIGN KEY (primary_contact_id)
        REFERENCES contacts(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_leads_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_leads_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_leads_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| LEAD STAGE HISTORY
|--------------------------------------------------------------------------
|
| Never rely only on leads.stage.
|
| Every stage transition will create a history record.
|
*/

CREATE TABLE lead_stage_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    lead_id BIGINT UNSIGNED NOT NULL,

    from_stage VARCHAR(50) DEFAULT NULL,

    to_stage VARCHAR(50) NOT NULL,

    changed_by BIGINT UNSIGNED NOT NULL,

    reason VARCHAR(500) DEFAULT NULL,

    metadata JSON DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_stage_history_lead_id (lead_id),

    KEY idx_stage_history_changed_by (changed_by),

    KEY idx_stage_history_created_at (created_at),

    CONSTRAINT fk_stage_history_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_stage_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| ACTIVITIES
|--------------------------------------------------------------------------
|
| Examples:
|
| CALL
| EMAIL
| MEETING
| PITCH
| COMMERCIAL_DISCUSSION
| NOTE
| STAGE_CHANGE
|
*/

CREATE TABLE activities (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    lead_id BIGINT UNSIGNED NOT NULL,

    activity_type VARCHAR(80) NOT NULL,

    outcome VARCHAR(500) DEFAULT NULL,

    notes TEXT DEFAULT NULL,

    occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by BIGINT UNSIGNED NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_activities_lead_id (lead_id),

    KEY idx_activities_type (activity_type),

    KEY idx_activities_occurred_at (occurred_at),

    KEY idx_activities_created_by (created_by),

    CONSTRAINT fk_activities_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_activities_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| MEETINGS
|--------------------------------------------------------------------------
*/

CREATE TABLE meetings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    meeting_code VARCHAR(32) NOT NULL,

    lead_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(255) NOT NULL,

    starts_at DATETIME NOT NULL,

    ends_at DATETIME DEFAULT NULL,

    meeting_type VARCHAR(50) NOT NULL DEFAULT 'VIDEO_CALL',

    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',

    meeting_url VARCHAR(500) DEFAULT NULL,

    location VARCHAR(500) DEFAULT NULL,

    notes TEXT DEFAULT NULL,

    outcome TEXT DEFAULT NULL,

    created_by BIGINT UNSIGNED NOT NULL,

    updated_by BIGINT UNSIGNED DEFAULT NULL,

    completed_at DATETIME DEFAULT NULL,

    cancelled_at DATETIME DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_meetings_meeting_code (meeting_code),

    KEY idx_meetings_lead_id (lead_id),

    KEY idx_meetings_starts_at (starts_at),

    KEY idx_meetings_status (status),

    KEY idx_meetings_created_by (created_by),

    CONSTRAINT fk_meetings_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_meetings_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_meetings_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| FOLLOW UPS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Don't store:
|
| "Due today"
| "Overdue"
| "Upcoming"
|
| Those values are derived from due_at.
|
| Persist only the actual lifecycle status:
|
| PENDING
| COMPLETED
| CANCELLED
|
*/

CREATE TABLE followups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    followup_code VARCHAR(32) NOT NULL,

    lead_id BIGINT UNSIGNED NOT NULL,

    assigned_to BIGINT UNSIGNED NOT NULL,

    action VARCHAR(500) NOT NULL,

    due_at DATETIME NOT NULL,

    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    notes TEXT DEFAULT NULL,

    completed_at DATETIME DEFAULT NULL,

    created_by BIGINT UNSIGNED NOT NULL,

    updated_by BIGINT UNSIGNED DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_followups_followup_code (followup_code),

    KEY idx_followups_lead_id (lead_id),

    KEY idx_followups_assigned_to (assigned_to),

    KEY idx_followups_due_at (due_at),

    KEY idx_followups_status (status),

    KEY idx_followups_priority (priority),

    KEY idx_followups_assignee_status_due (
        assigned_to,
        status,
        due_at
    ),

    CONSTRAINT fk_followups_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_followups_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_followups_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_followups_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
|
| Unread state is:
|
| read_at IS NULL
|
*/

CREATE TABLE notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NOT NULL,

    lead_id BIGINT UNSIGNED DEFAULT NULL,

    notification_type VARCHAR(80) NOT NULL,

    title VARCHAR(255) NOT NULL,

    message VARCHAR(1000) NOT NULL,

    action_url VARCHAR(500) DEFAULT NULL,

    read_at DATETIME DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_notifications_user_id (user_id),

    KEY idx_notifications_lead_id (lead_id),

    KEY idx_notifications_read_at (read_at),

    KEY idx_notifications_created_at (created_at),

    KEY idx_notifications_user_read (
        user_id,
        read_at
    ),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| AUDIT LOG
|--------------------------------------------------------------------------
|
| Audit records should be append-only.
|
*/

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    actor_user_id BIGINT UNSIGNED DEFAULT NULL,

    entity_type VARCHAR(80) NOT NULL,

    entity_id BIGINT UNSIGNED DEFAULT NULL,

    action VARCHAR(120) NOT NULL,

    previous_values JSON DEFAULT NULL,

    new_values JSON DEFAULT NULL,

    metadata JSON DEFAULT NULL,

    ip_address VARCHAR(64) DEFAULT NULL,

    user_agent VARCHAR(500) DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_audit_actor_user_id (actor_user_id),

    KEY idx_audit_entity (
        entity_type,
        entity_id
    ),

    KEY idx_audit_action (action),

    KEY idx_audit_created_at (created_at),

    CONSTRAINT fk_audit_actor
        FOREIGN KEY (actor_user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;