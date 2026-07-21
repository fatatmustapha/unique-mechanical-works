import { Request, Response } from "express";
import { pool } from "../config/db";

// POST /api/appointments — a logged-in customer books an appointment:
// branch + service + date/time. Always starts "pending" until the branch confirms it.
export async function createAppointment(req: Request, res: Response) {
  const { service_id, branch_id, appointment_date, appointment_time } = req.body;
  const [result]: any = await pool.query(
    "INSERT INTO appointments (customer_id, service_id, branch_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?, ?)",
    [req.user!.id, service_id, branch_id, appointment_date, appointment_time]
  );
  res.status(201).json({ appointment_id: result.insertId });
}

// GET /api/appointments/mine — a customer's own upcoming/past appointments, for their dashboard.
export async function getMyAppointments(req: Request, res: Response) {
  const [rows] = await pool.query(
    `SELECT a.*, s.name AS service_name, b.name AS branch_name
     FROM appointments a
     JOIN services s ON s.service_id = a.service_id
     JOIN branches b ON b.branch_id = a.branch_id
     WHERE a.customer_id = ? ORDER BY a.appointment_date DESC`,
    [req.user!.id]
  );
  res.json(rows);
}

// GET /api/appointments — admin only. All appointments, for the admin's
// calendar view. ?branch_id=1&status=pending to filter.
export async function getAllAppointments(req: Request, res: Response) {
  const { branch_id, status } = req.query;
  const conditions: string[] = [];
  const params: any[] = [];
  if (branch_id) { conditions.push("branch_id = ?"); params.push(branch_id); }
  if (status) { conditions.push("status = ?"); params.push(status); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT * FROM appointments ${where} ORDER BY appointment_date, appointment_time`,
    params
  );
  res.json(rows);
}

// PUT /api/appointments/:id/status — admin only. Moves an appointment
// through pending -> confirmed -> completed, or cancels it.
export async function updateAppointmentStatus(req: Request, res: Response) {
  const { status } = req.body; // "pending" | "confirmed" | "completed" | "cancelled"
  await pool.query("UPDATE appointments SET status = ? WHERE appointment_id = ?", [status, req.params.id]);
  res.json({ message: `Appointment marked ${status}.` });
}