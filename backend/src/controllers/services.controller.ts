import { Request, Response } from "express";
import { pool } from "../config/db";

// GET /api/services — public list of everything the business offers
// (Repainting, Mechanical Repairs, Bodywork, Upgrades). Powers the
// Services page and the Home page Services section.
export async function getServices(_req: Request, res: Response) {
  const [rows] = await pool.query("SELECT * FROM services ORDER BY category, name");
  res.json(rows);
}

export async function getServiceById(req: Request, res: Response) {
  const [rows]: any = await pool.query("SELECT * FROM services WHERE service_id = ?", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: "Service not found." });
  res.json(rows[0]);
}

// POST /api/services — admin only. Adds a new service type.
export async function createService(req: Request, res: Response) {
  const { name, category, description, branch_availability, estimated_price_min, estimated_price_max } = req.body;
  const [result]: any = await pool.query(
    "INSERT INTO services (name, category, description, branch_availability, estimated_price_min, estimated_price_max) VALUES (?, ?, ?, ?, ?, ?)",
    [name, category, description, branch_availability ?? "both", estimated_price_min, estimated_price_max]
  );
  res.status(201).json({ service_id: result.insertId });
}

// PUT /api/services/:id — admin only. Edits pricing/description.
export async function updateService(req: Request, res: Response) {
  const { name, category, description, branch_availability, estimated_price_min, estimated_price_max } = req.body;
  await pool.query(
    "UPDATE services SET name = ?, category = ?, description = ?, branch_availability = ?, estimated_price_min = ?, estimated_price_max = ? WHERE service_id = ?",
    [name, category, description, branch_availability, estimated_price_min, estimated_price_max, req.params.id]
  );
  res.json({ message: "Service updated." });
}

// DELETE /api/services/:id — admin only.
export async function deleteService(req: Request, res: Response) {
  await pool.query("DELETE FROM services WHERE service_id = ?", [req.params.id]);
  res.json({ message: "Service removed." });
}