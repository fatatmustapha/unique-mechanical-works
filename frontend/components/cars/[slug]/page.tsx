import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CarGallery from "@/components/cars/CarGallery";

import {
  getCarBySlug,
  getCarImages,
} from "@/lib/api/cars";

import {
  ArrowLeft,
  Gauge,
  Heart,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import Link from "next/link";
import { notFound } from "next/navigation";

type CarDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPrice(price: number) {
  return `₦ ${price.toLocaleString(
    "en-NG",
  )}`;
}

function formatMileage(
  mileage: number | null,
) {
  if (mileage === null) {
    return "Not specified";
  }

  return `${mileage.toLocaleString(
    "en-NG",
  )} km`;
}

export default async function CarDetailsPage({
  params,
}: CarDetailsPageProps) {
  const { slug } = await params;

  let car;

  try {
    const response =
      await getCarBySlug(slug);

    car = response.data;
  } catch {
    notFound();
  }

  const imageResponse =
    await getCarImages(
      car.car_id,
    ).catch(() => ({
      success: true,
      data: [],
    }));

  const images =
    imageResponse.data;

  const carName =
    `${car.make} ${car.model}`;

  const emailSubject =
    encodeURIComponent(
      `Enquiry about ${carName}`,
    );

  const emailBody =
    encodeURIComponent(
      `Hello Unique Mechanical Works,\n\nI am interested in the ${carName} listed on your website.\n\nReference: ${car.reference_number}\n\nPlease contact me with more information about this vehicle.`,
    );

  const contactEmail =
    `mailto:uniquemwn@gmail.com?subject=${emailSubject}&body=${emailBody}`;

  return (
    <>
      <Navbar />

      <main className="bg-snow">
        {/* TOP SPACE / BREADCRUMB */}
        <section className="bg-prussian px-5 pb-7 pt-32 text-white sm:px-8 lg:px-12 lg:pt-36">
          <div className="mx-auto max-w-[1440px]">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/65 transition-colors hover:text-bronze"
            >
              <ArrowLeft size={17} />
              Back to Cars
            </Link>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-[1440px]">
            {/* GALLERY */}
            <CarGallery
              images={images}
              carName={carName}
            />

            {/* VEHICLE INFO */}
            <div className="mt-14 grid gap-14 border-t border-prussian/10 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              {/* LEFT SIDE */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-9 bg-bronze" />

                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-bronze">
                    Vehicle Details
                  </p>
                </div>

                <div className="mt-6 flex items-start justify-between gap-5">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate">
                      {car.year ??
                        "Year not specified"}
                    </p>

                    <h1 className="mt-2 font-heading text-4xl font-bold leading-tight tracking-[-0.035em] text-prussian sm:text-5xl">
                      {carName}
                    </h1>
                  </div>

                  <button
                    type="button"
                    aria-label={`Save ${carName} to favorites`}
                    className="flex h-12 w-12 shrink-0 items-center justify-center border border-prussian/15 text-prussian transition-colors hover:border-bronze hover:bg-bronze"
                  >
                    <Heart
                      size={21}
                      strokeWidth={1.8}
                    />
                  </button>
                </div>

                <p className="mt-8 font-heading text-3xl font-bold text-prussian sm:text-4xl">
                  {formatPrice(
                    car.price,
                  )}
                </p>

                {car.negotiable && (
                  <p className="mt-2 text-sm font-medium text-bronze">
                    Price negotiable
                  </p>
                )}

                <div className="mt-10 border-t border-prussian/10 pt-8">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        car.sale_status ===
                        "available"
                          ? "bg-green-600"
                          : car.sale_status ===
                              "reserved"
                            ? "bg-bronze"
                            : "bg-mahogany"
                      }`}
                    />

                    <p className="text-sm font-semibold capitalize text-prussian">
                      {car.sale_status}
                    </p>
                  </div>

                  <div className="mt-5 flex items-start gap-3 text-sm text-slate">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-bronze"
                    />

                    <div>
                      <p className="font-semibold text-prussian">
                        {car.branch_name}
                      </p>

                      <p className="mt-1">
                        Unique Mechanical Works
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONTACT CTA */}
                <div className="mt-10 border-t border-prussian/10 pt-8">
                  <h2 className="font-heading text-2xl font-bold text-prussian">
                    Interested in this car?
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-7 text-slate">
                    Speak directly with
                    Unique Mechanical Works
                    for availability,
                    inspection arrangements,
                    payment information, or
                    any questions about this
                    vehicle.
                  </p>

                  <a
                    href={contactEmail}
                    className="mt-6 inline-flex min-h-13 w-full items-center justify-center bg-bronze px-7 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c] sm:w-auto"
                  >
                    <Mail
                      size={18}
                      className="mr-3"
                    />

                    Contact Us About This Car
                  </a>

                  <div className="mt-4 flex flex-wrap gap-5 text-sm">
                    <a
                      href="tel:08037877610"
                      className="inline-flex items-center gap-2 font-medium text-prussian transition-colors hover:text-bronze"
                    >
                      <Phone size={16} />
                      08037877610
                    </a>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div>
                <h2 className="font-heading text-3xl font-bold text-prussian">
                  Specifications
                </h2>

                <div className="mt-7 grid border-t border-prussian/10 sm:grid-cols-2">
                  <Specification
                    label="Transmission"
                    value={
                      car.transmission ??
                      "Not specified"
                    }
                  />

                  <Specification
                    label="Fuel Type"
                    value={
                      car.fuel_type ??
                      "Not specified"
                    }
                  />

                  <Specification
                    label="Body Type"
                    value={
                      car.body_type ??
                      "Not specified"
                    }
                  />

                  <Specification
                    label="Mileage"
                    value={formatMileage(
                      car.mileage,
                    )}
                  />

                  <Specification
                    label="Drivetrain"
                    value={
                      car.drivetrain ??
                      "Not specified"
                    }
                  />

                  <Specification
                    label="Engine"
                    value={
                      car.engine_size ??
                      "Not specified"
                    }
                  />

                  <Specification
                    label="Horsepower"
                    value={
                      car.horsepower
                        ? `${car.horsepower} hp`
                        : "Not specified"
                    }
                  />

                  <Specification
                    label="Exterior Color"
                    value={
                      car.color_exterior ??
                      "Not specified"
                    }
                  />

                  <Specification
                    label="Interior Color"
                    value={
                      car.color_interior ??
                      "Not specified"
                    }
                  />

                  <Specification
                    label="Reference"
                    value={
                      car.reference_number
                    }
                  />
                </div>

                {/* DESCRIPTION */}
                {car.description && (
                  <div className="mt-12 border-t border-prussian/10 pt-9">
                    <h2 className="font-heading text-3xl font-bold text-prussian">
                      About this vehicle
                    </h2>

                    <p className="mt-5 max-w-3xl text-base leading-8 text-slate">
                      {car.description}
                    </p>
                  </div>
                )}

                {/* FEATURES */}
                {car.features &&
                  car.features.length >
                    0 && (
                    <div className="mt-12 border-t border-prussian/10 pt-9">
                      <h2 className="font-heading text-3xl font-bold text-prussian">
                        Features
                      </h2>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {car.features.map(
                          (feature) => (
                            <div
                              key={feature}
                              className="flex items-start gap-3 border-b border-prussian/10 pb-3 text-sm text-graphite"
                            >
                              <Gauge
                                size={16}
                                className="mt-0.5 shrink-0 text-bronze"
                              />

                              <span>
                                {feature}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

type SpecificationProps = {
  label: string;
  value: string;
};

function Specification({
  label,
  value,
}: SpecificationProps) {
  return (
    <div className="border-b border-prussian/10 py-5 sm:odd:pr-8 sm:even:border-l sm:even:border-l-prussian/10 sm:even:pl-8">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate">
        {label}
      </p>

      <p className="mt-2 text-base font-semibold text-prussian">
        {value}
      </p>
    </div>
  );
}