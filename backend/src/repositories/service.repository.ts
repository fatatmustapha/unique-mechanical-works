import type { RowDataPacket } from "mysql2";

import { databasePool } from "../config/database.js";

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