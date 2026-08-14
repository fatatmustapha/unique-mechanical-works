import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type {
  CreateBranchInput,
  UpdateBranchInput,
} from "../validators/branch.validator.js";

interface BranchRow extends RowDataPacket {
  branch_id: number;
  name: string;
  city: string;
  state: string | null;
  address: string;
  phone: string;
  whatsapp_number: string | null;
  email: string | null;
  opening_hours: string | null;
  google_maps_url: string | null;
  opened_year: number | null;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

interface BranchNameRow extends RowDataPacket {
  branch_id: number;
}

export interface Branch {
  branch_id: number;
  name: string;
  city: string;
  state: string | null;
  address: string;
  phone: string;
  whatsapp_number: string | null;
  email: string | null;
  opening_hours: string | null;
  google_maps_url: string | null;
  opened_year: number | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const mapBranch = (branch: BranchRow): Branch => {
  return {
    branch_id: branch.branch_id,
    name: branch.name,
    city: branch.city,
    state: branch.state,
    address: branch.address,
    phone: branch.phone,
    whatsapp_number: branch.whatsapp_number,
    email: branch.email,
    opening_hours: branch.opening_hours,
    google_maps_url: branch.google_maps_url,
    opened_year: branch.opened_year,
    is_active: branch.is_active === 1,
    created_at: branch.created_at,
    updated_at: branch.updated_at,
  };
};

export const findActiveBranches = async (): Promise<Branch[]> => {
  const [rows] = await databasePool.execute<BranchRow[]>(
    `
      SELECT
        branch_id,
        name,
        city,
        state,
        address,
        phone,
        whatsapp_number,
        email,
        opening_hours,
        google_maps_url,
        opened_year,
        is_active,
        created_at,
        updated_at
      FROM branches
      WHERE is_active = 1
      ORDER BY branch_id ASC
    `,
  );

  return rows.map(mapBranch);
};

export const findActiveBranchById = async (
  branchId: number,
): Promise<Branch | null> => {
  const [rows] = await databasePool.execute<BranchRow[]>(
    `
      SELECT
        branch_id,
        name,
        city,
        state,
        address,
        phone,
        whatsapp_number,
        email,
        opening_hours,
        google_maps_url,
        opened_year,
        is_active,
        created_at,
        updated_at
      FROM branches
      WHERE branch_id = ?
        AND is_active = 1
      LIMIT 1
    `,
    [branchId],
  );

  const branch = rows[0];

  return branch ? mapBranch(branch) : null;
};

export const findBranchById = async (
  branchId: number,
): Promise<Branch | null> => {
  const [rows] = await databasePool.execute<BranchRow[]>(
    `
      SELECT
        branch_id,
        name,
        city,
        state,
        address,
        phone,
        whatsapp_number,
        email,
        opening_hours,
        google_maps_url,
        opened_year,
        is_active,
        created_at,
        updated_at
      FROM branches
      WHERE branch_id = ?
      LIMIT 1
    `,
    [branchId],
  );

  const branch = rows[0];

  return branch ? mapBranch(branch) : null;
};

export const findAnotherBranchByName = async (
  name: string,
  excludedBranchId?: number,
): Promise<{ branch_id: number } | null> => {
  const [rows] = excludedBranchId === undefined
    ? await databasePool.execute<BranchNameRow[]>(
        `
          SELECT branch_id
          FROM branches
          WHERE name = ?
          LIMIT 1
        `,
        [name],
      )
    : await databasePool.execute<BranchNameRow[]>(
        `
          SELECT branch_id
          FROM branches
          WHERE name = ?
            AND branch_id <> ?
          LIMIT 1
        `,
        [name, excludedBranchId],
      );

  return rows[0] ?? null;
};

export const createBranch = async (
  input: CreateBranchInput,
): Promise<Branch> => {
  const [result] = await databasePool.execute<ResultSetHeader>(
    `
      INSERT INTO branches (
        name,
        city,
        state,
        address,
        phone,
        whatsapp_number,
        email,
        opening_hours,
        google_maps_url,
        opened_year
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.name,
      input.city,
      input.state ?? null,
      input.address,
      input.phone,
      input.whatsapp_number ?? null,
      input.email ?? null,
      input.opening_hours ?? null,
      input.google_maps_url ?? null,
      input.opened_year ?? null,
    ],
  );

  const branch = await findBranchById(result.insertId);

  if (!branch) {
    throw new Error("The newly created branch could not be retrieved.");
  }

  return branch;
};

export const updateBranch = async (
  branchId: number,
  input: UpdateBranchInput,
): Promise<void> => {
  const updates: string[] = [];
  const values: Array<string | number | null> = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }

  if (input.city !== undefined) {
    updates.push("city = ?");
    values.push(input.city);
  }

  if (input.state !== undefined) {
    updates.push("state = ?");
    values.push(input.state);
  }

  if (input.address !== undefined) {
    updates.push("address = ?");
    values.push(input.address);
  }

  if (input.phone !== undefined) {
    updates.push("phone = ?");
    values.push(input.phone);
  }

  if (input.whatsapp_number !== undefined) {
    updates.push("whatsapp_number = ?");
    values.push(input.whatsapp_number);
  }

  if (input.email !== undefined) {
    updates.push("email = ?");
    values.push(input.email);
  }

  if (input.opening_hours !== undefined) {
    updates.push("opening_hours = ?");
    values.push(input.opening_hours);
  }

  if (input.google_maps_url !== undefined) {
    updates.push("google_maps_url = ?");
    values.push(input.google_maps_url);
  }

  if (input.opened_year !== undefined) {
    updates.push("opened_year = ?");
    values.push(input.opened_year);
  }

  values.push(branchId);

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE branches
      SET ${updates.join(", ")}
      WHERE branch_id = ?
    `,
    values,
  );
};

export const updateBranchStatus = async (
  branchId: number,
  isActive: boolean,
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE branches
      SET is_active = ?
      WHERE branch_id = ?
    `,
    [isActive, branchId],
  );
};