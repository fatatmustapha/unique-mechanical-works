"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CarFront,
  ChevronRight,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import Navbar from "@/components/layout/Navbar";
import {
  getCurrentUser,
  logout,
} from "@/lib/api/auth";

import type { Customer } from "@/types/auth";

export default function CustomerDashboardPage() {
  const router = useRouter();

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      try {
        const response =
          await getCurrentUser();

        if (!active) {
          return;
        }

        if (
          response.data.accountType !==
          "customer"
        ) {
          router.replace("/login");
          return;
        }

        setCustomer(
          response.data.customer,
        );
      } catch {
        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCustomer();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logout();

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not log you out. Please try again.",
      );

      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar solid />

        <main className="min-h-screen bg-[#F7F7F5] pt-20 lg:pt-24">
          <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 lg:px-12">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200" />
              <div className="mt-4 h-10 w-72 bg-gray-200" />

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                <div className="h-48 bg-white" />
                <div className="h-48 bg-white" />
                <div className="h-48 bg-white" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!customer) {
    return null;
  }

  const fullName =
    `${customer.first_name} ${customer.last_name}`.trim();

  return (
    <>
      <Navbar solid />

      <main className="min-h-screen bg-[#F7F7F5] pt-20 lg:pt-24">
        {/* Welcome */}
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D19A24]">
              My Account
            </p>

            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-bold text-[#08294B] sm:text-4xl">
                  Welcome,{" "}
                  {customer.first_name}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  Manage your vehicle
                  submissions, service
                  appointments and account
                  information from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex h-11 w-fit items-center justify-center gap-2 border border-gray-300 bg-white px-5 text-sm font-semibold text-[#6B1D1D] transition hover:border-[#6B1D1D] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={17} />

                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </button>
            </div>

            {error && (
              <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
          {/* Main actions */}
          <section>
            <div className="grid gap-5 md:grid-cols-2">
              <Link
                href="/sell-your-car"
                className="group border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#08294B] text-white">
                    <CarFront size={23} />
                  </div>

                  <ChevronRight
                    size={21}
                    className="text-[#6B7280] transition duration-300 group-hover:translate-x-1 group-hover:text-[#D19A24]"
                  />
                </div>

                <h2 className="mt-6 text-xl font-bold text-[#08294B]">
                  Sell Your Car
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Submit your vehicle to
                  Unique Mechanical Works
                  for review.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#D19A24]">
                  <Plus size={17} />
                  New submission
                </div>
              </Link>

              <Link
                href="/book-appointment"
                className="group border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#08294B] text-white">
                    <CalendarDays
                      size={23}
                    />
                  </div>

                  <ChevronRight
                    size={21}
                    className="text-[#6B7280] transition duration-300 group-hover:translate-x-1 group-hover:text-[#D19A24]"
                  />
                </div>

                <h2 className="mt-6 text-xl font-bold text-[#08294B]">
                  Book a Service
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Schedule your next
                  vehicle service with our
                  mechanical team.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#D19A24]">
                  <Plus size={17} />
                  Book appointment
                </div>
              </Link>
            </div>
          </section>

          {/* Account overview */}
          <section className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-[#08294B]">
                    My Activity
                  </h2>

                  <p className="mt-1 text-sm text-[#6B7280]">
                    Your recent UMW
                    activity will appear
                    here.
                  </p>
                </div>
              </div>

              <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
                <div className="bg-white p-6">
                  <div className="flex items-center gap-3">
                    <CarFront
                      size={20}
                      className="text-[#D19A24]"
                    />

                    <h3 className="font-bold text-[#08294B]">
                      Car Submissions
                    </h3>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#6B7280]">
                    Once you submit a
                    vehicle, you&apos;ll be
                    able to track its
                    review status here.
                  </p>

                  <Link
                    href="/sell-your-car"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#08294B] transition hover:text-[#D19A24]"
                  >
                    Sell your car
                    <ChevronRight
                      size={16}
                    />
                  </Link>
                </div>

                <div className="bg-white p-6">
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={20}
                      className="text-[#D19A24]"
                    />

                    <h3 className="font-bold text-[#08294B]">
                      Appointments
                    </h3>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#6B7280]">
                    Your upcoming service
                    appointments will be
                    available from your
                    account.
                  </p>

                  <Link
                    href="/book-appointment"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#08294B] transition hover:text-[#D19A24]"
                  >
                    Book service
                    <ChevronRight
                      size={16}
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile */}
            <aside className="border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <UserRound
                    size={20}
                    className="text-[#D19A24]"
                  />

                  <h2 className="text-lg font-bold text-[#08294B]">
                    Profile
                  </h2>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6B7280]">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#08294B]">
                    {fullName}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Phone size={15} />

                    <p className="text-xs font-bold uppercase tracking-[0.12em]">
                      Phone
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-[#08294B]">
                    {customer.phone}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Mail size={15} />

                    <p className="text-xs font-bold uppercase tracking-[0.12em]">
                      Email
                    </p>
                  </div>

                  <p className="mt-1 break-words text-sm font-semibold text-[#08294B]">
                    {customer.email ??
                      "Not provided"}
                  </p>
                </div>

                {customer.address && (
                  <div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <MapPin
                        size={15}
                      />

                      <p className="text-xs font-bold uppercase tracking-[0.12em]">
                        Address
                      </p>
                    </div>

                    <p className="mt-1 text-sm font-semibold leading-6 text-[#08294B]">
                      {customer.address}
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}