"use client";

import CarCard from "@/components/cars/CarCard";

import {
  getCarImages,
  getCarImageUrl,
  getCars,
} from "@/lib/api/cars";

import type {
  Car,
  CarImage,
  FuelType,
  Transmission,
} from "@/types/car";

import {
  ChevronDown,
  Filter,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type SortOption =
  | "latest"
  | "price_asc"
  | "price_desc"
  | "year_asc"
  | "year_desc";

type CarWithImage = Car & {
  primaryImage?: CarImage;
};

function formatPrice(price: number) {
  return `₦ ${price.toLocaleString(
    "en-NG",
  )}`;
}

export default function CarsMarketplace() {
  const [cars, setCars] =
    useState<CarWithImage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [sortOpen, setSortOpen] =
    useState(false);

  const [
    transmission,
    setTransmission,
  ] = useState("");

  const [fuelType, setFuelType] =
    useState("");

  const [bodyType, setBodyType] =
    useState("");

  const [sort, setSort] =
    useState<SortOption>("latest");

  /*
   * Fetch real marketplace cars.
   *
   * Filters and sorting are sent to
   * the backend.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCars() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getCars({
            page: 1,
            limit: 12,

            transmission:
              transmission
                ? (transmission as Transmission)
                : undefined,

            fuel_type:
              fuelType
                ? (fuelType as FuelType)
                : undefined,

            body_type:
              bodyType || undefined,

            sort,
          });

        /*
         * Load the gallery for each car.
         *
         * The backend orders images with
         * the primary image first.
         */
        const carsWithImages =
          await Promise.all(
            response.data.map(
              async (car) => {
                try {
                  const imageResponse =
                    await getCarImages(
                      car.car_id,
                    );

                  const primaryImage =
                    imageResponse.data.find(
                      (image) =>
                        image.is_primary,
                    ) ??
                    imageResponse.data[0];

                  return {
                    ...car,
                    primaryImage,
                  };
                } catch {
                  /*
                   * A missing gallery should
                   * not break the marketplace.
                   */
                  return car;
                }
              },
            ),
          );

        if (!cancelled) {
          setCars(carsWithImages);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load vehicles.",
          );

          setCars([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCars();

    return () => {
      cancelled = true;
    };
  }, [
    transmission,
    fuelType,
    bodyType,
    sort,
  ]);

  /*
   * Search is currently applied to the
   * cars loaded from the API.
   *
   * We have not confirmed a dedicated
   * backend free-text search parameter,
   * so we do not invent one.
   */
  const visibleCars = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return cars;
    }

    return cars.filter((car) => {
      const searchableName =
        `${car.make} ${car.model}`
          .toLowerCase();

      return searchableName.includes(
        query,
      );
    });
  }, [cars, search]);

  const hasFilters =
    transmission !== "" ||
    fuelType !== "" ||
    bodyType !== "";

  function clearFilters() {
    setTransmission("");
    setFuelType("");
    setBodyType("");
  }

  return (
    <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1440px]">
        {/* TOOLBAR */}
        <div className="relative grid gap-4 border-b border-prussian/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* SEARCH */}
          <div className="relative max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search vehicles"
              className="h-13 w-full border border-prussian/15 bg-white pl-12 pr-4 text-sm text-graphite outline-none transition-colors placeholder:text-slate/70 focus:border-prussian"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* FILTER */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setFilterOpen(
                    (current) =>
                      !current,
                  );

                  setSortOpen(false);
                }}
                className={`inline-flex h-13 items-center gap-2 border px-5 text-sm font-semibold transition-colors ${
                  filterOpen ||
                  hasFilters
                    ? "border-prussian bg-prussian text-white"
                    : "border-prussian/15 bg-white text-prussian hover:border-prussian"
                }`}
              >
                <Filter size={18} />

                Filters
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-[320px] border border-prussian/10 bg-white p-6 shadow-[0_20px_50px_rgba(11,37,69,0.15)]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-xl font-bold text-prussian">
                      Filter vehicles
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setFilterOpen(false)
                      }
                      aria-label="Close filters"
                      className="text-slate transition-colors hover:text-prussian"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mt-6 space-y-5">
                    <FilterSelect
                      label="Transmission"
                      value={transmission}
                      onChange={
                        setTransmission
                      }
                      options={[
                        "Automatic",
                        "Manual",
                      ]}
                    />

                    <FilterSelect
                      label="Fuel Type"
                      value={fuelType}
                      onChange={
                        setFuelType
                      }
                      options={[
                        "Petrol",
                        "Diesel",
                        "Hybrid",
                        "Electric",
                      ]}
                    />

                    <FilterSelect
                      label="Body Type"
                      value={bodyType}
                      onChange={setBodyType}
                      options={[
                        "Sedan",
                        "SUV",
                      ]}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={!hasFilters}
                    className={`mt-6 text-sm font-semibold underline decoration-bronze underline-offset-4 ${
                      hasFilters
                        ? "text-prussian"
                        : "cursor-not-allowed text-slate/40"
                    }`}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* SORT */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSortOpen(
                    (current) =>
                      !current,
                  );

                  setFilterOpen(false);
                }}
                className="inline-flex h-13 items-center gap-2 border border-prussian/15 bg-white px-5 text-sm font-semibold text-prussian transition-colors hover:border-prussian"
              >
                <SlidersHorizontal
                  size={18}
                />

                Sort

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    sortOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-30 min-w-[220px] border border-prussian/10 bg-white py-2 shadow-[0_20px_50px_rgba(11,37,69,0.15)]">
                  {[
                    [
                      "latest",
                      "Latest",
                    ],
                    [
                      "price_asc",
                      "Price: Low to High",
                    ],
                    [
                      "price_desc",
                      "Price: High to Low",
                    ],
                    [
                      "year_desc",
                      "Year: Newest First",
                    ],
                    [
                      "year_asc",
                      "Year: Oldest First",
                    ],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setSort(
                            value as SortOption,
                          );

                          setSortOpen(false);
                        }}
                        className={`block w-full px-5 py-3 text-left text-sm transition-colors hover:bg-snow ${
                          sort === value
                            ? "font-semibold text-prussian"
                            : "text-slate"
                        }`}
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex flex-col gap-3 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-bronze">
              Available Inventory
            </p>

            <h2 className="mt-2 font-heading text-3xl font-bold text-prussian">
              Cars for Sale
            </h2>
          </div>

          {!loading && !error && (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-slate">
              {visibleCars.length}{" "}
              {visibleCars.length === 1
                ? "vehicle"
                : "vehicles"}
            </p>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center border border-prussian/10 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-bronze"
              />

              <p className="mt-4 text-sm text-slate">
                Loading vehicles...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="border border-mahogany/20 bg-white px-6 py-16 text-center">
            <p className="font-heading text-2xl font-bold text-prussian">
              We couldn&apos;t load the
              vehicles.
            </p>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate">
              {error}
            </p>
          </div>
        )}

        {/* GRID */}
        {!loading &&
          !error &&
          visibleCars.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {visibleCars.map((car) => {
                const image =
                  getCarImageUrl(
                    car.primaryImage,
                  );

                return (
                  <CarCard
                    key={car.car_id}
                    slug={car.slug}
                    name={`${car.make} ${car.model}`}
                    year={car.year}
                    transmission={
                      car.transmission
                    }
                    fuelType={
                      car.fuel_type
                    }
                    price={formatPrice(
                      car.price,
                    )}
                    image={image}
                    imageAlt={
                      car.primaryImage
                        ?.alt_text ??
                      `${car.make} ${car.model}`
                    }
                  />
                );
              })}
            </div>
          )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          visibleCars.length === 0 && (
            <div className="border border-prussian/10 bg-white px-6 py-20 text-center">
              <p className="font-heading text-2xl font-bold text-prussian">
                No vehicles found.
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate">
                There are currently no
                published vehicles matching
                your search or filters.
              </p>

              {(search ||
                hasFilters) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    clearFilters();
                  }}
                  className="mt-6 bg-bronze px-6 py-3 text-sm font-bold text-prussian"
                >
                  Reset Search
                </button>
              )}
            </div>
          )}
      </div>
    </section>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full border border-prussian/15 bg-white px-3 text-sm text-prussian outline-none transition-colors focus:border-prussian"
      >
        <option value="">
          All
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}