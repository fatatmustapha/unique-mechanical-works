import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type {
  CreateCarSaleSubmissionInput,
  UpdateCarSaleSubmissionInput,
} from "../validators/car-sale-submission.validator.js";

interface SubmissionRow extends RowDataPacket {
  submission_id: number;
  customer_id: number;
  branch_id: number;
  branch_name: string;
  make: string;
  model: string;
  year: number | null;
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
  color_exterior: string | null;
  expected_price: string | number | null;
  description: string | null;
  contact_phone: string | null;
  status:
    | "pending"
    | "approved"
    | "rejected";
  reviewed_by_admin_id: number | null;
  admin_notes: string | null;
  reviewed_at: Date | null;
  approved_car_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CarSaleSubmission {
  submission_id: number;
  customer_id: number;
  branch_id: number;
  branch_name: string;
  make: string;
  model: string;
  year: number | null;
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
  color_exterior: string | null;
  expected_price: number | null;
  description: string | null;
  contact_phone: string | null;
  status:
    | "pending"
    | "approved"
    | "rejected";
  reviewed_by_admin_id: number | null;
  admin_notes: string | null;
  reviewed_at: Date | null;
  approved_car_id: number | null;
  created_at: Date;
  updated_at: Date;
}

const mapSubmission = (
  row: SubmissionRow,
): CarSaleSubmission => ({
  ...row,

  expected_price:
    row.expected_price === null
      ? null
      : Number(row.expected_price),
});

const submissionSelect = `
  SELECT
    s.submission_id,
    s.customer_id,
    s.branch_id,
    b.name AS branch_name,
    s.make,
    s.model,
    s.year,
    s.mileage,
    s.condition_type,
    s.transmission,
    s.fuel_type,
    s.color_exterior,
    s.expected_price,
    s.description,
    s.contact_phone,
    s.status,
    s.reviewed_by_admin_id,
    s.admin_notes,
    s.reviewed_at,
    s.approved_car_id,
    s.created_at,
    s.updated_at
  FROM car_sale_submissions s
  INNER JOIN branches b
    ON b.branch_id = s.branch_id
`;

export const findCustomerSubmissions = async (
  customerId: number,
): Promise<CarSaleSubmission[]> => {
  const [rows] =
    await databasePool.execute<SubmissionRow[]>(
      `
        ${submissionSelect}
        WHERE s.customer_id = ?
        ORDER BY s.created_at DESC,
                 s.submission_id DESC
      `,
      [customerId],
    );

  return rows.map(mapSubmission);
};

export const findCustomerSubmissionById =
  async (
    submissionId: number,
    customerId: number,
  ): Promise<CarSaleSubmission | null> => {
    const [rows] =
      await databasePool.execute<SubmissionRow[]>(
        `
          ${submissionSelect}
          WHERE s.submission_id = ?
            AND s.customer_id = ?
          LIMIT 1
        `,
        [submissionId, customerId],
      );

    const submission = rows[0];

    return submission
      ? mapSubmission(submission)
      : null;
  };

export const createCustomerSubmission =
  async (
    customerId: number,
    input: CreateCarSaleSubmissionInput,
  ): Promise<CarSaleSubmission> => {
    const [result] =
      await databasePool.execute<ResultSetHeader>(
        `
          INSERT INTO car_sale_submissions (
            customer_id,
            branch_id,
            make,
            model,
            year,
            mileage,
            condition_type,
            transmission,
            fuel_type,
            color_exterior,
            expected_price,
            description,
            contact_phone
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
        `,
        [
          customerId,
          input.branch_id,
          input.make,
          input.model,
          input.year ?? null,
          input.mileage ?? null,
          input.condition_type ?? null,
          input.transmission ?? null,
          input.fuel_type ?? null,
          input.color_exterior ?? null,
          input.expected_price ?? null,
          input.description ?? null,
          input.contact_phone ?? null,
        ],
      );

    const submission =
      await findCustomerSubmissionById(
        result.insertId,
        customerId,
      );

    if (!submission) {
      throw new Error(
        "The newly created submission could not be retrieved.",
      );
    }

    return submission;
  };

export const updateCustomerSubmission =
  async (
    submissionId: number,
    customerId: number,
    input: UpdateCarSaleSubmissionInput,
  ): Promise<void> => {
    const updates: string[] = [];

    const values: Array<
      string | number | null
    > = [];

    const add = (
      column: string,
      value: string | number | null,
    ): void => {
      updates.push(`${column} = ?`);
      values.push(value);
    };

    if (input.branch_id !== undefined) {
      add("branch_id", input.branch_id);
    }

    if (input.make !== undefined) {
      add("make", input.make);
    }

    if (input.model !== undefined) {
      add("model", input.model);
    }

    if (input.year !== undefined) {
      add("year", input.year);
    }

    if (input.mileage !== undefined) {
      add("mileage", input.mileage);
    }

    if (input.condition_type !== undefined) {
      add(
        "condition_type",
        input.condition_type,
      );
    }

    if (input.transmission !== undefined) {
      add(
        "transmission",
        input.transmission,
      );
    }

    if (input.fuel_type !== undefined) {
      add("fuel_type", input.fuel_type);
    }

    if (input.color_exterior !== undefined) {
      add(
        "color_exterior",
        input.color_exterior,
      );
    }

    if (input.expected_price !== undefined) {
      add(
        "expected_price",
        input.expected_price,
      );
    }

    if (input.description !== undefined) {
      add(
        "description",
        input.description,
      );
    }

    if (input.contact_phone !== undefined) {
      add(
        "contact_phone",
        input.contact_phone,
      );
    }

    values.push(
      submissionId,
      customerId,
    );

    await databasePool.execute<ResultSetHeader>(
      `
        UPDATE car_sale_submissions
        SET ${updates.join(", ")}
        WHERE submission_id = ?
          AND customer_id = ?
          AND status = 'pending'
      `,
      values,
    );
  };

export const deletePendingCustomerSubmission =
  async (
    submissionId: number,
    customerId: number,
  ): Promise<boolean> => {
    const [result] =
      await databasePool.execute<ResultSetHeader>(
        `
          DELETE FROM car_sale_submissions
          WHERE submission_id = ?
            AND customer_id = ?
            AND status = 'pending'
        `,
        [submissionId, customerId],
      );

    return result.affectedRows > 0;
  };

  interface SubmissionCountRow extends RowDataPacket {
  total: number;
}

export interface AdminSubmissionFilters {
  status?: "pending" | "approved" | "rejected";
  branchId?: number;
  page: number;
  limit: number;
}

export interface AdminSubmissionsResult {
  submissions: CarSaleSubmission[];
  total: number;
}

export const findAdminSubmissions = async (
  filters: AdminSubmissionFilters,
): Promise<AdminSubmissionsResult> => {
  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (filters.status !== undefined) {
    conditions.push("s.status = ?");
    values.push(filters.status);
  }

  if (filters.branchId !== undefined) {
    conditions.push("s.branch_id = ?");
    values.push(filters.branchId);
  }

  const whereClause =
    conditions.length === 0
      ? ""
      : `WHERE ${conditions.join(" AND ")}`;

  const offset =
    (filters.page - 1) * filters.limit;

  const [rows] =
    await databasePool.execute<SubmissionRow[]>(
      `
        ${submissionSelect}
        ${whereClause}
        ORDER BY
          s.created_at DESC,
          s.submission_id DESC
        LIMIT ?
        OFFSET ?
      `,
      [
        ...values,
        filters.limit,
        offset,
      ],
    );

  const [countRows] =
    await databasePool.execute<
      SubmissionCountRow[]
    >(
      `
        SELECT COUNT(*) AS total
        FROM car_sale_submissions s
        ${whereClause}
      `,
      values,
    );

  return {
    submissions: rows.map(mapSubmission),
    total: countRows[0]?.total ?? 0,
  };
};

export const findSubmissionByIdForAdmin =
  async (
    submissionId: number,
  ): Promise<CarSaleSubmission | null> => {
    const [rows] =
      await databasePool.execute<
        SubmissionRow[]
      >(
        `
          ${submissionSelect}
          WHERE s.submission_id = ?
          LIMIT 1
        `,
        [submissionId],
      );

    const submission = rows[0];

    return submission
      ? mapSubmission(submission)
      : null;
  };

  export interface ReviewSubmissionResult {
  submission: CarSaleSubmission;
  createdCarId: number | null;
}

export const reviewPendingSubmission = async (
  submissionId: number,
  adminId: number,
  decision: "approved" | "rejected",
  adminNotes: string | null,
): Promise<ReviewSubmissionResult | null> => {
  const connection =
    await databasePool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] =
      await connection.execute<SubmissionRow[]>(
        `
          ${submissionSelect}
          WHERE s.submission_id = ?
          FOR UPDATE
        `,
        [submissionId],
      );

    const row = rows[0];

    if (!row) {
      await connection.rollback();
      return null;
    }

    if (row.status !== "pending") {
      await connection.rollback();

      return {
        submission: mapSubmission(row),
        createdCarId: null,
      };
    }

    let createdCarId: number | null = null;

    if (decision === "approved") {
      if (
        row.expected_price === null
      ) {
        throw new Error(
          "An approved submission requires an expected price.",
        );
      }

      const referenceNumber =
        `UMW-SUB-${row.submission_id}`;

      const slugBase = [
        row.make,
        row.model,
        row.year,
        row.submission_id,
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined,
        )
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const slug =
        slugBase ||
        `submission-${row.submission_id}`;

      const [carResult] =
        await connection.execute<ResultSetHeader>(
          `
            INSERT INTO cars (
              reference_number,
              slug,
              created_by_admin_id,
              submission_id,
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
              sale_status,
              publication_status,
              is_featured,
              negotiable
            )
            VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?,
              'available',
              'draft',
              0,
              0
            )
          `,
          [
            referenceNumber,
            slug,
            adminId,
            row.submission_id,
            row.branch_id,
            row.make,
            row.model,
            row.year,
            Number(row.expected_price),
            row.mileage,
            row.condition_type,
            row.transmission,
            row.fuel_type,
            row.description,
            row.color_exterior,
          ],
        );

      createdCarId =
        carResult.insertId;

      await connection.execute<ResultSetHeader>(
        `
          UPDATE car_sale_submissions
          SET
            status = 'approved',
            reviewed_by_admin_id = ?,
            admin_notes = ?,
            reviewed_at = CURRENT_TIMESTAMP,
            approved_car_id = ?
          WHERE submission_id = ?
            AND status = 'pending'
        `,
        [
          adminId,
          adminNotes,
          createdCarId,
          submissionId,
        ],
      );
    } else {
      await connection.execute<ResultSetHeader>(
        `
          UPDATE car_sale_submissions
          SET
            status = 'rejected',
            reviewed_by_admin_id = ?,
            admin_notes = ?,
            reviewed_at = CURRENT_TIMESTAMP,
            approved_car_id = NULL
          WHERE submission_id = ?
            AND status = 'pending'
        `,
        [
          adminId,
          adminNotes,
          submissionId,
        ],
      );
    }

    await connection.commit();

    const updated =
      await findSubmissionByIdForAdmin(
        submissionId,
      );

    if (!updated) {
      throw new Error(
        "The reviewed submission could not be retrieved.",
      );
    }

    return {
      submission: updated,
      createdCarId,
    };
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};