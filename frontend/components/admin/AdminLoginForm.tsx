"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { loginAdmin } from "@/lib/api/auth";

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please enter your admin email address and password.",
      );
      return;
    }

    try {
      setLoading(true);

      await loginAdmin({
        email: cleanEmail,
        password,
      });

      router.replace("/admin");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10"
      noValidate
    >
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 border border-mahogany/20 bg-mahogany/5 px-4 py-4"
        >
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-mahogany"
          />

          <p className="text-sm leading-6 text-mahogany">
            {error}
          </p>
        </div>
      )}

      <label className="block">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
          Admin Email
        </span>

        <div className="relative mt-2">
          <Mail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
          />

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            placeholder="admin@example.com"
            disabled={loading}
            className="h-14 w-full border border-prussian/15 bg-white pl-12 pr-4 text-sm text-prussian outline-none transition-colors placeholder:text-slate/50 focus:border-bronze disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </label>

      <label className="mt-6 block">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
          Password
        </span>

        <div className="relative mt-2">
          <LockKeyhole
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
          />

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={loading}
            className="h-14 w-full border border-prussian/15 bg-white pl-12 pr-12 text-sm text-prussian outline-none transition-colors placeholder:text-slate/50 focus:border-bronze disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current,
              )
            }
            disabled={loading}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate transition-colors hover:text-prussian disabled:cursor-not-allowed"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 flex min-h-14 w-full items-center justify-center bg-bronze px-6 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
      >
        {loading ? (
          <>
            <LoaderCircle
              size={19}
              className="mr-3 animate-spin"
            />
            Signing in...
          </>
        ) : (
          "Sign In to Admin Dashboard"
        )}
      </button>

      <p className="mt-6 text-center text-xs leading-6 text-slate">
        Authorized Unique Mechanical Works personnel only.
      </p>
    </form>
  );
}