/*
|--------------------------------------------------------------------------
| Branches
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS branches (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    code VARCHAR(30) NOT NULL,

    name VARCHAR(100) NOT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_branches_code (code),

    UNIQUE KEY uq_branches_name (name)
);

/*
|--------------------------------------------------------------------------
| Seed Tempest Branches
|--------------------------------------------------------------------------
*/

INSERT IGNORE INTO branches (
    code,
    name
)
VALUES
    ('HYDERABAD', 'Hyderabad'),
    ('PUNE', 'Pune'),
    ('BANGALORE', 'Bangalore'),
    ('MUMBAI', 'Mumbai');

/*
|--------------------------------------------------------------------------
| Users Home Branch
|--------------------------------------------------------------------------
*/

ALTER TABLE users
ADD COLUMN branch_id BIGINT UNSIGNED NULL;

ALTER TABLE users
ADD KEY idx_users_branch (
    branch_id
);

ALTER TABLE users
ADD CONSTRAINT fk_users_branch
FOREIGN KEY (
    branch_id
)
REFERENCES branches(id);

/*
|--------------------------------------------------------------------------
| Lead Primary Branch
|--------------------------------------------------------------------------
*/

ALTER TABLE leads
ADD COLUMN branch_id BIGINT UNSIGNED NULL;

ALTER TABLE leads
ADD KEY idx_leads_branch (
    branch_id
);

ALTER TABLE leads
ADD CONSTRAINT fk_leads_branch
FOREIGN KEY (
    branch_id
)
REFERENCES branches(id);

/*
|--------------------------------------------------------------------------
| Assignment Branch Snapshot
|--------------------------------------------------------------------------
*/

ALTER TABLE team_assignments
ADD COLUMN member_branch_id BIGINT UNSIGNED NULL
AFTER user_id;

ALTER TABLE team_assignments
ADD COLUMN is_cross_branch TINYINT(1) NOT NULL DEFAULT 0
AFTER member_branch_id;

ALTER TABLE team_assignments
ADD KEY idx_team_assignment_member_branch (
    member_branch_id
);

ALTER TABLE team_assignments
ADD CONSTRAINT fk_team_assignment_member_branch
FOREIGN KEY (
    member_branch_id
)
REFERENCES branches(id);