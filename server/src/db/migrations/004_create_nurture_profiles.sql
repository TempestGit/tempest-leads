CREATE TABLE IF NOT EXISTS nurture_profiles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    lead_id BIGINT UNSIGNED NOT NULL,

    category ENUM(
        'LATER',
        'NO_RESPONSE',
        'LOST_NOT_INTERESTED',
        'FUTURE_OPPORTUNITY'
    ) NOT NULL DEFAULT 'FUTURE_OPPORTUNITY',

    reason VARCHAR(500) NULL,

    buying_stage VARCHAR(150) NULL,

    communication_status ENUM(
        'NOT_CONTACTED',
        'CONTACTED',
        'ENGAGED',
        'NO_RESPONSE',
        'DO_NOT_CONTACT'
    ) NOT NULL DEFAULT 'NOT_CONTACTED',

    reconnect_at DATETIME NULL,

    entered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by BIGINT UNSIGNED NULL,

    updated_by BIGINT UNSIGNED NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_nurture_profiles_lead (
        lead_id
    ),

    KEY idx_nurture_category (
        category
    ),

    KEY idx_nurture_reconnect (
        reconnect_at
    ),

    KEY idx_nurture_communication (
        communication_status
    ),

    CONSTRAINT fk_nurture_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id),

    CONSTRAINT fk_nurture_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT fk_nurture_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
);