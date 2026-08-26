import Image from "next/image";
import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Mechanical Repairs",
    description:
      "Reliable diagnostics, repairs, and maintenance carried out with careful attention to performance and safety.",
  },
  {
    number: "02",
    title: "Repainting",
    description:
      "Professional refinishing that restores depth, consistency, and presence to your vehicle.",
  },
  {
    number: "03",
    title: "Bodywork",
    description:
      "Precision body repair and restoration focused on clean lines, strong finishes, and lasting quality.",
  },
  {
    number: "04",
    title: "Vehicle Upgrades",
    description:
      "Thoughtful upgrades that enhance appearance, comfort, capability, and the overall driving experience.",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-snow py-24 sm:py-28 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12">
        {/* SERVICES CONTENT */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-9 bg-bronze" />

            <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-bronze">
              Our Services
            </p>
          </div>

          <div className="max-w-2xl">
            <h2 className="font-heading text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-prussian sm:text-6xl">
              Everything your
              <br />
              vehicle needs.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate sm:text-lg">
              From mechanical care to refinishing and upgrades, our services are
              built around precision, quality, and confidence on the road.
            </p>
          </div>

          {/* SERVICE LIST */}
          <div className="mt-12 border-t border-prussian/15">
            {services.map((service) => (
              <div
                key={service.number}
                className="grid gap-4 border-b border-prussian/15 py-8 sm:grid-cols-[85px_1fr]"
              >
                {/* Larger / stronger number */}
                <span className="font-heading text-2xl font-bold tracking-[-0.02em] text-bronze sm:text-3xl">
                  {service.number}
                </span>

                <div>
                  <h3 className="font-heading text-2xl font-semibold text-prussian sm:text-3xl">
                    {service.title}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate sm:text-base">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* SINGLE LINK TO SERVICES PAGE */}
          <div className="mt-10">
            <Link
              href="/services"
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-prussian px-7 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-deep-space"
            >
              Explore All Services
              <span aria-hidden="true" className="ml-3">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* SERVICE IMAGE */}
        <div className="relative min-h-[460px] overflow-hidden lg:min-h-[720px]">
          <Image
            src="/images/home/services/home-service.png"
            alt="Unique Mechanical Works automotive service"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-prussian/70 via-prussian/5 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8">
            <div className="mb-3 h-px w-8 bg-bronze" />

            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze">
              Crafted with care
            </p>

            <p className="mt-3 max-w-sm font-heading text-xl font-semibold leading-relaxed text-white sm:text-2xl">
              Skilled work, thoughtful execution, and attention to every detail.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
