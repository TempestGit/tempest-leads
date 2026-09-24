import express from "express";
import pool from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      "SELECT NOW() AS database_time"
    );

    res.status(200).json({
      success: true,
      message: "TEMPEST LEADS API is healthy",
      data: {
        api: "ok",
        database: "ok",
        databaseTime: rows[0].database_time,
      },
    });
  })
);

export default router;