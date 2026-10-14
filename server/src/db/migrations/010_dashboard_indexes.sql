-- Dashboard query support; no new tables required.
CREATE INDEX idx_leads_dashboard ON leads (deleted_at, owner_id, created_at);
CREATE INDEX idx_followups_dashboard ON followups (status, due_at, lead_id);
CREATE INDEX idx_meetings_dashboard ON meetings (status, starts_at, lead_id);
