"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
  User,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

import Navbar from "@/components/layout/Navbar";
import { registerCustomer } from "@/lib/api/auth";

export default function CustomerRegisterForm() {
  const router = useRouter();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

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

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await registerCustomer({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email:
          email.trim() === ""
            ? undefined
            : email.trim(),
        password,
      });

      router.push(
        "/login?registered=1",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not create your account. Please try again.",
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
                Welcome to UMW
              </p>

              <h1 className="font-heading text-5xl font-bold leading-[1.08]">
                Your vehicles.
                <br />
                Your services.
                <br />
                One account.
              </h1>

              <p className="mt-7 max-w-md text-base leading-8 text-white/70">
                Create your customer
                account to manage vehicle
                submissions, appointments
                and your interactions with
                Unique Mechanical Works.
              </p>

              <div className="mt-10 border-l-2 border-[#D19A24] pl-5">
                <p className="text-sm leading-6 text-white/65">
                  Over 20 years of
                  automotive experience
                  across our Abuja and Kano
                  branches.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
            <div className="w-full max-w-xl">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D19A24]">
                  Create Account
                </p>

                <h2 className="mt-3 font-heading text-3xl font-bold text-[#08294B] sm:text-4xl">
                  Join Unique Mechanical
                  Works
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-[#6B7280]">
                  Create your account
                  using your phone number.
                  Your email address is
                  optional.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {error && (
                  <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="mb-2 block text-sm font-semibold text-[#08294B]"
                    >
                      First name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />

                      <input
                        id="first-name"
                        type="text"
                        value={
                          firstName
                        }
                        onChange={(
                          event,
                        ) =>
                          setFirstName(
                            event.target
                              .value,
                          )
                        }
                        required
                        autoComplete="given-name"
                        placeholder="First name"
                        className="h-12 w-full border border-gray-300 bg-white pl-11 pr-4 text-sm text-[#08294B] outline-none transition placeholder:text-gray-400 focus:border-[#D19A24]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="last-name"
                      className="mb-2 block text-sm font-semibold text-[#08294B]"
                    >
                      Last name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />

                      <input
                        id="last-name"
                        type="text"
                        value={
                          lastName
                        }
                        onChange={(
                          event,
                        ) =>
                          setLastName(
                            event.target
                              .value,
                          )
                        }
                        required
                        autoComplete="family-name"
                        placeholder="Last name"
                        className="h-12 w-full border border-gray-300 bg-white pl-11 pr-4 text-sm text-[#08294B] outline-none transition placeholder:text-gray-400 focus:border-[#D19A24]"
                      />
                    </div>
                  </div>
                </div>

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

                  <p className="mt-2 text-xs leading-5 text-[#6B7280]">
                    You will use this
                    number to sign in to
                    your account.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#08294B]"
                  >
                    Email{" "}
                    <span className="font-normal text-[#6B7280]">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-[#08294B] outline-none transition placeholder:text-gray-400 focus:border-[#D19A24]"
                  />
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
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
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

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-semibold text-[#08294B]"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirm-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value,
                      )
                    }
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-[#08294B] outline-none transition placeholder:text-gray-400 focus:border-[#D19A24]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="flex h-12 w-full items-center justify-center gap-2 bg-[#D19A24] px-5 text-sm font-bold text-[#08294B] transition hover:bg-[#c58e1e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Creating account..."
                    : "Create Account"}

                  {!isSubmitting && (
                    <ArrowRight
                      size={18}
                    />
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-[#6B7280]">
                Already have an
                account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#08294B] transition hover:text-[#D19A24]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}