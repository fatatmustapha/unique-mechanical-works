import type { RowDataPacket } from "mysql2";

import { databasePool } from "../config/database.js";

interface CountRow extends RowDataPacket {
  total: number;
}

interface MoneyRow extends RowDataPacket {
  total: string | number | null;
}

export interface DashboardSummary {
  customers: {
    total: number;
    active: number;
  };

  cars: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    available: number;
    reserved: number;
    sold: number;
    featured: number;
  };

  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };

  car_sale_submissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };

  testimonials: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };

  invoices: {
    total: number;
    pending: number;
    partial: number;
    paid: number;
    total_billed: number;
    total_collected: number;
    outstanding: number;
  };
}

const getCount = async (
  sql: string,
): Promise<number> => {
  const [rows] =
    await databasePool.execute<CountRow[]>(
      sql,
    );

  return rows[0]?.total ?? 0;
};

const getMoney = async (
  sql: string,
): Promise<number> => {
  const [rows] =
    await databasePool.execute<MoneyRow[]>(
      sql,
    );

  return Number(
    rows[0]?.total ?? 0,
  );
};

export const getDashboardSummary =
  async (): Promise<DashboardSummary> => {
    const [
      totalCustomers,
      activeCustomers,

      totalCars,
      publishedCars,
      draftCars,
      archivedCars,
      availableCars,
      reservedCars,
      soldCars,
      featuredCars,

      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,

      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,

      totalTestimonials,
      pendingTestimonials,
      approvedTestimonials,
      rejectedTestimonials,

      totalInvoices,
      pendingInvoices,
      partialInvoices,
      paidInvoices,

      totalBilled,
      totalCollected,
    ] = await Promise.all([
      getCount(
        `
          SELECT COUNT(*) AS total
          FROM customers
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM customers
          WHERE is_active = 1
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM cars
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM cars
          WHERE publication_status = 'published'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM cars
          WHERE publication_status = 'draft'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM cars
          WHERE publication_status = 'archived'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM cars
          WHERE sale_status = 'available'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM cars
          WHERE sale_status = 'reserved'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM cars
          WHERE sale_status = 'sold'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM cars
          WHERE is_featured = 1
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM appointments
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM appointments
          WHERE status = 'pending'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM appointments
          WHERE status = 'confirmed'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM appointments
          WHERE status = 'completed'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM appointments
          WHERE status = 'cancelled'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM car_sale_submissions
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM car_sale_submissions
          WHERE status = 'pending'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM car_sale_submissions
          WHERE status = 'approved'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM car_sale_submissions
          WHERE status = 'rejected'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM testimonials
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM testimonials
          WHERE status = 'pending'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM testimonials
          WHERE status = 'approved'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM testimonials
          WHERE status = 'rejected'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM invoices
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM invoices
          WHERE payment_status = 'pending'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM invoices
          WHERE payment_status = 'partial'
        `,
      ),

      getCount(
        `
          SELECT COUNT(*) AS total
          FROM invoices
          WHERE payment_status = 'paid'
        `,
      ),

      getMoney(
        `
          SELECT COALESCE(
            SUM(total_amount),
            0
          ) AS total
          FROM invoices
        `,
      ),

      getMoney(
        `
          SELECT COALESCE(
            SUM(amount_paid),
            0
          ) AS total
          FROM invoices
        `,
      ),
    ]);

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
      },

      cars: {
        total: totalCars,
        published: publishedCars,
        draft: draftCars,
        archived: archivedCars,
        available: availableCars,
        reserved: reservedCars,
        sold: soldCars,
        featured: featuredCars,
      },

      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
      },

      car_sale_submissions: {
        total: totalSubmissions,
        pending: pendingSubmissions,
        approved: approvedSubmissions,
        rejected: rejectedSubmissions,
      },

      testimonials: {
        total: totalTestimonials,
        pending: pendingTestimonials,
        approved: approvedTestimonials,
        rejected: rejectedTestimonials,
      },

      invoices: {
        total: totalInvoices,
        pending: pendingInvoices,
        partial: partialInvoices,
        paid: paidInvoices,

        total_billed:
          totalBilled,

        total_collected:
          totalCollected,

        outstanding:
          Math.max(
            totalBilled -
              totalCollected,
            0,
          ),
      },
    };
  };