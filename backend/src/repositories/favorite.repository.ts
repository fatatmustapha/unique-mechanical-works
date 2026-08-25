import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";

interface FavoriteRow extends RowDataPacket {
  customer_id: number;
  car_id: number;
  created_at: Date;

  reference_number: string;
  slug: string;
  branch_id: number;
  branch_name: string;

  make: string;
  model: string;
  year: number | null;

  price: string | number;
  mileage: number | null;

  condition_type:
    | "New"
    | "Nigerian Used"
    | "Foreign Used"
    | null;

  transmission:
    | "Automatic"
    | "Manual"
    | null;

  fuel_type:
    | "Petrol"
    | "Diesel"
    | "Hybrid"
    | "Electric"
    | null;

  sale_status:
    | "available"
    | "reserved"
    | "sold";

  publication_status:
    | "draft"
    | "published"
    | "archived";

  is_featured: number;

  primary_image_url: string | null;
}

interface FavoriteIdentityRow extends RowDataPacket {
  car_id: number;
}

export interface Favorite {
  customer_id: number;
  car_id: number;
  created_at: Date;

  car: {
    reference_number: string;
    slug: string;

    branch_id: number;
    branch_name: string;

    make: string;
    model: string;
    year: number | null;

    price: number;
    mileage: number | null;

    condition_type:
      | "New"
      | "Nigerian Used"
      | "Foreign Used"
      | null;

    transmission:
      | "Automatic"
      | "Manual"
      | null;

    fuel_type:
      | "Petrol"
      | "Diesel"
      | "Hybrid"
      | "Electric"
      | null;

    sale_status:
      | "available"
      | "reserved"
      | "sold";

    publication_status:
      | "draft"
      | "published"
      | "archived";

    is_featured: boolean;

    primary_image_url: string | null;
  };
}

const mapFavorite = (
  row: FavoriteRow,
): Favorite => ({
  customer_id: row.customer_id,
  car_id: row.car_id,
  created_at: row.created_at,

  car: {
    reference_number:
      row.reference_number,

    slug: row.slug,

    branch_id: row.branch_id,
    branch_name: row.branch_name,

    make: row.make,
    model: row.model,
    year: row.year,

    price: Number(row.price),
    mileage: row.mileage,

    condition_type:
      row.condition_type,

    transmission:
      row.transmission,

    fuel_type:
      row.fuel_type,

    sale_status:
      row.sale_status,

    publication_status:
      row.publication_status,

    is_featured:
      row.is_featured === 1,

    primary_image_url:
      row.primary_image_url,
  },
});

export const findCustomerFavorites = async (
  customerId: number,
): Promise<Favorite[]> => {
  const [rows] =
    await databasePool.execute<FavoriteRow[]>(
      `
        SELECT
          f.customer_id,
          f.car_id,
          f.created_at,

          c.reference_number,
          c.slug,

          c.branch_id,
          b.name AS branch_name,

          c.make,
          c.model,
          c.year,

          c.price,
          c.mileage,

          c.condition_type,
          c.transmission,
          c.fuel_type,

          c.sale_status,
          c.publication_status,

          c.is_featured,

          (
            SELECT ci.image_url

            FROM car_images ci

            WHERE ci.car_id = c.car_id

            ORDER BY
              ci.is_primary DESC,
              ci.sort_order ASC,
              ci.image_id ASC

            LIMIT 1
          ) AS primary_image_url

        FROM favorites f

        INNER JOIN cars c
          ON c.car_id = f.car_id

        INNER JOIN branches b
          ON b.branch_id = c.branch_id

        WHERE f.customer_id = ?
          AND c.publication_status = 'published'
          AND c.sale_status <> 'sold'

        ORDER BY f.created_at DESC
      `,
      [customerId],
    );

  return rows.map(mapFavorite);
};

export const findFavorite = async (
  customerId: number,
  carId: number,
): Promise<boolean> => {
  const [rows] =
    await databasePool.execute<
      FavoriteIdentityRow[]
    >(
      `
        SELECT car_id

        FROM favorites

        WHERE customer_id = ?
          AND car_id = ?

        LIMIT 1
      `,
      [
        customerId,
        carId,
      ],
    );

  return rows.length > 0;
};

export const createFavorite = async (
  customerId: number,
  carId: number,
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      INSERT INTO favorites (
        customer_id,
        car_id
      )

      VALUES (?, ?)
    `,
    [
      customerId,
      carId,
    ],
  );
};

export const deleteFavorite = async (
  customerId: number,
  carId: number,
): Promise<boolean> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        DELETE FROM favorites

        WHERE customer_id = ?
          AND car_id = ?
      `,
      [
        customerId,
        carId,
      ],
    );

  return result.affectedRows > 0;
};