"use client";

import { LoaderCircle, ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "@/lib/api/auth";

type AdminGuardProps = {
  children: ReactNode;
};

type GuardStatus =
  | "checking"
  | "authorized"
  | "unauthorized";

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] =
    useState<GuardStatus>("checking");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      /*
       * /admin/login must remain publicly accessible.
       */
      if (pathname === "/admin/login") {
        if (active) {
          setStatus("authorized");
        }

        return;
      }

      try {
        const response = await getCurrentUser();

        if (!active) {
          return;
        }

        if (
          response.data?.accountType !== "admin"
        ) {
          setStatus("unauthorized");
          router.replace("/admin/login");
          return;
        }

        setStatus("authorized");
      } catch {
        if (!active) {
          return;
        }

        setStatus("unauthorized");
        router.replace("/admin/login");
      }
    }

    void verifyAdmin();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  /*
   * Never protect the login page itself.
   */
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f4ef] px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-prussian text-bronze">
            <LoaderCircle
              size={28}
              className="animate-spin"
            />
          </div>

          <p className="mt-5 font-heading text-xl font-semibold text-prussian">
            Verifying administrator
          </p>

          <p className="mt-2 text-sm text-slate">
            Checking your secure session...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f4ef] px-6">
        <div className="text-center">
          <ShieldAlert
            size={34}
            className="mx-auto text-mahogany"
          />

          <p className="mt-4 font-heading text-xl font-semibold text-prussian">
            Admin authentication required
          </p>

          <p className="mt-2 text-sm text-slate">
            Redirecting to the Admin Portal...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}