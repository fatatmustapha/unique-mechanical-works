"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Car,
  CheckCircle2,
  Loader2,
  Phone,
} from "lucide-react";

import CustomerSelect from "@/components/customer/CustomerSelect";

import {
  createCarSaleSubmission,
  type CreateCarSaleSubmissionInput,
} from "@/lib/api/car-sale-submissions";

import {
  getBranches,
  type Branch,
} from "@/lib/api/branches";

import {
  getCurrentUser,
} from "@/lib/api/auth";

type FormState = {
  branch_id: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  condition_type: string;
  transmission: string;
  fuel_type: string;
  color_exterior: string;
  expected_price: string;
  description: string;
  contact_phone: string;
};

const initialForm: FormState = {
  branch_id: "",
  make: "",
  model: "",
  year: "",
  mileage: "",
  condition_type: "",
  transmission: "",
  fuel_type: "",
  color_exterior: "",
  expected_price: "",
  description: "",
  contact_phone: "",
};

const inputClass =
  "mt-2 min-h-12 w-full border border-prussian/15 bg-white px-4 text-sm text-prussian outline-none transition placeholder:text-slate/50 focus:border-bronze focus:ring-1 focus:ring-bronze";

const labelClass =
  "text-sm font-semibold text-prussian";

const conditionOptions = [
  {
    value: "New",
    label: "New",
  },
  {
    value: "Foreign Used",
    label: "Foreign Used",
  },
  {
    value: "Nigerian Used",
    label: "Nigerian Used",
  },
];

const transmissionOptions = [
  {
    value: "Automatic",
    label: "Automatic",
  },
  {
    value: "Manual",
    label: "Manual",
  },
];

const fuelOptions = [
  {
    value: "Petrol",
    label: "Petrol",
  },
  {
    value: "Diesel",
    label: "Diesel",
  },
  {
    value: "Hybrid",
    label: "Hybrid",
  },
  {
    value: "Electric",
    label: "Electric",
  },
];

export default function SellYourCarForm() {
  const router = useRouter();

  const [form, setForm] =
    useState<FormState>(
      initialForm,
    );

  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function preparePage() {
      try {
        setLoading(true);
        setError(null);

        const currentUser =
          await getCurrentUser();

        if (
          currentUser.data.accountType !==
          "customer"
        ) {
          router.replace("/login");
          return;
        }

        const customer =
          currentUser.data.customer;

        const branchResponse =
          await getBranches();

        if (!active) {
          return;
        }

        const activeBranches =
          branchResponse.data.filter(
            (branch) =>
              branch.is_active,
          );

        setBranches(
          activeBranches,
        );

        setForm((current) => ({
          ...current,
          contact_phone:
            customer.phone ?? "",
        }));
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

    preparePage();

    return () => {
      active = false;
    };
  }, [router]);

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    if (!form.branch_id) {
      setError(
        "Please select the UMW branch that should handle your submission.",
      );
      return;
    }

    if (
      !form.make.trim() ||
      !form.model.trim()
    ) {
      setError(
        "Please enter the vehicle make and model.",
      );
      return;
    }

    if (!form.expected_price) {
      setError(
        "Please enter your expected selling price.",
      );
      return;
    }

    const expectedPrice =
      Number(
        form.expected_price,
      );

    if (
      !Number.isFinite(
        expectedPrice,
      ) ||
      expectedPrice <= 0
    ) {
      setError(
        "Please enter a valid expected selling price.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateCarSaleSubmissionInput =
        {
          branch_id: Number(
            form.branch_id,
          ),
          make:
            form.make.trim(),
          model:
            form.model.trim(),
          expected_price:
            expectedPrice,
        };

      if (form.year) {
        payload.year =
          Number(form.year);
      }

      if (form.mileage) {
        payload.mileage =
          Number(
            form.mileage,
          );
      }

      if (
        form.condition_type
      ) {
        payload.condition_type =
          form.condition_type as NonNullable<
            CreateCarSaleSubmissionInput["condition_type"]
          >;
      }

      if (
        form.transmission
      ) {
        payload.transmission =
          form.transmission as NonNullable<
            CreateCarSaleSubmissionInput["transmission"]
          >;
      }

      if (form.fuel_type) {
        payload.fuel_type =
          form.fuel_type as NonNullable<
            CreateCarSaleSubmissionInput["fuel_type"]
          >;
      }

      if (
        form.color_exterior.trim()
      ) {
        payload.color_exterior =
          form.color_exterior.trim();
      }

      if (
        form.description.trim()
      ) {
        payload.description =
          form.description.trim();
      }

      if (
        form.contact_phone.trim()
      ) {
        payload.contact_phone =
          form.contact_phone.trim();
      }

      await createCarSaleSubmission(
        payload,
      );

      setSuccess(true);

      setForm({
        ...initialForm,
        contact_phone:
          form.contact_phone,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (
      submissionError
    ) {
      setError(
        submissionError instanceof
          Error
          ? submissionError.message
          : "We could not submit your vehicle. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const branchOptions =
    branches.map((branch) => ({
      value: String(
        branch.branch_id,
      ),
      label: branch.name,
    }));

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-prussian">
          <Loader2
            className="animate-spin"
            size={22}
          />

          <span className="text-sm font-semibold">
            Preparing your
            submission...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {success && (
        <div className="mb-8 border border-green-200 bg-green-50 px-5 py-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-green-700"
              size={22}
            />

            <div>
              <h2 className="font-heading text-lg font-bold text-prussian">
                Vehicle submitted
                successfully
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate">
                Your vehicle has
                been sent to Unique
                Mechanical Works for
                review. It has not
                been listed for sale
                yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard",
                  )
                }
                className="mt-4 text-sm font-bold text-prussian underline decoration-bronze decoration-2 underline-offset-4"
              >
                Go to My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-8 border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-800"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-12"
      >
        {/* VEHICLE */}
        <section>
          <SectionHeading
            number="01"
            title="Vehicle details"
            description="Tell us about the vehicle you would like UMW to review."
          />

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <Field label="Make *">
              <input
                value={form.make}
                onChange={(event) =>
                  updateField(
                    "make",
                    event.target
                      .value,
                  )
                }
                placeholder="e.g. Toyota"
                className={
                  inputClass
                }
                required
              />
            </Field>

            <Field label="Model *">
              <input
                value={form.model}
                onChange={(event) =>
                  updateField(
                    "model",
                    event.target
                      .value,
                  )
                }
                placeholder="e.g. Land Cruiser"
                className={
                  inputClass
                }
                required
              />
            </Field>

            <Field label="Year">
              <input
                type="number"
                min="1900"
                max="2100"
                value={form.year}
                onChange={(event) =>
                  updateField(
                    "year",
                    event.target
                      .value,
                  )
                }
                placeholder="e.g. 2022"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Mileage">
              <input
                type="number"
                min="0"
                value={
                  form.mileage
                }
                onChange={(event) =>
                  updateField(
                    "mileage",
                    event.target
                      .value,
                  )
                }
                placeholder="e.g. 45000"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Condition">
              <div className="mt-2">
                <CustomerSelect
                  value={
                    form.condition_type
                  }
                  options={
                    conditionOptions
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "condition_type",
                      value,
                    )
                  }
                  placeholder="Select condition"
                  ariaLabel="Select vehicle condition"
                />
              </div>
            </Field>

            <Field label="Transmission">
              <div className="mt-2">
                <CustomerSelect
                  value={
                    form.transmission
                  }
                  options={
                    transmissionOptions
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "transmission",
                      value,
                    )
                  }
                  placeholder="Select transmission"
                  ariaLabel="Select vehicle transmission"
                />
              </div>
            </Field>

            <Field label="Fuel type">
              <div className="mt-2">
                <CustomerSelect
                  value={
                    form.fuel_type
                  }
                  options={
                    fuelOptions
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "fuel_type",
                      value,
                    )
                  }
                  placeholder="Select fuel type"
                  ariaLabel="Select vehicle fuel type"
                />
              </div>
            </Field>

            <Field label="Exterior color">
              <input
                value={
                  form.color_exterior
                }
                onChange={(event) =>
                  updateField(
                    "color_exterior",
                    event.target
                      .value,
                  )
                }
                placeholder="e.g. Black"
                className={
                  inputClass
                }
              />
            </Field>
          </div>
        </section>

        {/* SALE */}
        <section className="border-t border-prussian/10 pt-10">
          <SectionHeading
            number="02"
            title="Sale information"
            description="Choose the branch that should handle the vehicle and tell us your expected price."
          />

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <Field label="UMW branch *">
              <div className="mt-2">
                <CustomerSelect
                  value={
                    form.branch_id
                  }
                  options={
                    branchOptions
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "branch_id",
                      value,
                    )
                  }
                  placeholder="Select branch"
                  ariaLabel="Select UMW branch"
                />
              </div>
            </Field>

            <Field label="Expected price (₦) *">
              <input
                type="number"
                min="1"
                value={
                  form.expected_price
                }
                onChange={(event) =>
                  updateField(
                    "expected_price",
                    event.target
                      .value,
                  )
                }
                placeholder="e.g. 25000000"
                className={
                  inputClass
                }
                required
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Vehicle description">
                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target
                        .value,
                    )
                  }
                  rows={5}
                  placeholder="Tell us about the vehicle's condition, history, features, or anything else we should know."
                  className={`${inputClass} resize-none py-3`}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="border-t border-prussian/10 pt-10">
          <SectionHeading
            number="03"
            title="Contact"
            description="We'll use this number if the UMW team needs to contact you about this vehicle."
          />

          <div className="mt-7 max-w-xl">
            <Field label="Contact phone">
              <div className="relative">
                <Phone
                  size={17}
                  className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate"
                />

                <input
                  type="tel"
                  value={
                    form.contact_phone
                  }
                  onChange={(event) =>
                    updateField(
                      "contact_phone",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Your contact number"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </Field>

            <p className="mt-3 text-xs leading-5 text-slate">
              We pre-filled this
              from your UMW account.
              You can use a different
              contact number for this
              vehicle if necessary.
            </p>
          </div>
        </section>

        {/* SUBMIT */}
        <div className="border-t border-prussian/10 pt-8">
          <button
            type="submit"
            disabled={
              submitting ||
              branches.length === 0
            }
            className="flex min-h-13 w-full items-center justify-center gap-3 bg-prussian px-8 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-deep-space disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Submitting...
              </>
            ) : (
              <>
                <Car
                  size={18}
                />
                Submit Vehicle for
                Review
              </>
            )}
          </button>

          <p className="mt-4 max-w-2xl text-xs leading-5 text-slate">
            Submitting your vehicle
            does not automatically
            publish it for sale. The
            UMW team will review the
            information first.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className={labelClass}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold text-bronze">
          {number}
        </span>

        <span className="h-px w-8 bg-bronze" />

        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-bronze">
          {title}
        </p>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate">
        {description}
      </p>
    </div>
  );
}