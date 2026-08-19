import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type {
  CreateCarImageInput,
  ReorderCarImagesInput,
  UpdateCarImageInput,
} from "../validators/car-image.validator.js";

interface CarImageRow extends RowDataPacket {
  image_id: number;
  car_id: number;
  image_url: string;
  image_label:
    | "front"
    | "back"
    | "side"
    | "interior"
    | "engine"
    | "other";
  alt_text: string | null;
  is_primary: number;
  sort_order: number;
  created_at: Date;
}

export interface CarImage {
  image_id: number;
  car_id: number;
  image_url: string;
  image_label:
    | "front"
    | "back"
    | "side"
    | "interior"
    | "engine"
    | "other";
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: Date;
}

const mapCarImage = (
  row: CarImageRow,
): CarImage => {
  return {
    image_id: row.image_id,
    car_id: row.car_id,
    image_url: row.image_url,
    image_label: row.image_label,
    alt_text: row.alt_text,
    is_primary: row.is_primary === 1,
    sort_order: row.sort_order,
    created_at: row.created_at,
  };
};

export const findCarImages = async (
  carId: number,
): Promise<CarImage[]> => {
  const [rows] =
    await databasePool.execute<CarImageRow[]>(
      `
        SELECT
          image_id,
          car_id,
          image_url,
          image_label,
          alt_text,
          is_primary,
          sort_order,
          created_at
        FROM car_images
        WHERE car_id = ?
        ORDER BY
          is_primary DESC,
          sort_order ASC,
          image_id ASC
      `,
      [carId],
    );

  return rows.map(mapCarImage);
};

export const findCarImageById = async (
  carId: number,
  imageId: number,
): Promise<CarImage | null> => {
  const [rows] =
    await databasePool.execute<CarImageRow[]>(
      `
        SELECT
          image_id,
          car_id,
          image_url,
          image_label,
          alt_text,
          is_primary,
          sort_order,
          created_at
        FROM car_images
        WHERE car_id = ?
          AND image_id = ?
        LIMIT 1
      `,
      [carId, imageId],
    );

  const image = rows[0];

  return image
    ? mapCarImage(image)
    : null;
};

export const createCarImage = async (
  carId: number,
  input: CreateCarImageInput,
): Promise<CarImage> => {
  const connection =
    await databasePool.getConnection();

  try {
    await connection.beginTransaction();

    if (input.is_primary) {
      await connection.execute<ResultSetHeader>(
        `
          UPDATE car_images
          SET is_primary = 0
          WHERE car_id = ?
        `,
        [carId],
      );
    }

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
          INSERT INTO car_images (
            car_id,
            image_url,
            image_label,
            alt_text,
            is_primary,
            sort_order
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          carId,
          input.image_url,
          input.image_label,
          input.alt_text ?? null,
          input.is_primary,
          input.sort_order,
        ],
      );

    await connection.commit();

    const image =
      await findCarImageById(
        carId,
        result.insertId,
      );

    if (!image) {
      throw new Error(
        "The newly created car image could not be retrieved.",
      );
    }

    return image;
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCarImage = async (
  carId: number,
  imageId: number,
  input: UpdateCarImageInput,
): Promise<void> => {
  const updates: string[] = [];
  const values: Array<
    string | number | null
  > = [];

  if (input.image_label !== undefined) {
    updates.push("image_label = ?");
    values.push(input.image_label);
  }

  if (input.alt_text !== undefined) {
    updates.push("alt_text = ?");
    values.push(input.alt_text);
  }

  if (input.sort_order !== undefined) {
    updates.push("sort_order = ?");
    values.push(input.sort_order);
  }

  values.push(carId, imageId);

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE car_images
      SET ${updates.join(", ")}
      WHERE car_id = ?
        AND image_id = ?
    `,
    values,
  );
};

export const setPrimaryCarImage = async (
  carId: number,
  imageId: number,
): Promise<void> => {
  const connection =
    await databasePool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute<ResultSetHeader>(
      `
        UPDATE car_images
        SET is_primary = 0
        WHERE car_id = ?
      `,
      [carId],
    );

    await connection.execute<ResultSetHeader>(
      `
        UPDATE car_images
        SET is_primary = 1
        WHERE car_id = ?
          AND image_id = ?
      `,
      [carId, imageId],
    );

    await connection.commit();
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const reorderCarImages = async (
  carId: number,
  input: ReorderCarImagesInput,
): Promise<void> => {
  const connection =
    await databasePool.getConnection();

  try {
    await connection.beginTransaction();

    for (const image of input.images) {
      await connection.execute<ResultSetHeader>(
        `
          UPDATE car_images
          SET sort_order = ?
          WHERE car_id = ?
            AND image_id = ?
        `,
        [
          image.sort_order,
          carId,
          image.image_id,
        ],
      );
    }

    await connection.commit();
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteCarImage = async (
  carId: number,
  imageId: number,
): Promise<boolean> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        DELETE FROM car_images
        WHERE car_id = ?
          AND image_id = ?
      `,
      [carId, imageId],
    );

  return result.affectedRows > 0;
};