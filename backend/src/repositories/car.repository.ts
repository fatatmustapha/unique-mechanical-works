import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type {
  CreateCarInput,
  PublicCarsQuery,
  UpdateCarInput,
} from "../validators/car.validator.js";

interface CarRow extends RowDataPacket {
  car_id: number;
  reference_number: string;
  slug: string;
  vin: string | null;
  created_by_admin_id: number | null;
  submission_id: number | null;
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
  transmission: "Automatic" | "Manual" | null;
  fuel_type:
    | "Petrol"
    | "Diesel"
    | "Hybrid"
    | "Electric"
    | null;
  description: string | null;
  sale_status: "available" | "reserved" | "sold";
  publication_status: "draft" | "published" | "archived";
  is_featured: number;
  color_exterior: string | null;
  color_interior: string | null;
  engine_size: string | null;
  horsepower: number | null;
  body_type: string | null;
  num_doors: number | null;
  num_seats: number | null;
  drivetrain: "FWD" | "RWD" | "AWD" | "4WD" | null;
  registration_status: string | null;
  num_previous_owners: number | null;
  import_status: string | null;
  negotiable: number;
  features: string | null;
  warranty_status: string | null;
  views_count: number;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface CarIdentityRow extends RowDataPacket {
  car_id: number;
}

interface CarCountRow extends RowDataPacket {
  total: number;
}

export interface Car {
  car_id: number;
  reference_number: string;
  slug: string;
  vin: string | null;
  created_by_admin_id: number | null;
  submission_id: number | null;
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
  transmission: "Automatic" | "Manual" | null;
  fuel_type:
    | "Petrol"
    | "Diesel"
    | "Hybrid"
    | "Electric"
    | null;
  description: string | null;
  sale_status: "available" | "reserved" | "sold";
  publication_status: "draft" | "published" | "archived";
  is_featured: boolean;
  color_exterior: string | null;
  color_interior: string | null;
  engine_size: string | null;
  horsepower: number | null;
  body_type: string | null;
  num_doors: number | null;
  num_seats: number | null;
  drivetrain: "FWD" | "RWD" | "AWD" | "4WD" | null;
  registration_status: string | null;
  num_previous_owners: number | null;
  import_status: string | null;
  negotiable: boolean;
  features: string[] | null;
  warranty_status: string | null;
  views_count: number;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PublicCarsResult {
  cars: Car[];
  total: number;
}

const mapCar = (row: CarRow): Car => {
  let features: string[] | null = null;

  if (row.features !== null) {
    try {
      const parsed: unknown = JSON.parse(row.features);

      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      ) {
        features = parsed;
      }
    } catch {
      features = null;
    }
  }

  return {
    ...row,
    is_featured: row.is_featured === 1,
    negotiable: row.negotiable === 1,
    features,
  };
};

const carSelect = `
  SELECT
    c.car_id,
    c.reference_number,
    c.slug,
    c.vin,
    c.created_by_admin_id,
    c.submission_id,
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
    c.description,
    c.sale_status,
    c.publication_status,
    c.is_featured,
    c.color_exterior,
    c.color_interior,
    c.engine_size,
    c.horsepower,
    c.body_type,
    c.num_doors,
    c.num_seats,
    c.drivetrain,
    c.registration_status,
    c.num_previous_owners,
    c.import_status,
    c.negotiable,
    c.features,
    c.warranty_status,
    c.views_count,
    c.published_at,
    c.created_at,
    c.updated_at
  FROM cars c
  INNER JOIN branches b
    ON b.branch_id = c.branch_id
`;

export const findPublishedCars = async (
  query: PublicCarsQuery,
): Promise<PublicCarsResult> => {
  const conditions: string[] = [
    "c.publication_status = 'published'",
    "c.sale_status <> 'sold'",
  ];

  const values: Array<string | number | boolean> = [];

  if (query.search !== undefined) {
    conditions.push(
      "(c.make LIKE ? OR c.model LIKE ? OR c.reference_number LIKE ?)",
    );

    const pattern = `%${query.search}%`;

    values.push(pattern, pattern, pattern);
  }

  if (query.branch_id !== undefined) {
    conditions.push("c.branch_id = ?");
    values.push(query.branch_id);
  }

  if (query.make !== undefined) {
    conditions.push("c.make = ?");
    values.push(query.make);
  }

  if (query.min_price !== undefined) {
    conditions.push("c.price >= ?");
    values.push(query.min_price);
  }

  if (query.max_price !== undefined) {
    conditions.push("c.price <= ?");
    values.push(query.max_price);
  }

  if (query.min_year !== undefined) {
    conditions.push("c.year >= ?");
    values.push(query.min_year);
  }

  if (query.max_year !== undefined) {
    conditions.push("c.year <= ?");
    values.push(query.max_year);
  }

  if (query.condition_type !== undefined) {
    conditions.push("c.condition_type = ?");
    values.push(query.condition_type);
  }

  if (query.transmission !== undefined) {
    conditions.push("c.transmission = ?");
    values.push(query.transmission);
  }

  if (query.fuel_type !== undefined) {
    conditions.push("c.fuel_type = ?");
    values.push(query.fuel_type);
  }

  if (query.body_type !== undefined) {
    conditions.push("c.body_type = ?");
    values.push(query.body_type);
  }

  if (query.featured !== undefined) {
    conditions.push("c.is_featured = ?");
    values.push(query.featured);
  }

  const orderBy = {
    latest: "c.published_at DESC, c.created_at DESC",
    price_asc: "c.price ASC",
    price_desc: "c.price DESC",
    year_asc: "c.year ASC",
    year_desc: "c.year DESC",
  }[query.sort];

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const offset = (query.page - 1) * query.limit;

  const [rows] = await databasePool.execute<CarRow[]>(
    `
      ${carSelect}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ?
      OFFSET ?
    `,
    [...values, query.limit, offset],
  );

  const [countRows] = await databasePool.execute<CarCountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM cars c
      ${whereClause}
    `,
    values,
  );

  return {
    cars: rows.map(mapCar),
    total: countRows[0]?.total ?? 0,
  };
};

export const findPublishedCarBySlug = async (
  slug: string,
): Promise<Car | null> => {
  const [rows] = await databasePool.execute<CarRow[]>(
    `
      ${carSelect}
      WHERE c.slug = ?
        AND c.publication_status = 'published'
      LIMIT 1
    `,
    [slug],
  );

  return rows[0] ? mapCar(rows[0]) : null;
};

export const findCarById = async (
  carId: number,
): Promise<Car | null> => {
  const [rows] = await databasePool.execute<CarRow[]>(
    `
      ${carSelect}
      WHERE c.car_id = ?
      LIMIT 1
    `,
    [carId],
  );

  return rows[0] ? mapCar(rows[0]) : null;
};

export const findCarByReferenceNumber = async (
  referenceNumber: string,
  excludedId?: number,
): Promise<number | null> => {
  const sql =
    excludedId === undefined
      ? `
          SELECT car_id
          FROM cars
          WHERE reference_number = ?
          LIMIT 1
        `
      : `
          SELECT car_id
          FROM cars
          WHERE reference_number = ?
            AND car_id <> ?
          LIMIT 1
        `;

  const params =
    excludedId === undefined
      ? [referenceNumber]
      : [referenceNumber, excludedId];

  const [rows] =
    await databasePool.execute<CarIdentityRow[]>(
      sql,
      params,
    );

  return rows[0]?.car_id ?? null;
};

export const findCarBySlug = async (
  slug: string,
  excludedId?: number,
): Promise<number | null> => {
  const sql =
    excludedId === undefined
      ? `
          SELECT car_id
          FROM cars
          WHERE slug = ?
          LIMIT 1
        `
      : `
          SELECT car_id
          FROM cars
          WHERE slug = ?
            AND car_id <> ?
          LIMIT 1
        `;

  const params =
    excludedId === undefined
      ? [slug]
      : [slug, excludedId];

  const [rows] =
    await databasePool.execute<CarIdentityRow[]>(
      sql,
      params,
    );

  return rows[0]?.car_id ?? null;
};

export const findCarByVin = async (
  vin: string,
  excludedId?: number,
): Promise<number | null> => {
  const sql =
    excludedId === undefined
      ? `
          SELECT car_id
          FROM cars
          WHERE vin = ?
          LIMIT 1
        `
      : `
          SELECT car_id
          FROM cars
          WHERE vin = ?
            AND car_id <> ?
          LIMIT 1
        `;

  const params =
    excludedId === undefined
      ? [vin]
      : [vin, excludedId];

  const [rows] =
    await databasePool.execute<CarIdentityRow[]>(
      sql,
      params,
    );

  return rows[0]?.car_id ?? null;
};

export const createCar = async (
  input: CreateCarInput,
  adminId: number,
): Promise<Car> => {
  const [result] = await databasePool.execute<ResultSetHeader>(
    `
      INSERT INTO cars (
        reference_number,
        slug,
        vin,
        created_by_admin_id,
        branch_id,
        make,
        model,
        year,
        price,
        mileage,
        condition_type,
        transmission,
        fuel_type,
        description,
        color_exterior,
        color_interior,
        engine_size,
        horsepower,
        body_type,
        num_doors,
        num_seats,
        drivetrain,
        registration_status,
        num_previous_owners,
        import_status,
        negotiable,
        features,
        warranty_status
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `,
    [
      input.reference_number,
      input.slug,
      input.vin ?? null,
      adminId,
      input.branch_id,
      input.make,
      input.model,
      input.year ?? null,
      input.price,
      input.mileage ?? null,
      input.condition_type ?? null,
      input.transmission ?? null,
      input.fuel_type ?? null,
      input.description ?? null,
      input.color_exterior ?? null,
      input.color_interior ?? null,
      input.engine_size ?? null,
      input.horsepower ?? null,
      input.body_type ?? null,
      input.num_doors ?? null,
      input.num_seats ?? null,
      input.drivetrain ?? null,
      input.registration_status ?? null,
      input.num_previous_owners ?? null,
      input.import_status ?? null,
      input.negotiable,
      input.features === undefined ||
      input.features === null
        ? null
        : JSON.stringify(input.features),
      input.warranty_status ?? null,
    ],
  );

  const car = await findCarById(result.insertId);

  if (!car) {
    throw new Error(
      "The newly created car could not be retrieved.",
    );
  }

  return car;
};

export const updateCar = async (
  carId: number,
  input: UpdateCarInput,
): Promise<void> => {
  const updates: string[] = [];
  const values: Array<string | number | boolean | null> = [];

  const add = (
    column: string,
    value: string | number | boolean | null,
  ): void => {
    updates.push(`${column} = ?`);
    values.push(value);
  };

  if (input.reference_number !== undefined)
    add("reference_number", input.reference_number);

  if (input.slug !== undefined)
    add("slug", input.slug);

  if (input.vin !== undefined)
    add("vin", input.vin);

  if (input.branch_id !== undefined)
    add("branch_id", input.branch_id);

  if (input.make !== undefined)
    add("make", input.make);

  if (input.model !== undefined)
    add("model", input.model);

  if (input.year !== undefined)
    add("year", input.year);

  if (input.price !== undefined)
    add("price", input.price);

  if (input.mileage !== undefined)
    add("mileage", input.mileage);

  if (input.condition_type !== undefined)
    add("condition_type", input.condition_type);

  if (input.transmission !== undefined)
    add("transmission", input.transmission);

  if (input.fuel_type !== undefined)
    add("fuel_type", input.fuel_type);

  if (input.description !== undefined)
    add("description", input.description);

  if (input.color_exterior !== undefined)
    add("color_exterior", input.color_exterior);

  if (input.color_interior !== undefined)
    add("color_interior", input.color_interior);

  if (input.engine_size !== undefined)
    add("engine_size", input.engine_size);

  if (input.horsepower !== undefined)
    add("horsepower", input.horsepower);

  if (input.body_type !== undefined)
    add("body_type", input.body_type);

  if (input.num_doors !== undefined)
    add("num_doors", input.num_doors);

  if (input.num_seats !== undefined)
    add("num_seats", input.num_seats);

  if (input.drivetrain !== undefined)
    add("drivetrain", input.drivetrain);

  if (input.registration_status !== undefined)
    add(
      "registration_status",
      input.registration_status,
    );

  if (input.num_previous_owners !== undefined)
    add(
      "num_previous_owners",
      input.num_previous_owners,
    );

  if (input.import_status !== undefined)
    add("import_status", input.import_status);

  if (input.negotiable !== undefined)
    add("negotiable", input.negotiable);

  if (input.features !== undefined)
    add(
      "features",
      input.features === null
        ? null
        : JSON.stringify(input.features),
    );

  if (input.warranty_status !== undefined)
    add("warranty_status", input.warranty_status);

  values.push(carId);

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE cars
      SET ${updates.join(", ")}
      WHERE car_id = ?
    `,
    values,
  );
};
export const updateCarPublicationStatus = async (
  carId: number,
  publicationStatus: "draft" | "published" | "archived",
): Promise<void> => {
  if (publicationStatus === "published") {
    await databasePool.execute<ResultSetHeader>(
      `
        UPDATE cars
        SET
          publication_status = ?,
          published_at = CURRENT_TIMESTAMP
        WHERE car_id = ?
      `,
      [publicationStatus, carId],
    );

    return;
  }

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE cars
      SET publication_status = ?
      WHERE car_id = ?
    `,
    [publicationStatus, carId],
  );
};

export const updateCarSaleStatus = async (
  carId: number,
  saleStatus: "available" | "reserved" | "sold",
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE cars
      SET sale_status = ?
      WHERE car_id = ?
    `,
    [saleStatus, carId],
  );
};

export const updateCarFeaturedStatus = async (
  carId: number,
  isFeatured: boolean,
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE cars
      SET is_featured = ?
      WHERE car_id = ?
    `,
    [isFeatured, carId],
  );
};

export const permanentlyDeleteCar = async (
  carId: number,
): Promise<boolean> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        DELETE FROM cars
        WHERE car_id = ?
      `,
      [carId],
    );

  return result.affectedRows > 0;
};