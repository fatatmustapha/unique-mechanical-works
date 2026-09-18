"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import {
  BadgeCheck,
  CarFront,
  Check,
  FileText,
  Gauge,
  Images,
  LoaderCircle,
  Plus,
  Save,
  Settings2,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import AdminSelect from "@/components/admin/AdminSelect";

import {
  createAdminCar,
  uploadAdminCarImage,
  type CreateAdminCarInput,
} from "@/lib/api/admin-cars";

import { getBranches, type Branch } from "@/lib/api/branches";

/*
|--------------------------------------------------------------------------
| FORM TYPES
|--------------------------------------------------------------------------
*/

type FormState = {
  reference_number: string;

  slug: string;

  branch_id: string;

  make: string;

  model: string;

  price: string;

  vin: string;

  year: string;

  mileage: string;

  condition_type: string;

  transmission: string;

  fuel_type: string;

  description: string;

  color_exterior: string;

  color_interior: string;

  engine_size: string;

  horsepower: string;

  body_type: string;

  num_doors: string;

  num_seats: string;

  drivetrain: string;

  registration_status: string;

  num_previous_owners: string;

  import_status: string;

  warranty_status: string;

  negotiable: boolean;
};

type SelectedVehicleImage = {
  id: string;

  file: File;

  previewUrl: string;
};

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialForm: FormState = {
  reference_number: "",

  slug: "",

  branch_id: "",

  make: "",

  model: "",

  price: "",

  vin: "",

  year: "",

  mileage: "",

  condition_type: "",

  transmission: "",

  fuel_type: "",

  description: "",

  color_exterior: "",

  color_interior: "",

  engine_size: "",

  horsepower: "",

  body_type: "",

  num_doors: "",

  num_seats: "",

  drivetrain: "",

  registration_status: "",

  num_previous_owners: "",

  import_status: "",

  warranty_status: "",

  negotiable: true,
};

/*
|--------------------------------------------------------------------------
| FEATURES
|--------------------------------------------------------------------------
*/

const commonFeatures = [
  "Air Conditioning",
  "Bluetooth",
  "Leather Seats",
  "Navigation",
  "Reverse Camera",
  "Parking Sensors",
  "Sunroof",
  "Keyless Entry",
  "Push Start",
  "Cruise Control",
  "Apple CarPlay",
  "Android Auto",
  "Heated Seats",
  "Electric Seats",
  "Blind Spot Monitor",
  "360° Camera",
];

/*
|--------------------------------------------------------------------------
| DROPDOWN OPTIONS
|--------------------------------------------------------------------------
*/

const conditionOptions = [
  {
    value: "",
    label: "Not specified",
  },
  {
    value: "New",
    label: "New",
  },
  {
    value: "Nigerian Used",
    label: "Nigerian Used",
  },
  {
    value: "Foreign Used",
    label: "Foreign Used",
  },
];

const transmissionOptions = [
  {
    value: "",
    label: "Not specified",
  },
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
    value: "",
    label: "Not specified",
  },
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

const drivetrainOptions = [
  {
    value: "",
    label: "Not specified",
  },
  {
    value: "FWD",
    label: "FWD",
  },
  {
    value: "RWD",
    label: "RWD",
  },
  {
    value: "AWD",
    label: "AWD",
  },
  {
    value: "4WD",
    label: "4WD",
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function optionalString(value: string) {
  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

/*
|--------------------------------------------------------------------------
| FIELD COMPONENT
|--------------------------------------------------------------------------
*/

type FieldProps = {
  label: string;

  required?: boolean;

  hint?: string;

  children: React.ReactNode;
};

function Field({ label, required = false, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-prussian">
        {label}

        {required && <span className="ml-1 text-bronze">*</span>}
      </span>

      {children}

      {hint && (
        <span className="mt-2 block text-xs leading-5 text-slate">{hint}</span>
      )}
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| SECTION COMPONENT
|--------------------------------------------------------------------------
*/

type SectionProps = {
  icon: React.ReactNode;

  title: string;

  description: string;

  children: React.ReactNode;
};

function FormSection({ icon, title, description, children }: SectionProps) {
  return (
    <section className="border border-prussian/10 bg-white">
      <div className="flex items-start gap-4 border-b border-prussian/10 px-6 py-5 sm:px-7">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-prussian text-bronze">
          {icon}
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-prussian">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate">{description}</p>
        </div>
      </div>

      <div className="p-6 sm:p-7">{children}</div>
    </section>
  );
}

const inputClass =
  "min-h-12 w-full border border-prussian/15 bg-white px-4 text-sm text-prussian outline-none transition placeholder:text-slate/60 focus:border-bronze";

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function VehicleForm() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(initialForm);

  const [branches, setBranches] = useState<Branch[]>([]);

  const [branchesLoading, setBranchesLoading] = useState(true);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [customFeature, setCustomFeature] = useState("");

  const [selectedImages, setSelectedImages] = useState<SelectedVehicleImage[]>(
    [],
  );

  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);

  const [dragging, setDragging] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [slugTouched, setSlugTouched] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD BRANCHES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setBranchesLoading(true);

        const response = await getBranches();

        setBranches(response.data.filter((branch) => branch.is_active));
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "Unable to load branches.",
        );
      } finally {
        setBranchesLoading(false);
      }
    };

    void loadBranches();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CLEAN PREVIEW URLS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

  /*
  |--------------------------------------------------------------------------
  | AUTO SLUG
  |--------------------------------------------------------------------------
  */

  const generatedSlug = useMemo(() => {
    const parts = [
      form.make,
      form.model,
      form.year,
      form.reference_number,
    ].filter(Boolean);

    return slugify(parts.join(" "));
  }, [form.make, form.model, form.year, form.reference_number]);

  useEffect(() => {
    if (!slugTouched) {
      setForm((current) => ({
        ...current,

        slug: generatedSlug,
      }));
    }
  }, [generatedSlug, slugTouched]);

  /*
  |--------------------------------------------------------------------------
  | FIELD UPDATE
  |--------------------------------------------------------------------------
  */

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({
      ...current,

      [key]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | FEATURES
  |--------------------------------------------------------------------------
  */

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );
  };

  const addCustomFeature = () => {
    const value = customFeature.trim();

    if (!value) {
      return;
    }

    const duplicate = selectedFeatures.some(
      (feature) => feature.toLowerCase() === value.toLowerCase(),
    );

    if (!duplicate) {
      setSelectedFeatures((current) => [...current, value]);
    }

    setCustomFeature("");
  };

  const removeFeature = (feature: string) => {
    setSelectedFeatures((current) =>
      current.filter((item) => item !== feature),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE SELECTION
  |--------------------------------------------------------------------------
  */

  const addImages = (files: FileList | File[]) => {
    const incomingFiles = Array.from(files);

    const validFiles = incomingFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    if (validFiles.length !== incomingFiles.length) {
      window.alert("Only JPG, PNG and WEBP images are supported.");
    }

    const newImages = validFiles.map((file) => ({
      id: crypto.randomUUID(),

      file,

      previewUrl: URL.createObjectURL(file),
    }));

    if (newImages.length === 0) {
      return;
    }

    setSelectedImages((current) => {
      const updated = [...current, ...newImages];

      if (primaryImageId === null && updated.length > 0) {
        setPrimaryImageId(updated[0].id);
      }

      return updated;
    });
  };

  const removeImage = (id: string) => {
    setSelectedImages((current) => {
      const image = current.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      const updated = current.filter((item) => item.id !== id);

      if (primaryImageId === id) {
        setPrimaryImageId(updated[0]?.id ?? null);
      }

      return updated;
    });
  };

  const makePrimaryImage = (id: string) => {
    setPrimaryImageId(id);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    setDragging(false);

    if (event.dataTransfer.files.length > 0) {
      addImages(event.dataTransfer.files);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    setUploadProgress(null);

    /*
      |--------------------------------------------------------------------------
      | REQUIRED FIELDS
      |--------------------------------------------------------------------------
      */

    if (
      !form.reference_number.trim() ||
      !form.slug.trim() ||
      !form.branch_id ||
      !form.make.trim() ||
      !form.model.trim() ||
      !form.price.trim()
    ) {
      setError(
        "Please complete the required fields before saving the vehicle.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid vehicle price.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    /*
      |--------------------------------------------------------------------------
      | CREATE PAYLOAD
      |--------------------------------------------------------------------------
      */

    const payload: CreateAdminCarInput = {
      reference_number: form.reference_number.trim(),

      slug: form.slug.trim(),

      branch_id: Number(form.branch_id),

      make: form.make.trim(),

      model: form.model.trim(),

      price,

      negotiable: form.negotiable,
    };

    const vin = optionalString(form.vin);

    if (vin) {
      payload.vin = vin;
    }

    const year = optionalNumber(form.year);

    if (year !== undefined) {
      payload.year = year;
    }

    const mileage = optionalNumber(form.mileage);

    if (mileage !== undefined) {
      payload.mileage = mileage;
    }

    if (form.condition_type) {
      payload.condition_type =
        form.condition_type as CreateAdminCarInput["condition_type"];
    }

    if (form.transmission) {
      payload.transmission =
        form.transmission as CreateAdminCarInput["transmission"];
    }

    if (form.fuel_type) {
      payload.fuel_type = form.fuel_type as CreateAdminCarInput["fuel_type"];
    }

    const description = optionalString(form.description);

    if (description) {
      payload.description = description;
    }

    const exterior = optionalString(form.color_exterior);

    if (exterior) {
      payload.color_exterior = exterior;
    }

    const interior = optionalString(form.color_interior);

    if (interior) {
      payload.color_interior = interior;
    }

    const engine = optionalString(form.engine_size);

    if (engine) {
      payload.engine_size = engine;
    }

    const horsepower = optionalNumber(form.horsepower);

    if (horsepower !== undefined) {
      payload.horsepower = horsepower;
    }

    const bodyType = optionalString(form.body_type);

    if (bodyType) {
      payload.body_type = bodyType;
    }

    const doors = optionalNumber(form.num_doors);

    if (doors !== undefined) {
      payload.num_doors = doors;
    }

    const seats = optionalNumber(form.num_seats);

    if (seats !== undefined) {
      payload.num_seats = seats;
    }

    if (form.drivetrain) {
      payload.drivetrain = form.drivetrain as CreateAdminCarInput["drivetrain"];
    }

    const registration = optionalString(form.registration_status);

    if (registration) {
      payload.registration_status = registration;
    }

    const owners = optionalNumber(form.num_previous_owners);

    if (owners !== undefined) {
      payload.num_previous_owners = owners;
    }

    const importStatus = optionalString(form.import_status);

    if (importStatus) {
      payload.import_status = importStatus;
    }

    const warranty = optionalString(form.warranty_status);

    if (warranty) {
      payload.warranty_status = warranty;
    }

    if (selectedFeatures.length > 0) {
      payload.features = selectedFeatures;
    }

    /*
      |--------------------------------------------------------------------------
      | CREATE VEHICLE + UPLOAD PHOTOS
      |--------------------------------------------------------------------------
      */

    try {
      setSubmitting(true);

      setUploadProgress("Creating vehicle...");

      const createResponse = await createAdminCar(payload);

      const newCar = createResponse.data.car;

      if (selectedImages.length > 0) {
        for (let index = 0; index < selectedImages.length; index += 1) {
          const image = selectedImages[index];

          setUploadProgress(
            `Uploading photo ${index + 1} of ${selectedImages.length}...`,
          );

          await uploadAdminCarImage(
            newCar.car_id,

            image.file,

            {
              imageLabel: "other",

              altText: `${newCar.make} ${newCar.model} vehicle photo ${
                index + 1
              }`,

              isPrimary: image.id === primaryImageId,

              sortOrder: index,
            },
          );
        }
      }

      setUploadProgress("Vehicle saved successfully.");

      router.push("/admin/vehicles");

      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create the vehicle.",
      );

      setUploadProgress(null);

      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BRANCH DROPDOWN OPTIONS
  |--------------------------------------------------------------------------
  */

  const branchOptions = [
    {
      value: "",

      label: branchesLoading ? "Loading branches..." : "Select branch",
    },

    ...branches.map((branch) => ({
      value: String(branch.branch_id),

      label: branch.name,
    })),
  ];

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="border border-bronze/30 bg-bronze/[0.07] px-5 py-4">
        <div className="flex gap-3">
          <BadgeCheck size={20} className="mt-0.5 shrink-0 text-bronze" />

          <div>
            <p className="text-sm font-bold text-prussian">
              Only the essential information is required.
            </p>

            <p className="mt-1 text-sm leading-6 text-slate">
              Fields marked with * must be completed. Everything else can be
              skipped and added later.
            </p>
          </div>
        </div>
      </div>

      {/* BASIC INFORMATION */}

      <FormSection
        icon={<CarFront size={20} />}
        title="Basic Information"
        description="Identify the vehicle and assign it to the correct UMW branch."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field
            label="Reference Number"
            required
            hint="Your internal UMW inventory reference."
          >
            <input
              required
              value={form.reference_number}
              onChange={(event) =>
                updateField("reference_number", event.target.value)
              }
              placeholder="e.g. UMW-ABJ-001"
              className={inputClass}
            />
          </Field>

          <Field label="Make" required>
            <input
              required
              value={form.make}
              onChange={(event) => updateField("make", event.target.value)}
              placeholder="e.g. Toyota"
              className={inputClass}
            />
          </Field>

          <Field label="Model" required>
            <input
              required
              value={form.model}
              onChange={(event) => updateField("model", event.target.value)}
              placeholder="e.g. Land Cruiser"
              className={inputClass}
            />
          </Field>

          <Field label="Year">
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={(event) => updateField("year", event.target.value)}
              placeholder="e.g. 2025"
              className={inputClass}
            />
          </Field>

          <Field label="Branch" required>
            <AdminSelect
              value={form.branch_id}
              options={branchOptions}
              ariaLabel="Select branch"
              onChange={(value) => updateField("branch_id", value)}
            />
          </Field>

          <Field label="VIN" hint="Optional vehicle identification number.">
            <input
              value={form.vin}
              onChange={(event) => updateField("vin", event.target.value)}
              placeholder="Vehicle VIN"
              className={inputClass}
            />
          </Field>

          <div className="md:col-span-2 xl:col-span-3">
            <Field
              label="Listing Slug"
              required
              hint="Generated automatically for the public vehicle URL."
            >
              <input
                required
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);

                  updateField("slug", slugify(event.target.value));
                }}
                placeholder="toyota-land-cruiser-2025-umw-abj-001"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* PRICING */}

      <FormSection
        icon={<Tag size={20} />}
        title="Pricing & Condition"
        description="Set the asking price and add the most useful buying information."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Price (₦)" required>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="e.g. 65000000"
              className={inputClass}
            />
          </Field>

          <Field label="Mileage">
            <input
              type="number"
              min="0"
              value={form.mileage}
              onChange={(event) => updateField("mileage", event.target.value)}
              placeholder="e.g. 25000"
              className={inputClass}
            />
          </Field>

          <Field label="Condition">
            <AdminSelect
              value={form.condition_type}
              options={conditionOptions}
              ariaLabel="Select vehicle condition"
              onChange={(value) => updateField("condition_type", value)}
            />
          </Field>

          <Field label="Transmission">
            <AdminSelect
              value={form.transmission}
              options={transmissionOptions}
              ariaLabel="Select transmission"
              onChange={(value) => updateField("transmission", value)}
            />
          </Field>

          <Field label="Fuel Type">
            <AdminSelect
              value={form.fuel_type}
              options={fuelOptions}
              ariaLabel="Select fuel type"
              onChange={(value) => updateField("fuel_type", value)}
            />
          </Field>

          <Field label="Negotiable">
            <button
              type="button"
              onClick={() => updateField("negotiable", !form.negotiable)}
              className="flex min-h-12 w-full items-center justify-between border border-prussian/15 bg-white px-4 text-sm font-semibold text-prussian transition hover:border-bronze"
            >
              <span>Price negotiable</span>

              <span
                className={`flex h-6 w-6 items-center justify-center border transition ${
                  form.negotiable
                    ? "border-bronze bg-bronze text-prussian"
                    : "border-prussian/20 bg-white"
                }`}
              >
                {form.negotiable && <Check size={15} />}
              </span>
            </button>
          </Field>
        </div>
      </FormSection>

      {/* SPECIFICATIONS */}

      <FormSection
        icon={<Settings2 size={20} />}
        title="Vehicle Specifications"
        description="Add technical details when they are available."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Body Type">
            <input
              value={form.body_type}
              onChange={(event) => updateField("body_type", event.target.value)}
              placeholder="e.g. SUV"
              className={inputClass}
            />
          </Field>

          <Field label="Engine Size">
            <input
              value={form.engine_size}
              onChange={(event) =>
                updateField("engine_size", event.target.value)
              }
              placeholder="e.g. 3.5L V6"
              className={inputClass}
            />
          </Field>

          <Field label="Horsepower">
            <input
              type="number"
              min="0"
              value={form.horsepower}
              onChange={(event) =>
                updateField("horsepower", event.target.value)
              }
              placeholder="e.g. 409"
              className={inputClass}
            />
          </Field>

          <Field label="Drivetrain">
            <AdminSelect
              value={form.drivetrain}
              options={drivetrainOptions}
              ariaLabel="Select drivetrain"
              onChange={(value) => updateField("drivetrain", value)}
            />
          </Field>

          <Field label="Number of Doors">
            <input
              type="number"
              min="1"
              value={form.num_doors}
              onChange={(event) => updateField("num_doors", event.target.value)}
              placeholder="e.g. 5"
              className={inputClass}
            />
          </Field>

          <Field label="Number of Seats">
            <input
              type="number"
              min="1"
              value={form.num_seats}
              onChange={(event) => updateField("num_seats", event.target.value)}
              placeholder="e.g. 7"
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      {/* APPEARANCE */}

      <FormSection
        icon={<Gauge size={20} />}
        title="Appearance & History"
        description="Record colors, ownership, registration and warranty details if known."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Exterior Color">
            <input
              value={form.color_exterior}
              onChange={(event) =>
                updateField("color_exterior", event.target.value)
              }
              placeholder="e.g. Pearl White"
              className={inputClass}
            />
          </Field>

          <Field label="Interior Color">
            <input
              value={form.color_interior}
              onChange={(event) =>
                updateField("color_interior", event.target.value)
              }
              placeholder="e.g. Black"
              className={inputClass}
            />
          </Field>

          <Field label="Previous Owners">
            <input
              type="number"
              min="0"
              value={form.num_previous_owners}
              onChange={(event) =>
                updateField("num_previous_owners", event.target.value)
              }
              placeholder="e.g. 1"
              className={inputClass}
            />
          </Field>

          <Field label="Registration Status">
            <input
              value={form.registration_status}
              onChange={(event) =>
                updateField("registration_status", event.target.value)
              }
              placeholder="e.g. Registered"
              className={inputClass}
            />
          </Field>

          <Field label="Import Status">
            <input
              value={form.import_status}
              onChange={(event) =>
                updateField("import_status", event.target.value)
              }
              placeholder="e.g. Direct import"
              className={inputClass}
            />
          </Field>

          <Field label="Warranty Status">
            <input
              value={form.warranty_status}
              onChange={(event) =>
                updateField("warranty_status", event.target.value)
              }
              placeholder="e.g. Manufacturer warranty"
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      {/* FEATURES */}

      <FormSection
        icon={<Plus size={20} />}
        title="Features"
        description="Select useful equipment or add a custom feature."
      >
        <div className="flex flex-wrap gap-2">
          {commonFeatures.map((feature) => {
            const selected = selectedFeatures.includes(feature);

            return (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`border px-3.5 py-2 text-sm font-semibold transition ${
                  selected
                    ? "border-bronze bg-bronze text-prussian"
                    : "border-prussian/15 bg-white text-prussian hover:border-bronze"
                }`}
              >
                {selected && <Check size={14} className="mr-1.5 inline" />}

                {feature}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            value={customFeature}
            onChange={(event) => setCustomFeature(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();

                addCustomFeature();
              }
            }}
            placeholder="Add another feature..."
            className={`${inputClass} flex-1`}
          />

          <button
            type="button"
            onClick={addCustomFeature}
            className="min-h-12 bg-prussian px-5 text-sm font-bold text-white transition hover:bg-prussian/90"
          >
            Add Feature
          </button>
        </div>

        {selectedFeatures.length > 0 && (
          <div className="mt-5 border-t border-prussian/10 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate">
              Selected Features
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedFeatures.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center gap-2 bg-prussian/5 px-3 py-2 text-sm font-medium text-prussian"
                >
                  {feature}

                  <button
                    type="button"
                    aria-label={`Remove ${feature}`}
                    onClick={() => removeFeature(feature)}
                    className="text-slate transition hover:text-mahogany"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </FormSection>

      {/* DESCRIPTION */}

      <FormSection
        icon={<FileText size={20} />}
        title="Description"
        description="Add anything a customer should know that is not covered by the structured fields."
      >
        <Field label="Vehicle Description">
          <textarea
            rows={7}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe the vehicle's condition, notable equipment, service history or other useful details..."
            className="w-full resize-y border border-prussian/15 bg-white px-4 py-3 text-sm leading-7 text-prussian outline-none transition placeholder:text-slate/60 focus:border-bronze"
          />
        </Field>
      </FormSection>

      {/* VEHICLE PHOTOS */}

      <FormSection
        icon={<Images size={20} />}
        title="Vehicle Photos"
        description="Upload actual vehicle photographs. You can choose several photos and select which one will be the cover image."
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              addImages(event.target.files);
            }

            event.target.value = "";
          }}
        />

        <div
          role="button"
          tabIndex={0}
          onDragEnter={(event) => {
            event.preventDefault();

            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();

            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();

              fileInputRef.current?.click();
            }
          }}
          className={`cursor-pointer border border-dashed px-6 py-10 text-center outline-none transition-all duration-200 ${
            dragging
              ? "border-bronze bg-bronze/[0.08]"
              : "border-prussian/20 bg-prussian/[0.02] hover:border-bronze hover:bg-bronze/[0.04]"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center bg-prussian text-bronze">
            <Upload size={25} />
          </div>

          <h3 className="mt-5 font-heading text-lg font-bold text-prussian">
            Drop vehicle photos here
          </h3>

          <p className="mt-2 text-sm text-slate">
            or click to browse your computer
          </p>

          <p className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-slate/80">
            JPG • PNG • WEBP
          </p>
        </div>

        {selectedImages.length > 0 && (
          <div className="mt-7">
            <div className="flex flex-col gap-3 border-b border-prussian/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-prussian">
                  Selected Photos
                </h3>

                <p className="mt-1 text-sm text-slate">
                  {selectedImages.length}{" "}
                  {selectedImages.length === 1 ? "photo" : "photos"} ready to
                  upload.
                </p>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-10 items-center justify-center gap-2 border border-prussian/15 px-4 text-sm font-bold text-prussian transition hover:border-bronze hover:text-bronze disabled:opacity-50"
              >
                <Plus size={16} />
                Add More
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {selectedImages.map((image, index) => {
                const isPrimary = primaryImageId === image.id;

                return (
                  <article
                    key={image.id}
                    className={`overflow-hidden border bg-white transition ${
                      isPrimary ? "border-bronze" : "border-prussian/10"
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-prussian/5">
                      <img
                        src={image.previewUrl}
                        alt={`Vehicle preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {isPrimary && (
                        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-bronze px-2.5 py-1.5 text-xs font-bold text-prussian shadow-sm">
                          <Star size={13} className="fill-prussian" />
                          Cover Photo
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={submitting}
                        aria-label="Remove image"
                        onClick={() => removeImage(image.id)}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-white text-mahogany shadow-sm transition hover:bg-mahogany hover:text-white disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="p-3">
                      <p className="truncate text-sm font-bold text-prussian">
                        {image.file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate">
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      <div className="mt-3">
                        {isPrimary ? (
                          <div className="flex min-h-9 items-center justify-center gap-2 bg-bronze/10 text-xs font-bold text-prussian">
                            <Check size={14} />
                            Primary image
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => makePrimaryImage(image.id)}
                            className="flex min-h-9 w-full items-center justify-center gap-2 border border-prussian/15 text-xs font-bold text-prussian transition hover:border-bronze hover:bg-bronze disabled:opacity-50"
                          >
                            <Star size={14} />
                            Make Cover
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 border border-bronze/20 bg-bronze/[0.05] px-4 py-3">
              <p className="text-sm leading-6 text-slate">
                <strong className="text-prussian">Cover photo:</strong> this
                image will appear first in the marketplace and vehicle gallery.
              </p>
            </div>
          </div>
        )}
      </FormSection>

      {/* SAVE BAR */}

      <div className="sticky bottom-0 z-20 border border-prussian/10 bg-white/95 p-4 shadow-[0_-10px_30px_rgba(8,41,75,0.08)] backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-prussian">Ready to save?</p>

            <p className="mt-1 text-xs text-slate">
              The vehicle and selected photographs will be saved together. The
              listing starts as a draft.
            </p>

            {uploadProgress && (
              <p className="mt-2 text-xs font-bold text-bronze">
                {uploadProgress}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={submitting}
              onClick={() => router.push("/admin/vehicles")}
              className="min-h-12 border border-prussian/15 px-6 text-sm font-bold text-prussian transition hover:border-bronze disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || branchesLoading}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-bronze px-7 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Vehicle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
