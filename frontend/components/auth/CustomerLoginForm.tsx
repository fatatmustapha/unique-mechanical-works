"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

import Navbar from "@/components/layout/Navbar";
import { loginCustomer } from "@/lib/api/auth";

export default function CustomerLoginForm() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const registered =
    searchParams.get(
      "registered",
    ) === "1";

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    try {
      setIsSubmitting(true);

      await loginCustomer({
        phone: phone.trim(),
        password,
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar solid />

      <main className="min-h-screen bg-[#F7F7F5] pt-20 lg:pt-24">
        <div className="grid min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[0.85fr_1.15fr]">
          <section className="hidden bg-[#08294B] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-center">
            <div className="mx-auto w-full max-w-lg">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#D19A24]">
                Welcome Back
              </p>

              <h1 className="font-heading text-5xl font-bold leading-[1.08]">
                Everything you need,
                <br />
                all in one place.
              </h1>

              <p className="mt-7 max-w-md text-base leading-8 text-white/70">
                Sign in to manage your
                vehicle submissions,
                service appointments and
                your interactions with
                Unique Mechanical Works.
              </p>

              <div className="mt-10 border-l-2 border-[#D19A24] pl-5">
                <p className="text-sm leading-6 text-white/65">
                  Premium vehicles,
                  professional mechanical
                  services and trusted
                  customer support.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
            <div className="w-full max-w-lg">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D19A24]">
                  Customer Login
                </p>

                <h2 className="mt-3 font-heading text-3xl font-bold text-[#08294B] sm:text-4xl">
                  Sign in to your
                  account
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                  Use the phone number
                  associated with your
                  Unique Mechanical Works
                  account.
                </p>
              </div>

              {registered && (
                <div className="mt-7 border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                  Your account was
                  created successfully.
                  You can now sign in.
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {error && (
                  <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[#08294B]"
                  >
                    Phone number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                    />

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(
                        event,
                      ) =>
                        setPhone(
                          event.target
                            .value,
                        )
                      }
                      required
                      autoComplete="tel"
                      placeholder="+234 803 123 4567"
                      className="h-12 w-full border border-gray-300 bg-white pl-11 pr-4 text-sm text-[#08294B] outline-none transition placeholder:text-gray-400 focus:border-[#D19A24]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#08294B]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(
                        event,
                      ) =>
                        setPassword(
                          event.target
                            .value,
                        )
                      }
                      required
                      maxLength={72}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-12 w-full border border-gray-300 bg-white pl-11 pr-12 text-sm text-[#08294B] outline-none transition placeholder:text-gray-400 focus:border-[#D19A24]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current,
                          ) =>
                            !current,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] transition hover:text-[#08294B]"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="flex h-12 w-full items-center justify-center gap-2 bg-[#D19A24] px-5 text-sm font-bold text-[#08294B] transition hover:bg-[#c58e1e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Signing in..."
                    : "Sign In"}

                  {!isSubmitting && (
                    <ArrowRight
                      size={18}
                    />
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-[#6B7280]">
                Don&apos;t have an
                account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#08294B] transition hover:text-[#D19A24]"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}