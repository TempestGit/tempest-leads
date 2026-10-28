CREATE TABLE IF NOT EXISTS notification_reminder_deliveries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    reminder_type VARCHAR(80) NOT NULL,

    entity_id BIGINT UNSIGNED NOT NULL,

    recipient_user_id BIGINT UNSIGNED NOT NULL,

    scheduled_for DATETIME NOT NULL,

    notification_id BIGINT UNSIGNED DEFAULT NULL,

    created_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_reminder_delivery (
        reminder_type,
        entity_id,
        recipient_user_id,
        scheduled_for
    ),

    KEY idx_reminder_entity (
        reminder_type,
        entity_id
    ),

    KEY idx_reminder_recipient (
        recipient_user_id
    ),

    CONSTRAINT fk_reminder_delivery_user
        FOREIGN KEY (recipient_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reminder_delivery_notification
        FOREIGN KEY (notification_id)
        REFERENCES notifications(id)
        ON DELETE SET NULL
);