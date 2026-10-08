import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";

import type {
  CreateServiceShowcaseInput,
  UpdateServiceShowcaseInput,
} from "../validators/service-showcase.validator.js";

export type ShowcaseImageType = "before" | "after";

interface ServiceShowcaseRow extends RowDataPacket {
  showcase_id: number;
  title: string;
  description: string | null;

  service_id: number | null;
  service_name: string | null;

  branch_id: number | null;
  branch_name: string | null;

  is_active: number;

  created_at: Date;
  updated_at: Date;
}

interface ServiceShowcaseImageRow extends RowDataPacket {
  image_id: number;
  showcase_id: number;
  image_type: ShowcaseImageType;
  image_url: string;
  created_at: Date;
}

export interface ServiceShowcaseImage {
  image_id: number;
  showcase_id: number;
  image_type: ShowcaseImageType;
  image_url: string;
  created_at: Date;
}

export interface ServiceShowcase {
  showcase_id: number;
  title: string;
  description: string | null;

  service_id: number | null;
  service_name: string | null;

  branch_id: number | null;
  branch_name: string | null;

  is_active: boolean;

  before_images: ServiceShowcaseImage[];
  after_images: ServiceShowcaseImage[];

  created_at: Date;
  updated_at: Date;
}

const showcaseSelect = `
  SELECT
    ss.showcase_id,
    ss.title,
    ss.description,

    ss.service_id,
    s.name AS service_name,

    ss.branch_id,
    b.name AS branch_name,

    ss.is_active,
    ss.created_at,
    ss.updated_at

  FROM service_showcases ss

  LEFT JOIN services s
    ON s.service_id = ss.service_id

  LEFT JOIN branches b
    ON b.branch_id = ss.branch_id
`;

const mapImage = (
  row: ServiceShowcaseImageRow,
): ServiceShowcaseImage => ({
  image_id: row.image_id,
  showcase_id: row.showcase_id,
  image_type: row.image_type,
  image_url: row.image_url,
  created_at: row.created_at,
});

const findImagesByShowcaseId = async (
  showcaseId: number,
): Promise<ServiceShowcaseImage[]> => {
  const [rows] =
    await databasePool.execute<
      ServiceShowcaseImageRow[]
    >(
      `
        SELECT
          image_id,
          showcase_id,
          image_type,
          image_url,
          created_at
        FROM service_showcase_images
        WHERE showcase_id = ?
        ORDER BY created_at ASC, image_id ASC
      `,
      [showcaseId],
    );

  return rows.map(mapImage);
};

const mapShowcase = async (
  row: ServiceShowcaseRow,
): Promise<ServiceShowcase> => {
  const images = await findImagesByShowcaseId(
    row.showcase_id,
  );

  return {
    showcase_id: row.showcase_id,
    title: row.title,
    description: row.description,

    service_id: row.service_id,
    service_name: row.service_name,

    branch_id: row.branch_id,
    branch_name: row.branch_name,

    is_active: row.is_active === 1,

    before_images: images.filter(
      (image) => image.image_type === "before",
    ),

    after_images: images.filter(
      (image) => image.image_type === "after",
    ),

    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const findActiveServiceShowcases = async (): Promise<
  ServiceShowcase[]
> => {
  const [rows] =
    await databasePool.execute<ServiceShowcaseRow[]>(
      `
        ${showcaseSelect}
        WHERE ss.is_active = 1
        ORDER BY ss.created_at DESC
      `,
    );

  return Promise.all(rows.map(mapShowcase));
};

export const findAllServiceShowcases = async (): Promise<
  ServiceShowcase[]
> => {
  const [rows] =
    await databasePool.execute<ServiceShowcaseRow[]>(
      `
        ${showcaseSelect}
        ORDER BY ss.created_at DESC
      `,
    );

  return Promise.all(rows.map(mapShowcase));
};

export const findServiceShowcaseById = async (
  showcaseId: number,
): Promise<ServiceShowcase | null> => {
  const [rows] =
    await databasePool.execute<ServiceShowcaseRow[]>(
      `
        ${showcaseSelect}
        WHERE ss.showcase_id = ?
        LIMIT 1
      `,
      [showcaseId],
    );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return mapShowcase(row);
};

export const countActiveServiceShowcases =
  async (): Promise<number> => {
    const [rows] = await databasePool.execute<
      (RowDataPacket & { total: number })[]
    >(
      `
        SELECT COUNT(*) AS total
        FROM service_showcases
        WHERE is_active = 1
      `,
    );

    return Number(rows[0]?.total ?? 0);
  };

export const createServiceShowcase = async (
  input: CreateServiceShowcaseInput,
): Promise<number> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        INSERT INTO service_showcases (
          title,
          description,
          service_id,
          branch_id,
          is_active
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        input.title,
        input.description ?? null,
        input.service_id ?? null,
        input.branch_id ?? null,
        input.is_active ?? true,
      ],
    );

  return result.insertId;
};

export const updateServiceShowcase = async (
  showcaseId: number,
  input: UpdateServiceShowcaseInput,
): Promise<void> => {
  const updates: string[] = [];

  const values: Array<
    string | number | boolean | null
  > = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    values.push(input.title);
  }

  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description);
  }

  if (input.service_id !== undefined) {
    updates.push("service_id = ?");
    values.push(input.service_id);
  }

  if (input.branch_id !== undefined) {
    updates.push("branch_id = ?");
    values.push(input.branch_id);
  }

  if (input.is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(input.is_active);
  }

  if (updates.length === 0) {
    return;
  }

  values.push(showcaseId);

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE service_showcases
      SET ${updates.join(", ")}
      WHERE showcase_id = ?
    `,
    values,
  );
};

export const updateServiceShowcaseStatus = async (
  showcaseId: number,
  isActive: boolean,
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE service_showcases
      SET is_active = ?
      WHERE showcase_id = ?
    `,
    [isActive, showcaseId],
  );
};

export const addServiceShowcaseImages = async (
  showcaseId: number,
  imageType: ShowcaseImageType,
  imageUrls: string[],
): Promise<void> => {
  if (imageUrls.length === 0) {
    return;
  }

  const placeholders = imageUrls
    .map(() => "(?, ?, ?)")
    .join(", ");

  const values: Array<string | number> = [];

  for (const imageUrl of imageUrls) {
    values.push(
      showcaseId,
      imageType,
      imageUrl,
    );
  }

  await databasePool.execute<ResultSetHeader>(
    `
      INSERT INTO service_showcase_images (
        showcase_id,
        image_type,
        image_url
      )
      VALUES ${placeholders}
    `,
    values,
  );
};

export const countServiceShowcaseImages = async (
  showcaseId: number,
  imageType: ShowcaseImageType,
): Promise<number> => {
  const [rows] = await databasePool.execute<
    (RowDataPacket & { total: number })[]
  >(
    `
      SELECT COUNT(*) AS total
      FROM service_showcase_images
      WHERE showcase_id = ?
        AND image_type = ?
    `,
    [showcaseId, imageType],
  );

  return Number(rows[0]?.total ?? 0);
};

export const deleteServiceShowcaseImage = async (
  showcaseId: number,
  imageId: number,
): Promise<boolean> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        DELETE FROM service_showcase_images
        WHERE image_id = ?
          AND showcase_id = ?
      `,
      [imageId, showcaseId],
    );

  return result.affectedRows > 0;
};

export const updateServiceShowcaseStatusById = async (
  showcaseId: number,
  isActive: boolean,
): Promise<void> => {
  await updateServiceShowcaseStatus(
    showcaseId,
    isActive,
  );
};

export const deleteServiceShowcase = async (
  showcaseId: number,
): Promise<boolean> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        DELETE FROM service_showcases
        WHERE showcase_id = ?
      `,
      [showcaseId],
    );

  return result.affectedRows > 0;
};