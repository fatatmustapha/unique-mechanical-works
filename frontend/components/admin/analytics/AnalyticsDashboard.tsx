"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CarFront,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "@/lib/admin-analytics";

export default function AnalyticsDashboard() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchDashboardSummary();

        setSummary(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load analytics.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="border border-prussian/10 bg-white p-8 text-sm text-slate">
        Loading business analytics...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error ?? "Analytics data is unavailable."}
      </div>
    );
  }

  const statistics = [
    {
      title: "Total Customers",
      value: summary.customers.total,
      detail: `${summary.customers.active} active customers`,
      icon: Users,
    },
    {
      title: "Cars for Sale",
      value: summary.cars.total,
      detail: `${summary.cars.published} published vehicles`,
      icon: CarFront,
    },
    {
      title: "Total Appointments",
      value: summary.appointments.total,
      detail: `${summary.appointments.pending} pending appointments`,
      icon: CalendarDays,
    },
    {
      title: "Car Sale Submissions",
      value: summary.car_sale_submissions.total,
      detail: `${summary.car_sale_submissions.pending} pending reviews`,
      icon: ClipboardList,
    },
  ];

  return (
    <section className="mt-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <div
              key={statistic.title}
              className="border border-prussian/10 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate">
                  {statistic.title}
                </p>

                <div className="flex h-11 w-11 items-center justify-center bg-prussian text-bronze">
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-6 font-heading text-4xl font-bold text-prussian">
                {statistic.value.toLocaleString()}
              </p>

              <p className="mt-3 border-t border-prussian/10 pt-4 text-xs text-slate">
                {statistic.detail}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}