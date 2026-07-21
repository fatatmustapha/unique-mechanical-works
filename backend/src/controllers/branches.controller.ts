import { Request, Response } from "express";
import { pool } from "../config/db";

// GET /api/branches — both branches (Kano and Abuja). Powers the
// footer, the branch picker on Book Appointment, and location filters
// on Cars for Sale.
export async function getBranches(_req: Request, res: Response) {
  const [rows] = await pool.query("SELECT * FROM branches ORDER BY branch_id");
  res.json(rows);
}

// GET /api/branches/:id — single branch detail, e.g. for an About Us branch card.
export async function getBranchById(req: Request, res: Response) {
  const [rows]: any = await pool.query("SELECT * FROM branches WHERE branch_id = ?", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: "Branch not found." });
  res.json(rows[0]);
}