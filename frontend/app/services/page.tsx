"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useEffect, useMemo, useState } from "react";

import { getServices } from "@/lib/api/appointments";
import { getPublicServiceShowcases } from "@/lib/api/service-showcases";

import type { Service } from "@/types/appointment";
import type {
  ServiceShowcase,
  ServiceShowcaseImage,
} from "@/types/service-showcase";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

function getImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${BACKEND_URL}${path}`;
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
          No photo available
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

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
        <span
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${
            type === "before"
              ? "bg-black/80 text-white"
              : "bg-bronze text-prussian"
          }`}
        >
          {type}
        </span>

        <span className="bg-black/75 px-2.5 py-1.5 text-xs font-semibold text-white">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label={`Previous ${type} photo`}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/65 text-white transition hover:bg-black/85"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label={`Next ${type} photo`}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/65 text-white transition hover:bg-black/85"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  const [showcases, setShowcases] = useState<ServiceShowcase[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");

        const [serviceData, showcaseData] = await Promise.all([
          getServices(),
          getPublicServiceShowcases(),
        ]);

        setServices(serviceData);
        setShowcases(showcaseData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load our services at the moment.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, []);

  const activeServices = useMemo(
    () =>
      services
        .filter((service) => service.is_active)
        .sort(
          (first, second) =>
            first.display_order - second.display_order ||
            first.name.localeCompare(second.name),
        ),
    [services],
  );

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F8F8F6]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-bronze" />

          <p className="mt-3 text-sm font-semibold text-slate">
            Loading services...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar solid />

      <main className="bg-[#F8F8F6] pt-20 lg:pt-24">
        {/* Hero */}
        <section className="bg-prussian">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-bronze">
              Unique Mechanical Works
            </p>

            <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Professional Automotive Services
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              From routine maintenance to complex repairs and body restoration,
              our workshops provide dependable automotive care in Kano and
              Abuja.
            </p>

            <Link
              href="/book-appointment"
              className="mt-8 inline-flex items-center gap-2 bg-bronze px-6 py-3.5 text-sm font-bold text-prussian transition hover:opacity-90"
            >
              <CalendarDays className="h-4 w-4" />
              Book an Appointment
            </Link>
          </div>
        </section>

        {error && (
          <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Services */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-bronze">
              What We Do
            </p>

            <h2 className="mt-2 font-heading text-3xl font-bold text-prussian sm:text-4xl">
              Our Services
            </h2>

            <p className="mt-4 leading-7 text-slate">
              Explore our automotive repair, maintenance, body work and
              specialist workshop services.
            </p>
          </div>

          {activeServices.length === 0 ? (
            <div className="mt-10 border border-prussian/10 bg-white px-6 py-12 text-center">
              <Wrench className="mx-auto h-8 w-8 text-bronze" />

              <p className="mt-3 text-sm text-slate">
                Service information will be available soon.
              </p>
            </div>
          ) : (
            <div className="mt-10 border-y border-prussian/10">
              {activeServices.map((service, index) => (
                <div
                  key={service.service_id}
                  className={`flex items-start gap-4 py-5 ${
                    index !== activeServices.length - 1
                      ? "border-b border-prussian/10"
                      : ""
                  }`}
                >
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center bg-prussian">
                    <Wrench className="h-5 w-5 text-bronze" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="font-heading text-lg font-bold text-prussian">
                        {service.name}
                      </h3>

                      {service.category && (
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-bronze">
                          {service.category}
                        </span>
                      )}
                    </div>

                    {(service.short_description || service.description) && (
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate">
                        {service.short_description ?? service.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Before & After */}
        {showcases.length > 0 && (
          <section className="border-y border-prussian/10 bg-white">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-bronze">
                  Workshop Portfolio
                </p>

                <h2 className="mt-2 font-heading text-3xl font-bold text-prussian sm:text-4xl">
                  Our Work — Before & After
                </h2>

                <p className="mt-4 leading-7 text-slate">
                  See examples of vehicles before and after work carried out by
                  the Unique Mechanical Works team. Use the arrows to view each
                  project from different angles.
                </p>
              </div>

              <div className="mt-10 space-y-10">
                {showcases.map((showcase) => (
                  <article
                    key={showcase.showcase_id}
                    className="border border-prussian/10 bg-[#F8F8F6]"
                  >
                    <div className="grid lg:grid-cols-2">
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

                    <div className="p-5 sm:p-7">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-heading text-2xl font-bold text-prussian">
                            {showcase.title}
                          </h3>

                          {showcase.description && (
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate">
                              {showcase.description}
                            </p>
                          )}
                        </div>

                        {(showcase.service_name || showcase.branch_name) && (
                          <div className="shrink-0 text-sm text-slate">
                            {showcase.service_name && (
                              <p>
                                <span className="font-semibold text-prussian">
                                  Service:
                                </span>{" "}
                                {showcase.service_name}
                              </p>
                            )}

                            {showcase.branch_name && (
                              <p className="mt-1">
                                <span className="font-semibold text-prussian">
                                  Branch:
                                </span>{" "}
                                {showcase.branch_name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
      </main>

      <Footer />
    </>
  );
}
