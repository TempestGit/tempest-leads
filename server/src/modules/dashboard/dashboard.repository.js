import pool from "../../config/db.js";

export const getDashboardData = async (user) => {
  // Non-admin users see only leads they own and related records.
  const scope = user.role === "SUPER_ADMIN" ? "" : " AND l.owner_id = ?";
  const params = user.role === "SUPER_ADMIN" ? [] : [user.id];
  const query = async (sql, args = params) => (await pool.query(sql, args))[0];
  const [summary] = await query(`SELECT COUNT(*) AS totalLeads,
    COALESCE(SUM(l.status = 'OPEN'),0) AS activeLeads,
    COALESCE(SUM(l.stage = 'ACTIVE_CLIENT'),0) AS wonLeads,
    COALESCE(SUM(l.stage = 'LOST'),0) AS lostLeads,
    COALESCE(SUM(CASE WHEN l.status = 'OPEN' THEN l.estimated_value_rupees ELSE 0 END),0) AS pipelineValue,
    COALESCE(SUM(l.created_at >= DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-01')),0) AS newThisMonth
    FROM leads l WHERE l.deleted_at IS NULL ${scope}`);
  const stages = await query(`SELECT l.stage AS stage, COUNT(*) AS count,
    COALESCE(SUM(l.estimated_value_rupees),0) AS value
    FROM leads l WHERE l.deleted_at IS NULL ${scope} GROUP BY l.stage ORDER BY count DESC`);
  const [followups] = await query(`SELECT
    COALESCE(SUM(f.status = 'PENDING' AND f.due_at < UTC_TIMESTAMP()),0) AS overdue,
    COALESCE(SUM(f.status = 'PENDING' AND f.due_at >= UTC_TIMESTAMP() AND f.due_at < UTC_TIMESTAMP() + INTERVAL 7 DAY),0) AS upcoming
    FROM followups f JOIN leads l ON l.id = f.lead_id
    WHERE l.deleted_at IS NULL ${scope}`);
  const [meetings] = await query(`SELECT COUNT(*) AS upcoming FROM meetings m
    JOIN leads l ON l.id = m.lead_id WHERE l.deleted_at IS NULL
    AND m.status = 'SCHEDULED' AND m.starts_at >= UTC_TIMESTAMP()
    AND m.starts_at < UTC_TIMESTAMP() + INTERVAL 7 DAY ${scope}`);
  const recentLeads = await query(`SELECT l.id, l.lead_code AS leadCode,
    c.name AS companyName, l.stage, l.estimated_value_rupees AS value, l.created_at AS createdAt
    FROM leads l JOIN companies c ON c.id = l.company_id
    WHERE l.deleted_at IS NULL ${scope} ORDER BY l.created_at DESC LIMIT 6`);
  const nextFollowups = await query(`SELECT f.id, f.lead_id AS leadId, f.action,
    f.due_at AS dueAt, l.lead_code AS leadCode, c.name AS companyName
    FROM followups f JOIN leads l ON l.id = f.lead_id
    JOIN companies c ON c.id = l.company_id
    WHERE l.deleted_at IS NULL AND f.status = 'PENDING' ${scope}
    ORDER BY f.due_at ASC LIMIT 6`);
  const monthly = await query(`SELECT DATE_FORMAT(l.created_at, '%Y-%m') AS month,
    COUNT(*) AS count FROM leads l WHERE l.deleted_at IS NULL
    AND l.created_at >= DATE_FORMAT(UTC_TIMESTAMP() - INTERVAL 5 MONTH, '%Y-%m-01') ${scope}
    GROUP BY DATE_FORMAT(l.created_at, '%Y-%m') ORDER BY month`);
  return { summary, stages, followups, meetings, recentLeads, nextFollowups, monthly };
};
