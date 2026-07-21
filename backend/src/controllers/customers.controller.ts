import { Request, Response } from "express";
import { pool } from "../config/db";

// GET /api/customers/me — the logged-in customer's own profile,
// for the "Profile" section of their dashboard.
export async function getMyProfile(req: Request, res: Response) {
  const [rows]: any = await pool.query(
    "SELECT customer_id, first_name, last_name, email, phone, preferred_branch FROM customers WHERE customer_id = ?",
    [req.user!.id]
  );
  res.json(rows[0]);
}

// PUT /api/customers/me — updates the logged-in customer's own details.
export async function updateMyProfile(req: Request, res: Response) {
  const { first_name, last_name, phone, preferred_branch } = req.body;
  await pool.query(
    "UPDATE customers SET first_name = ?, last_name = ?, phone = ?, preferred_branch = ? WHERE customer_id = ?",
    [first_name, last_name, phone, preferred_branch, req.user!.id]
  );
  res.json({ message: "Profile updated." });
}

// GET /api/customers — admin only. Full customer list for admin management.
export async function getAllCustomers(_req: Request, res: Response) {
  const [rows] = await pool.query(
    "SELECT customer_id, first_name, last_name, email, phone, preferred_branch, created_at FROM customers ORDER BY created_at DESC"
  );
  res.json(rows);
}