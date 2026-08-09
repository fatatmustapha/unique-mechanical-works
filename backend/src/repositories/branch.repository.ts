import type { RowDataPacket } from "mysql2";

import { databasePool } from "../config/database.js";

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