"use client";

import {
  Archive,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createServiceShowcase,
  deleteServiceShowcase,
  deleteServiceShowcaseImage,
  getAdminServiceShowcases,
  setServiceShowcaseStatus,
  updateServiceShowcase,
} from "@/lib/api/service-showcases";
import { getServices } from "@/lib/api/appointments";
import { getBranches, type Branch } from "@/lib/api/branches";

import type { Service } from "@/types/appointment";
import type {
  ServiceShowcase,
  ServiceShowcaseFormInput,
  ServiceShowcaseImage,
} from "@/types/service-showcase";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

const MAX_IMAGES_PER_SIDE = 6;

type FormState = {
  title: string;
  description: string;
  serviceId: string;
  branchId: string;
  isActive: boolean;
};

const initialFormState: FormState = {
  title: "",
  description: "",
  serviceId: "",
  branchId: "",
  isActive: true,
};

function getImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${BACKEND_URL}${path}`;
}

function ImagePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="group relative aspect-[4/3] overflow-hidden border border-prussian/10 bg-gray-100">
      {previewUrl && (
        <img
          src={previewUrl}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      )}

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-black/75 text-white transition hover:bg-red-700"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ExistingImage({
  image,
  label,
  deleting,
  onDelete,
}: {
  image: ServiceShowcaseImage;
  label: string;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden border border-prussian/10 bg-gray-100">
      <img
        src={getImageUrl(image.image_url)}
        alt={label}
        className="h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-black/75 text-white transition hover:bg-red-700 disabled:opacity-50"
        aria-label="Remove existing photo"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

function ShowcaseGallery({
  images,
  type,
  title,
}: {
  images: ServiceShowcaseImage[];
  type: "before" | "after";
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const showPrevious = () => {
    setCurrentIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setCurrentIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <div className="flex h-full items-center justify-center text-sm text-slate">
          No photo
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <img
        src={getImageUrl(currentImage.image_url)}
        alt={`${type} ${currentIndex + 1} - ${title}`}
        className="h-full w-full object-cover"
      />

      <span
        className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-bold uppercase tracking-wide ${
          type === "before"
            ? "bg-black/75 text-white"
            : "bg-bronze text-prussian"
        }`}
      >
        {type} · {currentIndex + 1}/{images.length}
      </span>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label={`Previous ${type} photo`}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-black/65 text-white transition hover:bg-black/85"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label={`Next ${type} photo`}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-black/65 text-white transition hover:bg-black/85"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}

export default function ServiceShowcaseManager() {
  const [showcases, setShowcases] = useState<ServiceShowcase[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [form, setForm] = useState<FormState>(initialFormState);

  const [beforeImages, setBeforeImages] = useState<File[]>([]);
  const [afterImages, setAfterImages] = useState<File[]>([]);

  const [editingShowcase, setEditingShowcase] =
    useState<ServiceShowcase | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [actionId, setActionId] = useState<number | null>(null);

  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeCount = useMemo(
    () => showcases.filter((showcase) => showcase.is_active).length,
    [showcases],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [showcaseData, serviceData, branchResponse] = await Promise.all([
        getAdminServiceShowcases(),
        getServices(),
        getBranches(),
      ]);

      setShowcases(showcaseData);
      setServices(serviceData);
      setBranches(branchResponse.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load showcase data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetForm = () => {
    setForm(initialFormState);
    setBeforeImages([]);
    setAfterImages([]);
    setEditingShowcase(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setError("");
    setSuccess("");
    setEditingShowcase(null);
    setForm(initialFormState);
    setBeforeImages([]);
    setAfterImages([]);
    setShowForm(true);
  };

  const startEdit = (showcase: ServiceShowcase) => {
    setError("");
    setSuccess("");
    setEditingShowcase(showcase);

    setForm({
      title: showcase.title,
      description: showcase.description ?? "",
      serviceId:
        showcase.service_id !== null ? String(showcase.service_id) : "",
      branchId: showcase.branch_id !== null ? String(showcase.branch_id) : "",
      isActive: showcase.is_active,
    });

    setBeforeImages([]);
    setAfterImages([]);
    setShowForm(true);
  };

  const addSelectedFiles = (
    selectedFiles: FileList | null,
    type: "before" | "after",
  ) => {
    if (!selectedFiles) {
      return;
    }

    const files = Array.from(selectedFiles);

    const existingCount =
      type === "before"
        ? (editingShowcase?.before_images.length ?? 0)
        : (editingShowcase?.after_images.length ?? 0);

    const pendingCount =
      type === "before" ? beforeImages.length : afterImages.length;

    const availableSlots = MAX_IMAGES_PER_SIDE - existingCount - pendingCount;

    if (availableSlots <= 0) {
      setError(
        `You can upload a maximum of ${MAX_IMAGES_PER_SIDE} ${type} photos.`,
      );
      return;
    }

    if (files.length > availableSlots) {
      setError(
        `Only ${availableSlots} more ${type} photo${
          availableSlots === 1 ? "" : "s"
        } can be added.`,
      );
      return;
    }

    setError("");

    if (type === "before") {
      setBeforeImages((current) => [...current, ...files]);
    } else {
      setAfterImages((current) => [...current, ...files]);
    }
  };

  const removePendingImage = (index: number, type: "before" | "after") => {
    if (type === "before") {
      setBeforeImages((current) =>
        current.filter((_file, fileIndex) => fileIndex !== index),
      );
    } else {
      setAfterImages((current) =>
        current.filter((_file, fileIndex) => fileIndex !== index),
      );
    }
  };

  const handleExistingImageDelete = async (image: ServiceShowcaseImage) => {
    if (!editingShowcase) {
      return;
    }

    const relevantImages =
      image.image_type === "before"
        ? editingShowcase.before_images
        : editingShowcase.after_images;

    if (relevantImages.length <= 1) {
      setError(`A showcase must keep at least one ${image.image_type} photo.`);
      return;
    }

    const confirmed = window.confirm(
      `Remove this ${image.image_type} photo from the showcase?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingImageId(image.image_id);
      setError("");
      setSuccess("");

      const updatedShowcase = await deleteServiceShowcaseImage(
        editingShowcase.showcase_id,
        image.image_id,
      );

      setEditingShowcase(updatedShowcase);

      setShowcases((current) =>
        current.map((showcase) =>
          showcase.showcase_id === updatedShowcase.showcase_id
            ? updatedShowcase
            : showcase,
        ),
      );

      setSuccess("Photo removed successfully.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to remove the photo.",
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Please enter a showcase title.");
      return;
    }

    if (!editingShowcase && beforeImages.length === 0) {
      setError("Please choose at least one before photo.");
      return;
    }

    if (!editingShowcase && afterImages.length === 0) {
      setError("Please choose at least one after photo.");
      return;
    }

    const existingBeforeCount = editingShowcase?.before_images.length ?? 0;

    const existingAfterCount = editingShowcase?.after_images.length ?? 0;

    if (existingBeforeCount + beforeImages.length > MAX_IMAGES_PER_SIDE) {
      setError(
        `A showcase can have a maximum of ${MAX_IMAGES_PER_SIDE} before photos.`,
      );
      return;
    }

    if (existingAfterCount + afterImages.length > MAX_IMAGES_PER_SIDE) {
      setError(
        `A showcase can have a maximum of ${MAX_IMAGES_PER_SIDE} after photos.`,
      );
      return;
    }

    if (!editingShowcase && form.isActive && activeCount >= 6) {
      setError(
        "You already have 6 active showcases. Archive one before adding another active showcase.",
      );
      return;
    }

    if (
      editingShowcase &&
      !editingShowcase.is_active &&
      form.isActive &&
      activeCount >= 6
    ) {
      setError("A maximum of 6 showcases can be active at the same time.");
      return;
    }

    const input: ServiceShowcaseFormInput = {
      title: form.title.trim(),
      description: form.description.trim(),

      service_id: form.serviceId ? Number(form.serviceId) : null,

      branch_id: form.branchId ? Number(form.branchId) : null,

      is_active: form.isActive,

      before_images: beforeImages.length > 0 ? beforeImages : undefined,

      after_images: afterImages.length > 0 ? afterImages : undefined,
    };

    try {
      setSaving(true);

      if (editingShowcase) {
        await updateServiceShowcase(editingShowcase.showcase_id, input);

        setSuccess("Showcase updated successfully.");
      } else {
        await createServiceShowcase(input);

        setSuccess("Showcase added successfully.");
      }

      resetForm();
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the showcase.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (showcase: ServiceShowcase) => {
    const nextStatus = !showcase.is_active;

    if (nextStatus && activeCount >= 6) {
      setError("A maximum of 6 showcases can be active at the same time.");
      return;
    }

    try {
      setActionId(showcase.showcase_id);
      setError("");
      setSuccess("");

      await setServiceShowcaseStatus(showcase.showcase_id, nextStatus);

      setSuccess(
        nextStatus
          ? "Showcase restored successfully."
          : "Showcase archived successfully.",
      );

      await loadData();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update showcase status.",
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (showcase: ServiceShowcase) => {
    const confirmed = window.confirm(
      `Permanently delete "${showcase.title}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(showcase.showcase_id);
      setError("");
      setSuccess("");

      await deleteServiceShowcase(showcase.showcase_id);

      setSuccess("Showcase deleted successfully.");

      if (editingShowcase?.showcase_id === showcase.showcase_id) {
        resetForm();
      }

      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the showcase.",
      );
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center border border-prussian/10 bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-bronze" />
      </div>
    );
  }

  const currentBeforeCount =
    (editingShowcase?.before_images.length ?? 0) + beforeImages.length;

  const currentAfterCount =
    (editingShowcase?.after_images.length ?? 0) + afterImages.length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-prussian/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-bronze">
            Workshop Portfolio
          </p>

          <h2 className="mt-1 font-heading text-2xl font-bold text-prussian">
            Before & After Showcase
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
            Manage completed workshop projects and their before-and-after photo
            galleries. Up to 6 active projects can be displayed publicly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="border border-prussian/10 bg-white px-4 py-2 text-sm font-semibold text-prussian">
            {activeCount} of 6 active
          </span>

          <button
            type="button"
            onClick={startCreate}
            disabled={activeCount >= 6}
            className="inline-flex items-center gap-2 bg-prussian px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus className="h-4 w-4" />
            Add Showcase
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-prussian/10 bg-white p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-prussian">
                {editingShowcase
                  ? "Edit Showcase"
                  : "Add Before & After Showcase"}
              </h3>

              <p className="mt-1 text-sm text-slate">
                {editingShowcase
                  ? "Manage the project details and add or remove gallery photos."
                  : "Add up to 6 before photos and 6 after photos."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="p-2 text-slate transition hover:text-prussian"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-prussian">
                Title *
              </span>

              <input
                type="text"
                value={form.title}
                maxLength={150}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="w-full border border-prussian/20 px-3 py-2.5 text-prussian outline-none transition focus:border-bronze"
                placeholder="Example: Full Vehicle Repainting"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-prussian">
                Description
              </span>

              <textarea
                value={form.description}
                maxLength={500}
                rows={3}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="w-full resize-none border border-prussian/20 px-3 py-2.5 text-prussian outline-none transition focus:border-bronze"
                placeholder="Briefly describe the work completed."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-prussian">
                Related Service
              </span>

              <select
                value={form.serviceId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    serviceId: event.target.value,
                  }))
                }
                className="w-full border border-prussian/20 bg-white px-3 py-2.5 text-prussian outline-none focus:border-bronze"
              >
                <option value="">No specific service</option>

                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-prussian">
                Branch
              </span>

              <select
                value={form.branchId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    branchId: event.target.value,
                  }))
                }
                className="w-full border border-prussian/20 bg-white px-3 py-2.5 text-prussian outline-none focus:border-bronze"
              >
                <option value="">All / Not specified</option>

                {branches
                  .filter((branch) => branch.is_active)
                  .map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="flex items-center gap-3 border border-prussian/10 px-4 py-3 md:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#D19A24]"
              />

              <span className="text-sm font-semibold text-prussian">
                Display publicly
              </span>
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 border border-prussian/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-heading text-lg font-bold text-prussian">
                    Before Photos *
                  </h4>

                  <p className="mt-1 text-xs text-slate">
                    Front, back, side or detail views.
                  </p>
                </div>

                <span className="text-xs font-bold text-slate">
                  {currentBeforeCount}/6
                </span>
              </div>

              {editingShowcase && editingShowcase.before_images.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">
                    Current Photos
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {editingShowcase.before_images.map((image, index) => (
                      <ExistingImage
                        key={image.image_id}
                        image={image}
                        label={`Before ${index + 1} - ${editingShowcase.title}`}
                        deleting={deletingImageId === image.image_id}
                        onDelete={() => void handleExistingImageDelete(image)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {beforeImages.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">
                    New Photos
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {beforeImages.map((file, index) => (
                      <ImagePreview
                        key={`${file.name}-${file.lastModified}-${index}`}
                        file={file}
                        onRemove={() => removePendingImage(index, "before")}
                      />
                    ))}
                  </div>
                </div>
              )}

              <label
                className={`flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-5 text-center transition ${
                  currentBeforeCount >= MAX_IMAGES_PER_SIDE
                    ? "cursor-not-allowed border-prussian/10 bg-gray-50 opacity-50"
                    : "border-prussian/25 hover:border-bronze"
                }`}
              >
                <ImagePlus className="h-6 w-6 text-bronze" />

                <span className="mt-2 text-sm font-semibold text-prussian">
                  Add Before Photos
                </span>

                <span className="mt-1 text-xs text-slate">
                  JPEG, PNG or WEBP · Up to 6
                </span>

                <input
                  type="file"
                  multiple
                  disabled={currentBeforeCount >= MAX_IMAGES_PER_SIDE}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    addSelectedFiles(event.target.files, "before");

                    event.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="space-y-4 border border-prussian/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-heading text-lg font-bold text-prussian">
                    After Photos *
                  </h4>

                  <p className="mt-1 text-xs text-slate">
                    Show the completed result from matching angles.
                  </p>
                </div>

                <span className="text-xs font-bold text-slate">
                  {currentAfterCount}/6
                </span>
              </div>

              {editingShowcase && editingShowcase.after_images.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">
                    Current Photos
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {editingShowcase.after_images.map((image, index) => (
                      <ExistingImage
                        key={image.image_id}
                        image={image}
                        label={`After ${index + 1} - ${editingShowcase.title}`}
                        deleting={deletingImageId === image.image_id}
                        onDelete={() => void handleExistingImageDelete(image)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {afterImages.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">
                    New Photos
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {afterImages.map((file, index) => (
                      <ImagePreview
                        key={`${file.name}-${file.lastModified}-${index}`}
                        file={file}
                        onRemove={() => removePendingImage(index, "after")}
                      />
                    ))}
                  </div>
                </div>
              )}

              <label
                className={`flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-5 text-center transition ${
                  currentAfterCount >= MAX_IMAGES_PER_SIDE
                    ? "cursor-not-allowed border-prussian/10 bg-gray-50 opacity-50"
                    : "border-prussian/25 hover:border-bronze"
                }`}
              >
                <ImagePlus className="h-6 w-6 text-bronze" />

                <span className="mt-2 text-sm font-semibold text-prussian">
                  Add After Photos
                </span>

                <span className="mt-1 text-xs text-slate">
                  JPEG, PNG or WEBP · Up to 6
                </span>

                <input
                  type="file"
                  multiple
                  disabled={currentAfterCount >= MAX_IMAGES_PER_SIDE}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    addSelectedFiles(event.target.files, "after");

                    event.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-prussian/10 pt-5">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="border border-prussian/20 px-5 py-2.5 text-sm font-semibold text-prussian transition hover:border-prussian"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-bronze px-5 py-2.5 text-sm font-bold text-prussian transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}

              {editingShowcase ? "Save Changes" : "Add Showcase"}
            </button>
          </div>
        </form>
      )}

      {showcases.length === 0 ? (
        <div className="border border-dashed border-prussian/20 bg-white px-6 py-14 text-center">
          <ImagePlus className="mx-auto h-8 w-8 text-bronze" />

          <h3 className="mt-4 font-heading text-xl font-bold text-prussian">
            No workshop showcases yet
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate">
            Add your first before-and-after project to begin building the public
            workshop portfolio.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {showcases.map((showcase) => {
            const busy = actionId === showcase.showcase_id;

            return (
              <article
                key={showcase.showcase_id}
                className={`border bg-white ${
                  showcase.is_active
                    ? "border-prussian/10"
                    : "border-prussian/10 opacity-70"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <ShowcaseGallery
                    images={showcase.before_images}
                    type="before"
                    title={showcase.title}
                  />

                  <ShowcaseGallery
                    images={showcase.after_images}
                    type="after"
                    title={showcase.title}
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-prussian">
                          {showcase.title}
                        </h3>

                        <span
                          className={`px-2 py-1 text-xs font-bold ${
                            showcase.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-slate"
                          }`}
                        >
                          {showcase.is_active ? "Active" : "Archived"}
                        </span>
                      </div>

                      {showcase.description && (
                        <p className="mt-2 text-sm leading-6 text-slate">
                          {showcase.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {(showcase.service_name || showcase.branch_name) && (
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-slate">
                      {showcase.service_name && (
                        <span>Service: {showcase.service_name}</span>
                      )}

                      {showcase.branch_name && (
                        <span>Branch: {showcase.branch_name}</span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs font-semibold text-slate">
                    {showcase.before_images.length} before photo
                    {showcase.before_images.length === 1 ? "" : "s"} ·{" "}
                    {showcase.after_images.length} after photo
                    {showcase.after_images.length === 1 ? "" : "s"}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-prussian/10 pt-4">
                    <button
                      type="button"
                      onClick={() => startEdit(showcase)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 border border-prussian/15 px-3 py-2 text-xs font-bold text-prussian transition hover:border-bronze"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleStatusChange(showcase)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 border border-prussian/15 px-3 py-2 text-xs font-bold text-prussian transition hover:border-bronze disabled:opacity-50"
                    >
                      {showcase.is_active ? (
                        <>
                          <Archive className="h-3.5 w-3.5" />
                          Archive
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(showcase)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
