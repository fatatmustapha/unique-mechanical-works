"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CarFront,
  FileText,
  LogOut,
  MessageSquareQuote,
  Store,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "@/lib/api/auth";

const dashboardItems = [
  {
    title: "Vehicles",
    description:
      "Add, edit, publish and manage vehicles for sale.",
    href: "/admin/vehicles",
    action: "Manage Vehicles",
    icon: CarFront,
  },
  {
    title: "Car Submissions",
    description:
      "Review vehicles submitted by customers.",
    href: "/admin/car-submissions",
    action: "Review Submissions",
    icon: Store,
  },
  {
    title: "Appointments",
    description:
      "Manage customer service appointments.",
    href: "/admin/appointments",
    action: "Manage Appointments",
    icon: CalendarDays,
  },
  {
    title: "Services",
    description:
      "Manage workshop services and branch availability.",
    href: "/admin/services",
    action: "Manage Services",
    icon: Wrench,
  },
  {
    title: "Invoices",
    description:
      "View and manage customer invoices.",
    href: "/admin/invoices",
    action: "Manage Invoices",
    icon: FileText,
  },
  {
    title: "Testimonials",
    description:
      "Review and moderate customer testimonials.",
    href: "/admin/testimonials",
    action: "Manage Testimonials",
    icon: MessageSquareQuote,
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);
      await logout();
    } catch {
      // Redirect even if the server logout request fails.
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef]">
      {/* ADMIN HEADER */}
      <header className="border-b border-white/10 bg-prussian text-white">
        <div className="mx-auto flex min-h-28 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          {/* LOGO + ADMIN TITLE */}
          <Link
            href="/admin"
            className="flex items-center gap-4"
          >
            <Image
              src="/brand/umw-logo.png"
              alt="Unique Mechanical Works"
              width={80}
              height={80}
              priority
              className="h-[68px] w-auto object-contain"
            />

            <div className="border-l border-white/15 pl-4">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-bronze">
                Unique Mechanical Works
              </p>

              <p className="mt-1 font-heading text-xl font-semibold text-white">
                Administration
              </p>
            </div>
          </Link>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:border-bronze hover:text-bronze disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={17} />

            {loggingOut
              ? "Signing Out..."
              : "Sign Out"}
          </button>
        </div>
      </header>

      {/* PAGE */}
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <section>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-bronze">
            Administration Portal
          </p>

          <h1 className="mt-4 max-w-4xl font-heading text-4xl font-bold tracking-[-0.035em] text-prussian sm:text-5xl">
            Manage Unique Mechanical Works
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate">
            Manage vehicles, workshop operations,
            customer activity and business content
            from one secure dashboard.
          </p>
        </section>

        {/* MANAGEMENT */}
        <section className="mt-14">
          <div className="border-b border-prussian/10 pb-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-bronze">
              Dashboard
            </p>

            <h2 className="mt-2 font-heading text-2xl font-bold text-prussian">
              Management Overview
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dashboardItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-[285px] flex-col border border-prussian/10 bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-bronze/50 hover:shadow-[0_24px_55px_rgba(11,37,69,0.12)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center bg-prussian text-bronze transition-transform duration-300 group-hover:scale-105">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-7 font-heading text-2xl font-semibold text-prussian">
                    {item.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-7 text-slate">
                    {item.description}
                  </p>

                  <div className="mt-7 border-t border-prussian/10 pt-5">
                    <span className="inline-flex items-center text-sm font-semibold text-prussian transition-colors duration-300 group-hover:text-bronze">
                      {item.action}

                      <span
                        aria-hidden="true"
                        className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}