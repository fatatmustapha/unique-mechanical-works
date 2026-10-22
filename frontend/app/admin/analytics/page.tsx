import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";

export default function AdminAnalyticsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="border-b border-prussian/10 pb-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-bronze">
          UMW Administration
        </p>

        <h1 className="mt-2 font-heading text-3xl font-bold text-prussian">
          Business Analytics
        </h1>

        <p className="mt-3 text-sm text-slate">
          Monitor workshop performance, customers, appointments,
          and vehicle activity.
        </p>
      </div>

      <AnalyticsDashboard />
    </main>
  );
}