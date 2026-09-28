/*
|--------------------------------------------------------------------------
| Normalize Lead Stage History
|--------------------------------------------------------------------------
|
| Required fields:
|
| - lead_id
| - previous_stage
| - new_stage
| - reason
| - changed_by
| - created_at
|
*/

ALTER TABLE lead_stage_history
    ADD COLUMN IF NOT EXISTS previous_stage VARCHAR(100) NULL AFTER lead_id,
    ADD COLUMN IF NOT EXISTS new_stage VARCHAR(100) NULL AFTER previous_stage,
    ADD COLUMN IF NOT EXISTS reason TEXT NULL AFTER new_stage,
    ADD COLUMN IF NOT EXISTS changed_by BIGINT UNSIGNED NULL AFTER reason,
    ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;