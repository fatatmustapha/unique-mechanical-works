"use client";

import Link from "next/link";

import {
  Archive,
  CarFront,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  LoaderCircle,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AdminModulePage from "@/components/admin/AdminModulePage";
import AdminSelect from "@/components/admin/AdminSelect";

import {
  deleteAdminCar,
  getAdminCars,
  toggleAdminCarFeatured,
  updateAdminCarPublication,
  updateAdminCarSaleStatus,
  type AdminCar,
} from "@/lib/api/admin-cars";

type PublicationFilter =
  | ""
  | "draft"
  | "published"
  | "archived";

type SaleFilter =
  | ""
  | "available"
  | "reserved"
  | "sold";

type SortOption =
  | "latest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "year_asc"
  | "year_desc";

const publicationOptions = [
  {
    value: "",
    label: "All Publication",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "published",
    label: "Published",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

const saleOptions = [
  {
    value: "",
    label: "All Sale Status",
  },
  {
    value: "available",
    label: "Available",
  },
  {
    value: "reserved",
    label: "Reserved",
  },
  {
    value: "sold",
    label: "Sold",
  },
];

const sortOptions = [
  {
    value: "latest",
    label: "Newest First",
  },
  {
    value: "oldest",
    label: "Oldest First",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
  },
  {
    value: "year_desc",
    label: "Year: Newest",
  },
  {
    value: "year_asc",
    label: "Year: Oldest",
  },
];

const formatPrice = (
  price: number,
) => {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(price);
};

const publicationClasses = (
  status: AdminCar["publication_status"],
) => {
  switch (status) {
    case "published":
      return "border-green-200 bg-green-50 text-green-700";

    case "archived":
      return "border-slate-200 bg-slate-100 text-slate";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
};

const saleClasses = (
  status: AdminCar["sale_status"],
) => {
  switch (status) {
    case "sold":
      return "border-red-200 bg-red-50 text-red-700";

    case "reserved":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-green-200 bg-green-50 text-green-700";
  }
};

export default function AdminVehiclesPage() {
  const [cars, setCars] =
    useState<AdminCar[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    actionCarId,
    setActionCarId,
  ] =
    useState<number | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    publicationStatus,
    setPublicationStatus,
  ] =
    useState<PublicationFilter>(
      "",
    );

  const [
    saleStatus,
    setSaleStatus,
  ] =
    useState<SaleFilter>("");

  const [sort, setSort] =
    useState<SortOption>(
      "latest",
    );

  const [page, setPage] =
    useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadCars =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getAdminCars({
            page,
            limit: 20,

            search:
              search ||
              undefined,

            publication_status:
              publicationStatus ||
              undefined,

            sale_status:
              saleStatus ||
              undefined,

            sort,
          });

        setCars(response.data);

        setPagination(
          response.pagination,
        );
      } catch (
        error: unknown
      ) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to retrieve vehicle inventory.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }, [
      page,
      publicationStatus,
      saleStatus,
      search,
      sort,
    ]);

  useEffect(() => {
    void loadCars();
  }, [loadCars]);

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setPage(1);

    setSearch(
      searchInput.trim(),
    );
  };

  const refreshAfterAction =
    async () => {
      await loadCars();
    };

  const handleFeatured =
    async (carId: number) => {
      try {
        setActionCarId(carId);

        await toggleAdminCarFeatured(
          carId,
        );

        await refreshAfterAction();
      } catch (
        error: unknown
      ) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update featured status.";

        window.alert(message);
      } finally {
        setActionCarId(null);
      }
    };

  const handlePublication =
    async (car: AdminCar) => {
      const nextStatus =
        car.publication_status ===
        "published"
          ? "archived"
          : "published";

      const confirmed =
        window.confirm(
          nextStatus ===
            "published"
            ? `Publish ${car.make} ${car.model}?`
            : `Archive ${car.make} ${car.model}?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionCarId(
          car.car_id,
        );

        await updateAdminCarPublication(
          car.car_id,
          nextStatus,
        );

        await refreshAfterAction();
      } catch (
        error: unknown
      ) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update publication status.";

        window.alert(message);
      } finally {
        setActionCarId(null);
      }
    };

  const handleSaleStatus =
    async (car: AdminCar) => {
      const nextStatus =
        car.sale_status ===
        "sold"
          ? "available"
          : "sold";

      const confirmed =
        window.confirm(
          nextStatus ===
            "sold"
            ? `Mark ${car.make} ${car.model} as sold?`
            : `Mark ${car.make} ${car.model} as available?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionCarId(
          car.car_id,
        );

        await updateAdminCarSaleStatus(
          car.car_id,
          nextStatus,
        );

        await refreshAfterAction();
      } catch (
        error: unknown
      ) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update sale status.";

        window.alert(message);
      } finally {
        setActionCarId(null);
      }
    };

  const handleDelete =
    async (car: AdminCar) => {
      const confirmed =
        window.confirm(
          `Permanently delete the draft vehicle ${car.make} ${car.model}?\n\nThis action cannot be undone.`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionCarId(
          car.car_id,
        );

        await deleteAdminCar(
          car.car_id,
        );

        if (
          cars.length === 1 &&
          page > 1
        ) {
          setPage(
            (current) =>
              current - 1,
          );

          return;
        }

        await refreshAfterAction();
      } catch (
        error: unknown
      ) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to delete vehicle.";

        window.alert(message);
      } finally {
        setActionCarId(null);
      }
    };

  return (
    <AdminModulePage
      eyebrow="Inventory Management"
      title="Vehicle Management"
      description="Create, edit, publish and manage the vehicles that appear in the Unique Mechanical Works public marketplace."
      icon={CarFront}
    >
      <div className="flex flex-col gap-5 border-b border-prussian/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-prussian">
            Vehicle Inventory
          </h2>

          <p className="mt-2 text-sm text-slate">
            {pagination.total ===
            1
              ? "1 vehicle stored in the UMW inventory."
              : `${pagination.total} vehicles stored in the UMW inventory.`}
          </p>
        </div>

        <Link
          href="/admin/vehicles/new"
          className="inline-flex min-h-13 items-center justify-center gap-2 bg-bronze px-6 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c]"
        >
          <Plus size={18} />
          Add New Vehicle
        </Link>
      </div>

      <div className="mt-8 border border-prussian/10 bg-white p-5">
        <form
          onSubmit={
            handleSearch
          }
          className="flex flex-col gap-3 lg:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
            />

            <input
              value={
                searchInput
              }
              onChange={(
                event,
              ) =>
                setSearchInput(
                  event.target
                    .value,
                )
              }
              placeholder="Search make, model, reference number, VIN..."
              className="min-h-12 w-full border border-prussian/15 bg-white pl-11 pr-4 text-sm text-prussian outline-none transition focus:border-bronze"
            />
          </div>

          <AdminSelect
            value={
              publicationStatus
            }
            options={
              publicationOptions
            }
            ariaLabel="Filter by publication status"
            className="lg:w-[190px]"
            onChange={(
              value,
            ) => {
              setPage(1);

              setPublicationStatus(
                value as PublicationFilter,
              );
            }}
          />

          <AdminSelect
            value={
              saleStatus
            }
            options={
              saleOptions
            }
            ariaLabel="Filter by sale status"
            className="lg:w-[190px]"
            onChange={(
              value,
            ) => {
              setPage(1);

              setSaleStatus(
                value as SaleFilter,
              );
            }}
          />

          <AdminSelect
            value={sort}
            options={
              sortOptions
            }
            ariaLabel="Sort vehicles"
            className="lg:w-[210px]"
            onChange={(
              value,
            ) => {
              setPage(1);

              setSort(
                value as SortOption,
              );
            }}
          />

          <button
            type="submit"
            className="min-h-12 bg-prussian px-6 text-sm font-bold text-white transition hover:bg-prussian/90"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="mt-6 flex min-h-72 items-center justify-center border border-prussian/10 bg-white">
          <div className="text-center">
            <LoaderCircle
              size={34}
              className="mx-auto animate-spin text-bronze"
            />

            <p className="mt-4 text-sm font-medium text-slate">
              Loading vehicle
              inventory...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="mt-6 border border-red-200 bg-red-50 px-6 py-10 text-center">
          <h3 className="font-heading text-xl font-bold text-red-800">
            Unable to load
            vehicles
          </h3>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadCars()
            }
            className="mt-5 bg-prussian px-5 py-3 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : cars.length ===
        0 ? (
        <div className="mt-6 border border-prussian/10 bg-white px-6 py-16 text-center">
          <CarFront
            size={38}
            className="mx-auto text-bronze"
          />

          <h3 className="mt-5 font-heading text-2xl font-bold text-prussian">
            No vehicles found
          </h3>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate">
            {search ||
            publicationStatus ||
            saleStatus
              ? "No vehicles match the filters you selected."
              : "There are currently no vehicles stored in the UMW inventory."}
          </p>

          {!search &&
            !publicationStatus &&
            !saleStatus && (
              <Link
                href="/admin/vehicles/new"
                className="mt-6 inline-flex items-center gap-2 bg-bronze px-6 py-3 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c]"
              >
                <Plus
                  size={17}
                />
                Add your first
                vehicle
              </Link>
            )}
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto border border-prussian/10 bg-white lg:block">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead className="border-b border-prussian/10 bg-prussian/[0.035]">
                <tr className="text-xs font-bold uppercase tracking-[0.12em] text-slate">
                  <th className="px-5 py-4">
                    Vehicle
                  </th>

                  <th className="px-5 py-4">
                    Reference
                  </th>

                  <th className="px-5 py-4">
                    Branch
                  </th>

                  <th className="px-5 py-4">
                    Price
                  </th>

                  <th className="px-5 py-4">
                    Publication
                  </th>

                  <th className="px-5 py-4">
                    Sale
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {cars.map(
                  (car) => {
                    const busy =
                      actionCarId ===
                      car.car_id;

                    return (
                      <tr
                        key={
                          car.car_id
                        }
                        className="border-b border-prussian/10 transition-colors last:border-b-0 hover:bg-prussian/[0.02]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-prussian/5 text-prussian">
                              <CarFront
                                size={
                                  21
                                }
                              />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-prussian">
                                  {
                                    car.make
                                  }{" "}
                                  {
                                    car.model
                                  }
                                </p>

                                {car.is_featured && (
                                  <Star
                                    size={
                                      15
                                    }
                                    className="fill-bronze text-bronze"
                                  />
                                )}
                              </div>

                              <p className="mt-1 text-xs text-slate">
                                {car.year ??
                                  "Year not specified"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm font-medium text-prussian">
                          {
                            car.reference_number
                          }
                        </td>

                        <td className="px-5 py-5 text-sm text-slate">
                          {
                            car.branch_name
                          }
                        </td>

                        <td className="px-5 py-5 text-sm font-bold text-prussian">
                          {formatPrice(
                            car.price,
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex border px-2.5 py-1 text-xs font-bold capitalize ${publicationClasses(
                              car.publication_status,
                            )}`}
                          >
                            {
                              car.publication_status
                            }
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex border px-2.5 py-1 text-xs font-bold capitalize ${saleClasses(
                              car.sale_status,
                            )}`}
                          >
                            {
                              car.sale_status
                            }
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/vehicles/${car.car_id}/edit`}
                              title="Edit vehicle"
                              className="flex h-9 w-9 items-center justify-center border border-prussian/10 text-prussian transition hover:border-bronze hover:text-bronze"
                            >
                              <Edit3
                                size={
                                  16
                                }
                              />
                            </Link>

                            <button
                              type="button"
                              title={
                                car.is_featured
                                  ? "Remove featured status"
                                  : "Feature vehicle"
                              }
                              disabled={
                                busy
                              }
                              onClick={() =>
                                void handleFeatured(
                                  car.car_id,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center border border-prussian/10 text-prussian transition hover:border-bronze hover:text-bronze disabled:opacity-40"
                            >
                              <Star
                                size={
                                  16
                                }
                                className={
                                  car.is_featured
                                    ? "fill-bronze text-bronze"
                                    : ""
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title={
                                car.publication_status ===
                                "published"
                                  ? "Archive"
                                  : "Publish"
                              }
                              disabled={
                                busy
                              }
                              onClick={() =>
                                void handlePublication(
                                  car,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center border border-prussian/10 text-prussian transition hover:border-bronze hover:text-bronze disabled:opacity-40"
                            >
                              <Archive
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title={
                                car.sale_status ===
                                "sold"
                                  ? "Mark available"
                                  : "Mark sold"
                              }
                              disabled={
                                busy
                              }
                              onClick={() =>
                                void handleSaleStatus(
                                  car,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center border border-prussian/10 text-prussian transition hover:border-bronze hover:text-bronze disabled:opacity-40"
                            >
                              <CircleDollarSign
                                size={
                                  16
                                }
                              />
                            </button>

                            {car.publication_status ===
                              "draft" && (
                              <button
                                type="button"
                                title="Delete draft"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void handleDelete(
                                    car,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                              >
                                <Trash2
                                  size={
                                    16
                                  }
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-4 lg:hidden">
            {cars.map(
              (car) => {
                const busy =
                  actionCarId ===
                  car.car_id;

                return (
                  <article
                    key={
                      car.car_id
                    }
                    className="border border-prussian/10 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-lg font-bold text-prussian">
                            {
                              car.make
                            }{" "}
                            {
                              car.model
                            }
                          </h3>

                          {car.is_featured && (
                            <Star
                              size={
                                15
                              }
                              className="fill-bronze text-bronze"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate">
                          {
                            car.reference_number
                          }
                        </p>
                      </div>

                      <CarFront
                        size={25}
                        className="shrink-0 text-bronze"
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate">
                          Year
                        </p>

                        <p className="mt-1 font-semibold text-prussian">
                          {car.year ??
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate">
                          Branch
                        </p>

                        <p className="mt-1 font-semibold text-prussian">
                          {
                            car.branch_name
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate">
                          Price
                        </p>

                        <p className="mt-1 font-bold text-prussian">
                          {formatPrice(
                            car.price,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate">
                          Sale Status
                        </p>

                        <p className="mt-1 font-semibold capitalize text-prussian">
                          {
                            car.sale_status
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span
                        className={`border px-2.5 py-1 text-xs font-bold capitalize ${publicationClasses(
                          car.publication_status,
                        )}`}
                      >
                        {
                          car.publication_status
                        }
                      </span>

                      <span
                        className={`border px-2.5 py-1 text-xs font-bold capitalize ${saleClasses(
                          car.sale_status,
                        )}`}
                      >
                        {
                          car.sale_status
                        }
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link
                        href={`/admin/vehicles/${car.car_id}/edit`}
                        className="flex min-h-10 items-center justify-center gap-2 border border-prussian/15 text-sm font-semibold text-prussian transition hover:border-bronze hover:text-bronze"
                      >
                        <Edit3
                          size={
                            15
                          }
                        />
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          void handleFeatured(
                            car.car_id,
                          )
                        }
                        className="flex min-h-10 items-center justify-center gap-2 border border-prussian/15 text-sm font-semibold text-prussian transition hover:border-bronze hover:text-bronze disabled:opacity-40"
                      >
                        <Star
                          size={
                            15
                          }
                        />

                        {car.is_featured
                          ? "Unfeature"
                          : "Feature"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          void handlePublication(
                            car,
                          )
                        }
                        className="flex min-h-10 items-center justify-center gap-2 border border-prussian/15 text-sm font-semibold text-prussian transition hover:border-bronze hover:text-bronze disabled:opacity-40"
                      >
                        <Archive
                          size={
                            15
                          }
                        />

                        {car.publication_status ===
                        "published"
                          ? "Archive"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          void handleSaleStatus(
                            car,
                          )
                        }
                        className="flex min-h-10 items-center justify-center gap-2 border border-prussian/15 text-sm font-semibold text-prussian transition hover:border-bronze hover:text-bronze disabled:opacity-40"
                      >
                        <CircleDollarSign
                          size={
                            15
                          }
                        />

                        {car.sale_status ===
                        "sold"
                          ? "Available"
                          : "Mark Sold"}
                      </button>

                      {car.publication_status ===
                        "draft" && (
                        <button
                          type="button"
                          disabled={
                            busy
                          }
                          onClick={() =>
                            void handleDelete(
                              car,
                            )
                          }
                          className="col-span-2 flex min-h-10 items-center justify-center gap-2 border border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2
                            size={
                              15
                            }
                          />

                          Delete Draft
                        </button>
                      )}
                    </div>
                  </article>
                );
              },
            )}
          </div>

          {pagination.totalPages >
            1 && (
            <div className="mt-6 flex flex-col gap-4 border border-prussian/10 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate">
                Page{" "}
                <span className="font-bold text-prussian">
                  {
                    pagination.page
                  }
                </span>{" "}
                of{" "}
                <span className="font-bold text-prussian">
                  {
                    pagination.totalPages
                  }
                </span>
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        current -
                        1,
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-2 border border-prussian/15 px-4 text-sm font-semibold text-prussian transition hover:border-bronze disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={16}
                  />

                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        current +
                        1,
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-2 border border-prussian/15 px-4 text-sm font-semibold text-prussian transition hover:border-bronze disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next

                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminModulePage>
  );
}