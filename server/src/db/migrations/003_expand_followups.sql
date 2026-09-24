ALTER TABLE followups
    ADD COLUMN outcome VARCHAR(500) NULL AFTER notes,
    ADD COLUMN completed_by BIGINT UNSIGNED NULL AFTER completed_at,
    ADD COLUMN successor_followup_id BIGINT UNSIGNED NULL AFTER completed_by,
    ADD COLUMN status_reason TEXT NULL AFTER successor_followup_id;