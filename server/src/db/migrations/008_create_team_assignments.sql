CREATE TABLE IF NOT EXISTS team_assignments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    lead_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    responsibility VARCHAR(50) NOT NULL,

    assigned_by BIGINT UNSIGNED NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    due_at DATETIME NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_team_assignment_role (
        lead_id,
        responsibility
    ),

    KEY idx_team_assignment_user (
        user_id
    ),

    KEY idx_team_assignment_status (
        status
    ),

    KEY idx_team_assignment_due (
        due_at
    ),

    CONSTRAINT fk_team_assignment_lead
        FOREIGN KEY (lead_id)
        REFERENCES leads(id),

    CONSTRAINT fk_team_assignment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_team_assignment_assigned_by
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
);