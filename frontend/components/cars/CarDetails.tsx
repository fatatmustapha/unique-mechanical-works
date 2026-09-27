"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getCarBySlug, getCarImages, getCarImageUrl } from "@/lib/api/cars";
import type { Car, CarImage } from "@/types/car";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Gauge,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type CarDetailsProps = {
  slug: string;
};

function formatPrice(price: number) {
  return `₦ ${price.toLocaleString("en-NG")}`;
}

function formatMileage(mileage: number | null) {
  if (mileage === null) return null;
  return mileage.toLocaleString("en-NG");
}

export default function CarDetails({ slug }: CarDetailsProps) {
  const [car, setCar] = useState<Car | null>(null);
  const [images, setImages] = useState<CarImage[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCar() {
      try {
        setLoading(true);
        setError(null);

        const carResponse = await getCarBySlug(slug);
        const loadedCar = carResponse.data.car;

        const imageResponse = await getCarImages(loadedCar.car_id);

        if (!cancelled) {
          setCar(loadedCar);
          setImages(imageResponse.data ?? []);
          setActiveImage(0);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load this vehicle.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCar();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  function previousImage() {
    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function nextImage() {
    setActiveImage((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center bg-snow px-5 pt-28">
          <p className="font-mono text-sm uppercase tracking-[0.15em] text-slate">
            Loading vehicle...
          </p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !car) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center bg-snow px-5 pt-28">
          <div className="max-w-lg text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-bronze">
              Vehicle unavailable
            </p>

            <h1 className="mt-4 font-heading text-3xl font-bold text-prussian">
              We couldn&apos;t load this vehicle.
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate">
              {error ?? "This vehicle may no longer be available."}
            </p>

            <Link
              href="/cars"
              className="mt-8 inline-flex items-center gap-2 bg-bronze px-6 py-3 text-sm font-bold text-prussian"
            >
              <ArrowLeft size={17} />
              Back to Cars
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const vehicleName = `${car.make} ${car.model}`;

  const currentImage =
    images.length > 0
      ? getCarImageUrl(images[activeImage])
      : getCarImageUrl(undefined);

  const specifications = [
    ["Year", car.year],
    ["Mileage", formatMileage(car.mileage)],
    ["Condition", car.condition_type],
    ["Transmission", car.transmission],
    ["Fuel Type", car.fuel_type],
    ["Body Type", car.body_type],
    ["Exterior Color", car.color_exterior],
    ["Interior Color", car.color_interior],
    ["Engine", car.engine_size],
    ["Horsepower", car.horsepower ? `${car.horsepower} hp` : null],
    ["Drivetrain", car.drivetrain],
    ["Doors", car.num_doors],
    ["Seats", car.num_seats],
    ["Import Status", car.import_status],
    ["Registration", car.registration_status],
    ["Warranty", car.warranty_status],
    ["Previous Owners", car.num_previous_owners],
  ].filter(([, value]) => value !== null && value !== "");

  return (
    <>
      <Navbar />

      <main className="bg-snow pt-28 lg:pt-32">
        <section className="px-5 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1440px]">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 text-sm font-semibold text-prussian transition-colors hover:text-bronze"
            >
              <ArrowLeft size={17} />
              Back to Cars for Sale
            </Link>

            <div className="mt-7 grid gap-10 xl:grid-cols-[1.35fr_0.65fr] xl:items-start">
              {/* GALLERY */}
              <div>
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eef1f3]">
                  <Image
                    src={currentImage}
                    alt={images[activeImage]?.alt_text ?? vehicleName}
                    fill
                    unoptimized
                    priority
                    sizes="(max-width: 1280px) 100vw, 65vw"
                    className="object-cover"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={previousImage}
                        aria-label="Previous vehicle image"
                        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white text-prussian shadow-lg transition-transform hover:scale-105"
                      >
                        <ChevronLeft size={22} />
                      </button>

                      <button
                        type="button"
                        onClick={nextImage}
                        aria-label="Next vehicle image"
                        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white text-prussian shadow-lg transition-transform hover:scale-105"
                      >
                        <ChevronRight size={22} />
                      </button>

                      <div className="absolute bottom-4 right-4 bg-prussian px-3 py-2 font-mono text-xs text-white">
                        {activeImage + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {images.map((image, index) => (
                      <button
                        key={image.image_id}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`relative aspect-[4/3] overflow-hidden border-2 transition-colors ${
                          activeImage === index
                            ? "border-bronze"
                            : "border-transparent hover:border-prussian/25"
                        }`}
                      >
                        <Image
                          src={getCarImageUrl(image)}
                          alt={
                            image.alt_text ??
                            `${vehicleName} image ${index + 1}`
                          }
                          fill
                          unoptimized
                          sizes="180px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* VEHICLE SUMMARY */}
              <aside className="border-t-4 border-bronze bg-white p-6 shadow-[0_14px_40px_rgba(11,37,69,0.08)] sm:p-8">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-bronze">
                  {car.reference_number}
                </p>

                <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-prussian">
                  {vehicleName}
                </h1>

                <p className="mt-5 font-mono text-3xl font-semibold text-prussian">
                  {formatPrice(car.price)}
                </p>

                {car.negotiable && (
                  <p className="mt-2 text-sm font-semibold text-slate">
                    Price negotiable
                  </p>
                )}

                <div className="mt-8 border-y border-prussian/10 py-6">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="mt-0.5 shrink-0 text-bronze" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
                        Available at
                      </p>
                      <p className="mt-1 font-semibold text-prussian">
                        {car.branch_name}
                      </p>
                    </div>
                  </div>

                  {car.mileage !== null && (
                    <div className="mt-5 flex items-start gap-3">
                      <Gauge
                        size={20}
                        className="mt-0.5 shrink-0 text-bronze"
                      />

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
                          Mileage
                        </p>
                        <p className="mt-1 font-semibold text-prussian">
                          {formatMileage(car.mileage)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("contact")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 bg-bronze px-6 text-center text-sm font-bold text-prussian transition-colors hover:bg-[#d9a83c]"
                >
                  <MessageCircle size={19} />
                  Contact us about this car
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate">
                  Contact Unique Mechanical Works for availability, inspection,
                  and purchase enquiries.
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* DETAILS */}
        <section className="px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-bronze">
                Vehicle Details
              </p>

              <h2 className="mt-3 font-heading text-3xl font-bold text-prussian">
                Specifications
              </h2>

              <div className="mt-7 grid border-l border-t border-prussian/10 sm:grid-cols-2">
                {specifications.map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="border-b border-r border-prussian/10 bg-white px-5 py-5"
                  >
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-slate">
                      {label}
                    </p>

                    <p className="mt-2 font-semibold text-prussian">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {car.description && (
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-bronze">
                    About This Vehicle
                  </p>

                  <h2 className="mt-3 font-heading text-3xl font-bold text-prussian">
                    Description
                  </h2>

                  <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate">
                    {car.description}
                  </p>
                </div>
              )}

              {car.features && car.features.length > 0 && (
                <div className={car.description ? "mt-12" : ""}>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-bronze">
                    Equipment
                  </p>

                  <h2 className="mt-3 font-heading text-3xl font-bold text-prussian">
                    Features
                  </h2>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {car.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 border-b border-prussian/10 pb-3 text-sm font-medium text-prussian"
                      >
                        <Check size={17} className="shrink-0 text-bronze" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
