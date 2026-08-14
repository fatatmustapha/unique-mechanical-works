import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type {
  CreateBranchServiceInput,
  UpdateBranchServiceInput,
} from "../validators/branch-service.validator.js";

interface BranchServiceRow extends RowDataPacket {
  branch_service_id: number;
  branch_id: number;
  branch_name: string;
  service_id: number;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  is_available: number;
  created_at: Date;
  updated_at: Date;
}

interface BranchServiceIdentityRow extends RowDataPacket {
  branch_service_id: number;
}

export interface BranchService {
  branch_service_id: number;
  branch_id: number;
  branch_name: string;
  service_id: number;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

const mapBranchService = (
  row: BranchServiceRow,
): BranchService => ({
  branch_service_id: row.branch_service_id,
  branch_id: row.branch_id,
  branch_name: row.branch_name,
  service_id: row.service_id,
  estimated_price_min: row.estimated_price_min,
  estimated_price_max: row.estimated_price_max,
  is_available: row.is_available === 1,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const findBranchServicesByServiceId = async (
  serviceId: number,
): Promise<BranchService[]> => {
  const [rows] = await databasePool.execute<BranchServiceRow[]>(
    `
      SELECT
        bs.branch_service_id,
        bs.branch_id,
        b.name AS branch_name,
        bs.service_id,
        bs.estimated_price_min,
        bs.estimated_price_max,
        bs.is_available,
        bs.created_at,
        bs.updated_at
      FROM branch_services bs
      INNER JOIN branches b
        ON b.branch_id = bs.branch_id
      WHERE bs.service_id = ?
      ORDER BY b.name ASC
    `,
    [serviceId],
  );

  return rows.map(mapBranchService);
};

export const findBranchService = async (
  serviceId: number,
  branchId: number,
): Promise<BranchService | null> => {
  const [rows] = await databasePool.execute<BranchServiceRow[]>(
    `
      SELECT
        bs.branch_service_id,
        bs.branch_id,
        b.name AS branch_name,
        bs.service_id,
        bs.estimated_price_min,
        bs.estimated_price_max,
        bs.is_available,
        bs.created_at,
        bs.updated_at
      FROM branch_services bs
      INNER JOIN branches b
        ON b.branch_id = bs.branch_id
      WHERE bs.service_id = ?
        AND bs.branch_id = ?
      LIMIT 1
    `,
    [serviceId, branchId],
  );

  const row = rows[0];

  return row ? mapBranchService(row) : null;
};

export const findBranchServiceIdentity = async (
  serviceId: number,
  branchId: number,
): Promise<{ branch_service_id: number } | null> => {
  const [rows] =
    await databasePool.execute<BranchServiceIdentityRow[]>(
      `
        SELECT branch_service_id
        FROM branch_services
        WHERE service_id = ?
          AND branch_id = ?
        LIMIT 1
      `,
      [serviceId, branchId],
    );

  return rows[0] ?? null;
};

export const createBranchService = async (
  serviceId: number,
  input: CreateBranchServiceInput,
): Promise<BranchService> => {
  await databasePool.execute<ResultSetHeader>(
    `
      INSERT INTO branch_services (
        branch_id,
        service_id,
        estimated_price_min,
        estimated_price_max,
        is_available
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      input.branch_id,
      serviceId,
      input.estimated_price_min ?? null,
      input.estimated_price_max ?? null,
      input.is_available,
    ],
  );

  const branchService = await findBranchService(
    serviceId,
    input.branch_id,
  );

  if (!branchService) {
    throw new Error(
      "The newly created branch-service record could not be retrieved.",
    );
  }

  return branchService;
};

export const updateBranchService = async (
  serviceId: number,
  branchId: number,
  input: UpdateBranchServiceInput,
): Promise<void> => {
  const updates: string[] = [];
  const values: Array<number | boolean | null> = [];

  if (input.estimated_price_min !== undefined) {
    updates.push("estimated_price_min = ?");
    values.push(input.estimated_price_min);
  }

  if (input.estimated_price_max !== undefined) {
    updates.push("estimated_price_max = ?");
    values.push(input.estimated_price_max);
  }

  if (input.is_available !== undefined) {
    updates.push("is_available = ?");
    values.push(input.is_available);
  }

  values.push(serviceId, branchId);

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE branch_services
      SET ${updates.join(", ")}
      WHERE service_id = ?
        AND branch_id = ?
    `,
    values,
  );
};

export const deleteBranchService = async (
  serviceId: number,
  branchId: number,
): Promise<boolean> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        DELETE FROM branch_services
        WHERE service_id = ?
          AND branch_id = ?
      `,
      [serviceId, branchId],
    );

  return result.affectedRows > 0;
};