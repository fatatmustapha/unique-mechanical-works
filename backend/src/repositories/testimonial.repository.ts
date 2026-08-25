import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type { CreateTestimonialInput } from "../validators/testimonial.validator.js";

interface TestimonialRow extends RowDataPacket {
  testimonial_id: number;

  customer_id: number;
  customer_first_name: string;
  customer_last_name: string;

  branch_id: number | null;
  branch_name: string | null;

  service_id: number | null;
  service_name: string | null;

  rating: number;
  comment: string;

  status:
    | "pending"
    | "approved"
    | "rejected";

  reviewed_by_admin_id: number | null;
  reviewed_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

interface TestimonialCountRow extends RowDataPacket {
  total: number;
}

export interface Testimonial {
  testimonial_id: number;

  customer_id: number;

  customer: {
    first_name: string;
    last_name: string;
  };

  branch_id: number | null;
  branch_name: string | null;

  service_id: number | null;
  service_name: string | null;

  rating: number;
  comment: string;

  status:
    | "pending"
    | "approved"
    | "rejected";

  reviewed_by_admin_id: number | null;
  reviewed_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export interface AdminTestimonialFilters {
  status?:
    | "pending"
    | "approved"
    | "rejected";

  branchId?: number;
  serviceId?: number;

  page: number;
  limit: number;
}

export interface AdminTestimonialsResult {
  testimonials: Testimonial[];
  total: number;
}

const testimonialSelect = `
  SELECT
    t.testimonial_id,

    t.customer_id,
    c.first_name AS customer_first_name,
    c.last_name AS customer_last_name,

    t.branch_id,
    b.name AS branch_name,

    t.service_id,
    s.name AS service_name,

    t.rating,
    t.comment,

    t.status,

    t.reviewed_by_admin_id,
    t.reviewed_at,

    t.created_at,
    t.updated_at

  FROM testimonials t

  INNER JOIN customers c
    ON c.customer_id = t.customer_id

  LEFT JOIN branches b
    ON b.branch_id = t.branch_id

  LEFT JOIN services s
    ON s.service_id = t.service_id
`;

const mapTestimonial = (
  row: TestimonialRow,
): Testimonial => ({
  testimonial_id:
    row.testimonial_id,

  customer_id:
    row.customer_id,

  customer: {
    first_name:
      row.customer_first_name,

    last_name:
      row.customer_last_name,
  },

  branch_id:
    row.branch_id,

  branch_name:
    row.branch_name,

  service_id:
    row.service_id,

  service_name:
    row.service_name,

  rating:
    row.rating,

  comment:
    row.comment,

  status:
    row.status,

  reviewed_by_admin_id:
    row.reviewed_by_admin_id,

  reviewed_at:
    row.reviewed_at,

  created_at:
    row.created_at,

  updated_at:
    row.updated_at,
});

export const findApprovedTestimonials =
  async (): Promise<Testimonial[]> => {
    const [rows] =
      await databasePool.execute<
        TestimonialRow[]
      >(
        `
          ${testimonialSelect}

          WHERE t.status = 'approved'

          ORDER BY
            t.created_at DESC,
            t.testimonial_id DESC
        `,
      );

    return rows.map(
      mapTestimonial,
    );
  };

export const findCustomerTestimonials =
  async (
    customerId: number,
  ): Promise<Testimonial[]> => {
    const [rows] =
      await databasePool.execute<
        TestimonialRow[]
      >(
        `
          ${testimonialSelect}

          WHERE t.customer_id = ?

          ORDER BY
            t.created_at DESC,
            t.testimonial_id DESC
        `,
        [customerId],
      );

    return rows.map(
      mapTestimonial,
    );
  };

export const findTestimonialById =
  async (
    testimonialId: number,
  ): Promise<Testimonial | null> => {
    const [rows] =
      await databasePool.execute<
        TestimonialRow[]
      >(
        `
          ${testimonialSelect}

          WHERE t.testimonial_id = ?

          LIMIT 1
        `,
        [testimonialId],
      );

    const testimonial =
      rows[0];

    return testimonial
      ? mapTestimonial(
          testimonial,
        )
      : null;
  };

export const createCustomerTestimonial =
  async (
    customerId: number,
    input: CreateTestimonialInput,
  ): Promise<Testimonial> => {
    const [result] =
      await databasePool.execute<
        ResultSetHeader
      >(
        `
          INSERT INTO testimonials (
            customer_id,
            branch_id,
            service_id,
            rating,
            comment
          )

          VALUES (?, ?, ?, ?, ?)
        `,
        [
          customerId,
          input.branch_id ?? null,
          input.service_id ?? null,
          input.rating,
          input.comment,
        ],
      );

    const testimonial =
      await findTestimonialById(
        result.insertId,
      );

    if (!testimonial) {
      throw new Error(
        "The newly created testimonial could not be retrieved.",
      );
    }

    return testimonial;
  };

export const findAdminTestimonials =
  async (
    filters: AdminTestimonialFilters,
  ): Promise<AdminTestimonialsResult> => {
    const conditions: string[] = [];

    const values: Array<
      string | number
    > = [];

    if (
      filters.status !== undefined
    ) {
      conditions.push(
        "t.status = ?",
      );

      values.push(
        filters.status,
      );
    }

    if (
      filters.branchId !== undefined
    ) {
      conditions.push(
        "t.branch_id = ?",
      );

      values.push(
        filters.branchId,
      );
    }

    if (
      filters.serviceId !== undefined
    ) {
      conditions.push(
        "t.service_id = ?",
      );

      values.push(
        filters.serviceId,
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(
            " AND ",
          )}`
        : "";

    const offset =
      (filters.page - 1) *
      filters.limit;

    const [rows] =
      await databasePool.execute<
        TestimonialRow[]
      >(
        `
          ${testimonialSelect}

          ${whereClause}

          ORDER BY
            t.created_at DESC,
            t.testimonial_id DESC

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
        TestimonialCountRow[]
      >(
        `
          SELECT COUNT(*) AS total

          FROM testimonials t

          ${whereClause}
        `,
        values,
      );

    return {
      testimonials:
        rows.map(
          mapTestimonial,
        ),

      total:
        countRows[0]?.total ??
        0,
    };
  };

export const reviewTestimonial =
  async (
    testimonialId: number,
    adminId: number,
    status:
      | "approved"
      | "rejected",
  ): Promise<boolean> => {
    const [result] =
      await databasePool.execute<
        ResultSetHeader
      >(
        `
          UPDATE testimonials

          SET
            status = ?,
            reviewed_by_admin_id = ?,
            reviewed_at =
              CURRENT_TIMESTAMP

          WHERE testimonial_id = ?
        `,
        [
          status,
          adminId,
          testimonialId,
        ],
      );

    return (
      result.affectedRows >
      0
    );
  };

export const deleteTestimonial =
  async (
    testimonialId: number,
  ): Promise<boolean> => {
    const [result] =
      await databasePool.execute<
        ResultSetHeader
      >(
        `
          DELETE FROM testimonials

          WHERE testimonial_id = ?
        `,
        [testimonialId],
      );

    return (
      result.affectedRows >
      0
    );
  };