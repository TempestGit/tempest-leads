
/*
 * Tempest Leads CRM
 * Notification actor attribution
 *
 * Run once on an existing database.
 */

ALTER TABLE notifications
  ADD COLUMN actor_user_id BIGINT UNSIGNED
  NULL AFTER user_id;

ALTER TABLE notifications
  ADD INDEX idx_notifications_actor_user_id (
    actor_user_id
  );

ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_actor
  FOREIGN KEY (actor_user_id)
  REFERENCES users(id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;
