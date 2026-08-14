import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "../validators/service.validator.js";

interface ServiceRow extends RowDataPacket {
  service_id: number;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  is_active: number;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

interface ServiceIdentityRow extends RowDataPacket {
  service_id: number;
}

export interface Service {
  service_id: number;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

const mapService = (
  service: ServiceRow,
): Service => {
  return {
    service_id: service.service_id,
    name: service.name,
    slug: service.slug,
    category: service.category,
    short_description: service.short_description,
    description: service.description,
    image_url: service.image_url,
    is_active: service.is_active === 1,
    display_order: service.display_order,
    created_at: service.created_at,
    updated_at: service.updated_at,
  };
};

export const findActiveServices = async (): Promise<Service[]> => {
  const [rows] = await databasePool.execute<ServiceRow[]>(
    `
      SELECT
        service_id,
        name,
        slug,
        category,
        short_description,
        description,
        image_url,
        is_active,
        display_order,
        created_at,
        updated_at
      FROM services
      WHERE is_active = 1
      ORDER BY display_order ASC, name ASC
    `,
  );

  return rows.map(mapService);
};

export const findActiveServiceById = async (
  serviceId: number,
): Promise<Service | null> => {
  const [rows] = await databasePool.execute<ServiceRow[]>(
    `
      SELECT
        service_id,
        name,
        slug,
        category,
        short_description,
        description,
        image_url,
        is_active,
        display_order,
        created_at,
        updated_at
      FROM services
      WHERE service_id = ?
        AND is_active = 1
      LIMIT 1
    `,
    [serviceId],
  );

  const service = rows[0];

  return service ? mapService(service) : null;
};

export const findServiceById = async (
  serviceId: number,
): Promise<Service | null> => {
  const [rows] = await databasePool.execute<ServiceRow[]>(
    `
      SELECT
        service_id,
        name,
        slug,
        category,
        short_description,
        description,
        image_url,
        is_active,
        display_order,
        created_at,
        updated_at
      FROM services
      WHERE service_id = ?
      LIMIT 1
    `,
    [serviceId],
  );

  const service = rows[0];

  return service ? mapService(service) : null;
};

export const findAnotherServiceByName = async (
  name: string,
  excludedServiceId?: number,
): Promise<{ service_id: number } | null> => {
  const [rows] =
    excludedServiceId === undefined
      ? await databasePool.execute<ServiceIdentityRow[]>(
          `
            SELECT service_id
            FROM services
            WHERE name = ?
            LIMIT 1
          `,
          [name],
        )
      : await databasePool.execute<ServiceIdentityRow[]>(
          `
            SELECT service_id
            FROM services
            WHERE name = ?
              AND service_id <> ?
            LIMIT 1
          `,
          [name, excludedServiceId],
        );

  return rows[0] ?? null;
};

export const findAnotherServiceBySlug = async (
  slug: string,
  excludedServiceId?: number,
): Promise<{ service_id: number } | null> => {
  const [rows] =
    excludedServiceId === undefined
      ? await databasePool.execute<ServiceIdentityRow[]>(
          `
            SELECT service_id
            FROM services
            WHERE slug = ?
            LIMIT 1
          `,
          [slug],
        )
      : await databasePool.execute<ServiceIdentityRow[]>(
          `
            SELECT service_id
            FROM services
            WHERE slug = ?
              AND service_id <> ?
            LIMIT 1
          `,
          [slug, excludedServiceId],
        );

  return rows[0] ?? null;
};

export const createService = async (
  input: CreateServiceInput,
): Promise<Service> => {
  const [result] = await databasePool.execute<ResultSetHeader>(
    `
      INSERT INTO services (
        name,
        slug,
        category,
        short_description,
        description,
        image_url,
        display_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.name,
      input.slug,
      input.category ?? null,
      input.short_description ?? null,
      input.description ?? null,
      input.image_url ?? null,
      input.display_order ?? 0,
    ],
  );

  const service = await findServiceById(result.insertId);

  if (!service) {
    throw new Error(
      "The newly created service could not be retrieved.",
    );
  }

  return service;
};

export const updateService = async (
  serviceId: number,
  input: UpdateServiceInput,
): Promise<void> => {
  const updates: string[] = [];
  const values: Array<string | number | null> = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }

  if (input.slug !== undefined) {
    updates.push("slug = ?");
    values.push(input.slug);
  }

  if (input.category !== undefined) {
    updates.push("category = ?");
    values.push(input.category);
  }

  if (input.short_description !== undefined) {
    updates.push("short_description = ?");
    values.push(input.short_description);
  }

  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description);
  }

  if (input.image_url !== undefined) {
    updates.push("image_url = ?");
    values.push(input.image_url);
  }

  if (input.display_order !== undefined) {
    updates.push("display_order = ?");
    values.push(input.display_order);
  }

  values.push(serviceId);

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE services
      SET ${updates.join(", ")}
      WHERE service_id = ?
    `,
    values,
  );
};

export const updateServiceStatus = async (
  serviceId: number,
  isActive: boolean,
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE services
      SET is_active = ?
      WHERE service_id = ?
    `,
    [isActive, serviceId],
  );
};