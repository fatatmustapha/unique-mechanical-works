"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function WhyVision() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  // The car rises vertically from below and settles into position.
  const carY = useTransform(scrollYProgress, [0, 1], [260, 0]);
  const carScale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const carOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.65, 1],
    [0, 0.45, 0.9, 1],
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-snow"
      aria-labelledby="why-vision-heading"
    >
      <h2 id="why-vision-heading" className="sr-only">
        Why Unique Mechanical Works and Our Vision
      </h2>

      <div className="relative grid lg:min-h-[800px] lg:grid-cols-2">
        {/* WHY UMW */}
        <div className="flex min-h-[680px] items-center bg-prussian px-6 py-24 text-white sm:px-10 lg:min-h-[800px] lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-xl lg:mx-0 lg:pr-24">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-9 bg-bronze" />

              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-bronze">
                The UMW Standard
              </p>
            </div>

            <h3 className="font-heading text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl">
              Why UMW
            </h3>

            <p className="mt-8 max-w-lg text-base leading-8 text-white/75 sm:text-lg sm:leading-9">
              Every vehicle represents more than transportation — it carries
              value, safety, ambition, and trust. At Unique Mechanical Works,
              experience meets precision in everything we do, from the
              vehicles we sell to the repairs, refinishing, bodywork, and
              upgrades we deliver.
            </p>

            <p className="mt-5 max-w-lg text-base leading-8 text-white/75 sm:text-lg sm:leading-9">
              Across Kano and Abuja, we bring together skilled hands, careful
              attention to detail, and a standard of service designed to give
              every customer complete confidence in their vehicle.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-x-8 border-t border-white/15 pt-7">
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-bronze">
                  Our Presence
                </p>

                <p className="mt-2 text-sm font-medium text-white/80">
                  Kano & Abuja
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-bronze">
                  Our Focus
                </p>

                <p className="mt-2 text-sm font-medium text-white/80">
                  Craftsmanship & Trust
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OUR VISION */}
        <div className="flex min-h-[680px] items-center bg-snow px-6 py-24 sm:px-10 lg:min-h-[800px] lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-xl lg:ml-auto lg:pl-24">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-9 bg-bronze" />

              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-bronze">
                Looking Forward
              </p>
            </div>

            <h3 className="font-heading text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-prussian sm:text-6xl">
              Our Vision
            </h3>

            <p className="mt-8 max-w-lg text-base leading-8 text-slate sm:text-lg sm:leading-9">
              To become one of Nigeria&apos;s most trusted names in automotive
              care and vehicle ownership — a place drivers turn to not only
              when they need a car, but throughout every stage of owning one.
            </p>

            <p className="mt-5 max-w-lg text-base leading-8 text-slate sm:text-lg sm:leading-9">
              We envision Unique Mechanical Works as a lifelong automotive
              partner, combining exceptional vehicles, expert craftsmanship,
              and dependable service under one trusted name.
            </p>

            <div className="mt-10 border-t border-prussian/10 pt-7">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-prussian/50">
                Our Promise
              </p>

              <p className="mt-3 max-w-md font-heading text-xl font-semibold leading-relaxed text-prussian">
                Confidence in every vehicle. Care through every mile.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER CAR — DESKTOP */}
<motion.div
  aria-hidden="true"
  style={{
    y: carY,
    scale: carScale,
    opacity: carOpacity,
  }}
  className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-[480px] -translate-x-1/2 items-center justify-center lg:flex xl:w-[540px]"
>
  <div className="relative aspect-[0.72] w-full">
    <Image
      src="/images/home/vision/top-view.png"
      alt=""
      fill
      sizes="540px"
      className="object-contain drop-shadow-[0_35px_40px_rgba(0,0,0,0.4)]"
    />
  </div>
</motion.div>

        {/* CENTER CAR — MOBILE / TABLET */}
        <motion.div
          aria-hidden="true"
          style={{
            y: carY,
            scale: carScale,
            opacity: carOpacity,
          }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[155px] -translate-x-1/2 -translate-y-1/2 sm:w-[195px] lg:hidden"
        >
          <div className="relative aspect-[0.72] w-full">
            <Image
              src="/images/home/vision/top-view.png"
              alt=""
              fill
              sizes="195px"
              className="object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.35)]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}