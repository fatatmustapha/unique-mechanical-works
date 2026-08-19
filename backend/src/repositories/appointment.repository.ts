import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type {
  CreateAppointmentInput,
  UpdateAppointmentAdminInput,
} from "../validators/appointment.validator.js";

interface AppointmentRow extends RowDataPacket {
  appointment_id: number;
  customer_id: number;

  service_id: number;
  service_name: string;

  branch_id: number;
  branch_name: string;

  scheduled_at: Date;

  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_plate_number: string | null;

  customer_notes: string | null;
  admin_notes: string | null;

  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";

  cancelled_at: Date | null;
  completed_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

interface AppointmentCountRow extends RowDataPacket {
  total: number;
}

export interface Appointment {
  appointment_id: number;
  customer_id: number;

  service_id: number;
  service_name: string;

  branch_id: number;
  branch_name: string;

  scheduled_at: Date;

  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_plate_number: string | null;

  customer_notes: string | null;
  admin_notes: string | null;

  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";

  cancelled_at: Date | null;
  completed_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export interface AdminAppointmentFilters {
  status?:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";

  branchId?: number;
  serviceId?: number;

  page: number;
  limit: number;
}

export interface AdminAppointmentsResult {
  appointments: Appointment[];
  total: number;
}

const appointmentSelect = `
  SELECT
    a.appointment_id,
    a.customer_id,

    a.service_id,
    s.name AS service_name,

    a.branch_id,
    b.name AS branch_name,

    a.scheduled_at,

    a.vehicle_make,
    a.vehicle_model,
    a.vehicle_year,
    a.vehicle_plate_number,

    a.customer_notes,
    a.admin_notes,

    a.status,
    a.cancelled_at,
    a.completed_at,

    a.created_at,
    a.updated_at

  FROM appointments a

  INNER JOIN services s
    ON s.service_id = a.service_id

  INNER JOIN branches b
    ON b.branch_id = a.branch_id
`;

const mapAppointment = (
  row: AppointmentRow,
): Appointment => {
  return {
    appointment_id: row.appointment_id,
    customer_id: row.customer_id,

    service_id: row.service_id,
    service_name: row.service_name,

    branch_id: row.branch_id,
    branch_name: row.branch_name,

    scheduled_at: row.scheduled_at,

    vehicle_make: row.vehicle_make,
    vehicle_model: row.vehicle_model,
    vehicle_year: row.vehicle_year,
    vehicle_plate_number:
      row.vehicle_plate_number,

    customer_notes: row.customer_notes,
    admin_notes: row.admin_notes,

    status: row.status,

    cancelled_at: row.cancelled_at,
    completed_at: row.completed_at,

    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const findCustomerAppointments = async (
  customerId: number,
): Promise<Appointment[]> => {
  const [rows] =
    await databasePool.execute<AppointmentRow[]>(
      `
        ${appointmentSelect}

        WHERE a.customer_id = ?

        ORDER BY
          a.scheduled_at DESC,
          a.appointment_id DESC
      `,
      [customerId],
    );

  return rows.map(mapAppointment);
};

export const findCustomerAppointmentById =
  async (
    appointmentId: number,
    customerId: number,
  ): Promise<Appointment | null> => {
    const [rows] =
      await databasePool.execute<
        AppointmentRow[]
      >(
        `
          ${appointmentSelect}

          WHERE a.appointment_id = ?
            AND a.customer_id = ?

          LIMIT 1
        `,
        [
          appointmentId,
          customerId,
        ],
      );

    const appointment = rows[0];

    return appointment
      ? mapAppointment(appointment)
      : null;
  };

export const createCustomerAppointment =
  async (
    customerId: number,
    input: CreateAppointmentInput,
  ): Promise<Appointment> => {
    const [result] =
      await databasePool.execute<ResultSetHeader>(
        `
          INSERT INTO appointments (
            customer_id,
            service_id,
            branch_id,
            scheduled_at,
            vehicle_make,
            vehicle_model,
            vehicle_year,
            vehicle_plate_number,
            customer_notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          customerId,
          input.service_id,
          input.branch_id,
          new Date(input.scheduled_at),

          input.vehicle_make ?? null,
          input.vehicle_model ?? null,
          input.vehicle_year ?? null,
          input.vehicle_plate_number ?? null,

          input.customer_notes ?? null,
        ],
      );

    const appointment =
      await findCustomerAppointmentById(
        result.insertId,
        customerId,
      );

    if (!appointment) {
      throw new Error(
        "The newly created appointment could not be retrieved.",
      );
    }

    return appointment;
  };

export const cancelCustomerAppointment =
  async (
    appointmentId: number,
    customerId: number,
  ): Promise<boolean> => {
    const [result] =
      await databasePool.execute<ResultSetHeader>(
        `
          UPDATE appointments

          SET
            status = 'cancelled',
            cancelled_at = CURRENT_TIMESTAMP

          WHERE appointment_id = ?
            AND customer_id = ?
            AND status IN (
              'pending',
              'confirmed'
            )
        `,
        [
          appointmentId,
          customerId,
        ],
      );

    return result.affectedRows > 0;
  };

export const findAdminAppointments = async (
  filters: AdminAppointmentFilters,
): Promise<AdminAppointmentsResult> => {
  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (filters.status !== undefined) {
    conditions.push("a.status = ?");
    values.push(filters.status);
  }

  if (filters.branchId !== undefined) {
    conditions.push("a.branch_id = ?");
    values.push(filters.branchId);
  }

  if (filters.serviceId !== undefined) {
    conditions.push("a.service_id = ?");
    values.push(filters.serviceId);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const offset =
    (filters.page - 1) * filters.limit;

  const [rows] =
    await databasePool.execute<AppointmentRow[]>(
      `
        ${appointmentSelect}

        ${whereClause}

        ORDER BY
          a.scheduled_at DESC,
          a.appointment_id DESC

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
      AppointmentCountRow[]
    >(
      `
        SELECT COUNT(*) AS total
        FROM appointments a
        ${whereClause}
      `,
      values,
    );

  return {
    appointments: rows.map(mapAppointment),
    total: countRows[0]?.total ?? 0,
  };
};

export const findAppointmentByIdForAdmin =
  async (
    appointmentId: number,
  ): Promise<Appointment | null> => {
    const [rows] =
      await databasePool.execute<
        AppointmentRow[]
      >(
        `
          ${appointmentSelect}

          WHERE a.appointment_id = ?

          LIMIT 1
        `,
        [appointmentId],
      );

    const appointment = rows[0];

    return appointment
      ? mapAppointment(appointment)
      : null;
  };

export const updateAppointmentForAdmin =
  async (
    appointmentId: number,
    input: UpdateAppointmentAdminInput,
  ): Promise<void> => {
    const updates: string[] = [];

    const values: Array<
      string | number | Date | null
    > = [];

    const add = (
      column: string,
      value: string | number | Date | null,
    ): void => {
      updates.push(`${column} = ?`);
      values.push(value);
    };

    if (input.service_id !== undefined) {
      add("service_id", input.service_id);
    }

    if (input.branch_id !== undefined) {
      add("branch_id", input.branch_id);
    }

    if (input.scheduled_at !== undefined) {
      add(
        "scheduled_at",
        new Date(input.scheduled_at),
      );
    }

    if (input.vehicle_make !== undefined) {
      add(
        "vehicle_make",
        input.vehicle_make,
      );
    }

    if (input.vehicle_model !== undefined) {
      add(
        "vehicle_model",
        input.vehicle_model,
      );
    }

    if (input.vehicle_year !== undefined) {
      add(
        "vehicle_year",
        input.vehicle_year,
      );
    }

    if (
      input.vehicle_plate_number !== undefined
    ) {
      add(
        "vehicle_plate_number",
        input.vehicle_plate_number,
      );
    }

    if (input.customer_notes !== undefined) {
      add(
        "customer_notes",
        input.customer_notes,
      );
    }

    if (input.admin_notes !== undefined) {
      add(
        "admin_notes",
        input.admin_notes,
      );
    }

    values.push(appointmentId);

    await databasePool.execute<ResultSetHeader>(
      `
        UPDATE appointments

        SET ${updates.join(", ")}

        WHERE appointment_id = ?
      `,
      values,
    );
  };

export const updateAppointmentStatus = async (
  appointmentId: number,
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled",
  adminNotes: string | null | undefined,
): Promise<void> => {
  if (status === "completed") {
    await databasePool.execute<ResultSetHeader>(
      `
        UPDATE appointments
        SET
          status = 'completed',
          completed_at = CURRENT_TIMESTAMP,
          cancelled_at = NULL,
          admin_notes = COALESCE(?, admin_notes)
        WHERE appointment_id = ?
      `,
      [
        adminNotes ?? null,
        appointmentId,
      ],
    );

    return;
  }

  if (status === "cancelled") {
    await databasePool.execute<ResultSetHeader>(
      `
        UPDATE appointments
        SET
          status = 'cancelled',
          cancelled_at = CURRENT_TIMESTAMP,
          completed_at = NULL,
          admin_notes = COALESCE(?, admin_notes)
        WHERE appointment_id = ?
      `,
      [
        adminNotes ?? null,
        appointmentId,
      ],
    );

    return;
  }

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE appointments
      SET
        status = ?,
        cancelled_at = NULL,
        completed_at = NULL,
        admin_notes = COALESCE(?, admin_notes)
      WHERE appointment_id = ?
    `,
    [
      status,
      adminNotes ?? null,
      appointmentId,
    ],
  );
};