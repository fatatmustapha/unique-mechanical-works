import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-snow">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        {/* DESKTOP BRAND PANEL */}
        <section className="relative hidden overflow-hidden bg-prussian lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/5"
          />

          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-bronze/10"
          />

          {/* LOGO */}
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-block"
            >
              <Image
                src="/brand/umw-logo.png"
                alt="Unique Mechanical Works"
                width={180}
                height={90}
                priority
                className="h-auto w-[170px] object-contain"
              />
            </Link>
          </div>

          {/* MESSAGE */}
          <div className="relative z-10 max-w-xl pb-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-bronze" />

              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-bronze">
                Administration
              </p>
            </div>

            <h1 className="mt-7 font-heading text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">
              Manage the business
              <br />
              behind the
              <br />
              experience.
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-white/65">
              Manage vehicle inventory, customer activity,
              services, branches and day-to-day operations
              from one secure UMW workspace.
            </p>
          </div>

          <p className="relative z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            Unique Mechanical Works
          </p>
        </section>

        {/* LOGIN PANEL */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-14 xl:px-20">
          <div className="w-full max-w-[470px]">
            {/* MOBILE LOGO */}
            <div className="mb-12 lg:hidden">
              <Link href="/">
                <Image
                  src="/brand/umw-logo.png"
                  alt="Unique Mechanical Works"
                  width={150}
                  height={75}
                  priority
                  className="h-auto w-[145px] object-contain"
                />
              </Link>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate transition-colors hover:text-prussian"
            >
              <ArrowLeft size={16} />
              Back to website
            </Link>

            <div className="mt-10 flex h-12 w-12 items-center justify-center bg-bronze text-prussian">
              <ShieldCheck size={23} />
            </div>

            <p className="mt-8 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-bronze">
              Secure Access
            </p>

            <h2 className="mt-3 font-heading text-4xl font-bold tracking-[-0.035em] text-prussian sm:text-5xl">
              Admin Login
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate">
              Sign in using your administrator email and
              password to access the Unique Mechanical Works
              management dashboard.
            </p>

            <AdminLoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}