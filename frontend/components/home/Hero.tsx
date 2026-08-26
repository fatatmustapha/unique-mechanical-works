import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home-hero"
      className="relative isolate flex min-h-screen overflow-hidden bg-prussian"
    >
      <Image
        src="/images/home/hero/hero.png"
        alt="Premium vehicle inside the Unique Mechanical Works showroom"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center]"
      />

      {/* Image treatment */}
      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07182c]/95 via-[#07182c]/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-prussian/45 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-20 lg:pt-32">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-9 bg-bronze" />
            <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-bronze sm:text-sm">
              Kano&nbsp;&nbsp;•&nbsp;&nbsp;Abuja
            </p>
          </div>

          <h1 className="font-heading text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Drive
            <br />
            Excellence.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            Premium vehicles, expert mechanical care, and craftsmanship
            without shortcuts.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/cars"
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-bronze px-7 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c] hover:shadow-lg hover:shadow-black/20"
            >
              Browse Cars
              <span aria-hidden="true" className="ml-3">
                →
              </span>
            </Link>

            <Link
              href="/book-appointment"
              className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10"
            >
              Book a Service
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-5 z-10 hidden items-center gap-3 text-white/50 sm:flex sm:right-8 lg:right-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
          Scroll to explore
        </span>
        <span className="block h-10 w-px bg-white/30" />
      </div>
    </section>
  );
}