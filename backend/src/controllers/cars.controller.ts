import { Request, Response } from "express";
import { pool } from "../config/db";

// Only these columns can ever be changed via updateCar — keeps user
// input from ever reaching the SQL string itself (not just the values).
const UPDATABLE_CAR_FIELDS = [
  "branch_id", "make", "model", "year", "price", "mileage", "condition_type",
  "transmission", "fuel_type", "description", "status", "color_exterior",
  "color_interior", "engine_size", "horsepower", "body_type", "num_doors",
  "num_seats", "drivetrain", "registration_status", "num_previous_owners",
  "import_status", "negotiable", "features", "warranty_status",
];

// GET /api/cars — browse/filter the marketplace. Supports query params:
// ?branch_id=1&condition_type=Nigerian Used&make=Toyota&year=2019&min_price=2000000&max_price=8000000
// Only ever returns cars with status "available" — reserved/sold cars don't show publicly.
export async function getCars(req: Request, res: Response) {
  const { branch_id, condition_type, make, year, min_price, max_price } = req.query;

  const conditions: string[] = ["status = 'available'"];
  const params: any[] = [];

  if (branch_id) { conditions.push("branch_id = ?"); params.push(branch_id); }
  if (condition_type) { conditions.push("condition_type = ?"); params.push(condition_type); }
  if (make) { conditions.push("make LIKE ?"); params.push(`%${make}%`); }
  if (year) { conditions.push("year = ?"); params.push(year); }
  if (min_price) { conditions.push("price >= ?"); params.push(min_price); }
  if (max_price) { conditions.push("price <= ?"); params.push(max_price); }

  const [rows] = await pool.query(
    `SELECT * FROM cars WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
    params
  );
  res.json(rows);
}

// GET /api/cars/:id — single car listing plus all of its photos.
// Used on the individual car listing page (specs, price, "Book Inspection").
export async function getCarById(req: Request, res: Response) {
  const [carRows]: any = await pool.query("SELECT * FROM cars WHERE car_id = ?", [req.params.id]);
  const car = carRows[0];
  if (!car) return res.status(404).json({ message: "Car not found." });

  const [images] = await pool.query(
    "SELECT * FROM car_images WHERE car_id = ? ORDER BY is_primary DESC",
    [req.params.id]
  );
  res.json({ ...car, images });
}

// POST /api/cars — admin only. Creates a new car listing from the admin dashboard's "add car" form.
export async function createCar(req: Request, res: Response) {
  const b = req.body;
  const [result]: any = await pool.query(
    `INSERT INTO cars (listed_by_admin, branch_id, make, model, year, price, mileage, condition_type,
      transmission, fuel_type, description, color_exterior, color_interior, engine_size, horsepower,
      body_type, num_doors, num_seats, drivetrain, registration_status, num_previous_owners,
      import_status, negotiable, features, warranty_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user!.id, b.branch_id, b.make, b.model, b.year, b.price, b.mileage, b.condition_type,
     b.transmission, b.fuel_type, b.description, b.color_exterior, b.color_interior, b.engine_size,
     b.horsepower, b.body_type, b.num_doors, b.num_seats, b.drivetrain, b.registration_status,
     b.num_previous_owners, b.import_status, b.negotiable ?? true, b.features, b.warranty_status]
  );
  res.status(201).json({ car_id: result.insertId });
}

// PUT /api/cars/:id — admin only. Partial update (price change, mark reserved, etc) —
// only fields in UPDATABLE_CAR_FIELDS are ever written.
export async function updateCar(req: Request, res: Response) {
  const fields = Object.keys(req.body).filter((f) => UPDATABLE_CAR_FIELDS.includes(f));
  if (fields.length === 0) return res.status(400).json({ message: "Nothing valid to update." });

  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => req.body[f]);

  await pool.query(`UPDATE cars SET ${setClause} WHERE car_id = ?`, [...values, req.params.id]);
  res.json({ message: "Car listing updated." });
}

// DELETE /api/cars/:id — admin only.
export async function deleteCar(req: Request, res: Response) {
  await pool.query("DELETE FROM cars WHERE car_id = ?", [req.params.id]);
  res.json({ message: "Car listing removed." });
}

// POST /api/cars/:id/images — admin only. Attaches a photo to a listing.
// image_url points at wherever you end up hosting images (e.g. a cloud bucket) —
// this just saves the link and label.
export async function addCarImage(req: Request, res: Response) {
  const { image_url, image_label, is_primary } = req.body;
  const [result]: any = await pool.query(
    "INSERT INTO car_images (car_id, image_url, image_label, is_primary) VALUES (?, ?, ?, ?)",
    [req.params.id, image_url, image_label ?? "other", is_primary ?? false]
  );
  res.status(201).json({ image_id: result.insertId });
}