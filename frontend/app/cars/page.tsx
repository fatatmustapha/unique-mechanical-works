import CarsMarketplace from "@/components/cars/CarsMarketplace";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function CarsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-snow">
        <section className="bg-prussian px-5 pb-16 pt-36 text-white sm:px-8 lg:px-12 lg:pb-20 lg:pt-40">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-bronze" />

              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-bronze">
                Vehicle Marketplace
              </p>
            </div>

            <h1 className="mt-6 max-w-3xl font-heading text-5xl font-bold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Explore our
              <br />
              available vehicles.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Discover carefully selected vehicles available through Unique
              Mechanical Works in Kano and Abuja.
            </p>
          </div>
        </section>

        <CarsMarketplace />
      </main>

      <Footer />
    </>
  );
}