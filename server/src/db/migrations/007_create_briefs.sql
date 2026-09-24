CREATE TABLE IF NOT EXISTS briefs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    lead_id BIGINT UNSIGNED NOT NULL,

    business_objective TEXT NULL,
    client_problem TEXT NULL,
    target_audience TEXT NULL,
    campaign_requirement TEXT NULL,
    current_activity TEXT NULL,
    potential_scope TEXT NULL,
    timeline VARCHAR(500) NULL,
    budget VARCHAR(500) NULL,
    decision_maker VARCHAR(500) NULL,
    approval_process TEXT NULL,
    expected_deliverables TEXT NULL,
    client_expectations TEXT NULL,
    competitors TEXT NULL,
    category_insights TEXT NULL,
    mandatory_requirements TEXT NULL,

    status ENUM(
        'DRAFT',
        'AWAITING_CLARIFICATION',
        'READY',
        'APPROVED'
    ) NOT NULL DEFAULT 'DRAFT',

    route_type ENUM(
        'KNOWN_EXISTING',
        'NEW_UNKNOWN'
    ) NULL,

    route_decision_note TEXT NULL,
    route_decided_by BIGINT UNSIGNED NULL,
    route_decided_at DATETIME NULL,

    approved_by BIGINT UNSIGNED NULL,
    approved_at DATETIME NULL,

    created_by BIGINT UNSIGNED NOT NULL,
    updated_by BIGINT UNSIGNED NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_briefs_lead (
        lead_id
    ),

    KEY idx_briefs_status (
        status
    ),

    KEY idx_briefs_route (
        route_type
    ),

    CONSTRAINT fk_briefs_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id),

    CONSTRAINT fk_briefs_route_decided_by
        FOREIGN KEY (route_decided_by)
        REFERENCES users(id),

    CONSTRAINT fk_briefs_approved_by
        FOREIGN KEY (approved_by)
        REFERENCES users(id),

    CONSTRAINT fk_briefs_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT fk_briefs_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
);