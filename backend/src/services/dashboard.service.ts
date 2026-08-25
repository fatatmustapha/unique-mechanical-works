import {
  getDashboardSummary,
  type DashboardSummary,
} from "../repositories/dashboard.repository.js";

export const getAdminDashboardSummary =
  async (): Promise<DashboardSummary> => {
    return getDashboardSummary();
  };