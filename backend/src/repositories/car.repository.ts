import type { RowDataPacket } from "mysql2";

import { databasePool } from "../config/database.js";

interface CarRow extends RowDataPacket {
  car_id: number;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  branch_id: number;
  status: string;
  is_published: number;
  is_archived: number;
}

export interface Car {
  car_id: number;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  branch_id: number;
}

export const findPublishedCars = async (): Promise<Car[]> => {
  const [rows] = await databasePool.execute<CarRow[]>(
    `
    SELECT
      car_id,
      slug,
      make,
      model,
      year,
      price,
      branch_id
    FROM cars
    WHERE
      is_published = 1
      AND is_archived = 0
    ORDER BY created_at DESC
`,
  );

  return rows;
};

export const findPublishedCarBySlug = async (
  slug: string,
): Promise<Car | null> => {
  const [rows] =
    await databasePool.execute<CarRow[]>(
      `
SELECT
  car_id,
  slug,
  make,
  model,
  year,
  price,
  branch_id
FROM cars
WHERE
  slug = ?
  AND is_published = 1
  AND is_archived = 0
LIMIT 1
`,
      [slug],
    );

  return rows[0] ?? null;
};