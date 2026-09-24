import pool from "../config/db.js";

export const createAuditLog =
  async ({
    actorUserId,
    entityType,
    entityId,
    action,
    previousValues = null,
    newValues = null,
    metadata = null,
    ipAddress = null,
    userAgent = null,
    connection = pool,
  }) => {
    const serialize = (
      value
    ) => {
      if (
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return JSON.stringify(
        value
      );
    };

    const [result] =
      await connection.query(
        `
          INSERT INTO audit_logs (
            actor_user_id,
            entity_type,
            entity_id,
            action,
            previous_values,
            new_values,
            metadata,
            ip_address,
            user_agent
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `,
        [
          actorUserId ||
            null,

          entityType,

          entityId ||
            null,

          action,

          serialize(
            previousValues
          ),

          serialize(
            newValues
          ),

          serialize(
            metadata
          ),

          ipAddress,

          userAgent,
        ]
      );

    return result.insertId;
  };