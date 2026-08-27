import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

type CarCardProps = {
  slug: string;
  name: string;

  year: number | null;

  transmission: string | null;

  fuelType: string | null;

  price: string;

  image: string;

  imageAlt?: string;
};

export default function CarCard({
  slug,
  name,
  year,
  transmission,
  fuelType,
  price,
  image,
  imageAlt,
}: CarCardProps) {
  return (
    <article className="group overflow-hidden border border-prussian/10 bg-white shadow-[0_10px_30px_rgba(11,37,69,0.06)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-prussian/20 hover:shadow-[0_24px_55px_rgba(11,37,69,0.14)]">
      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef1f3]">
        <Image
          src={image}
          alt={imageAlt ?? name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]"
        />
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h2 className="font-heading text-2xl font-bold leading-tight text-prussian">
          {name}
        </h2>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-[0.08em] text-slate">
          {year && <span>{year}</span>}

          {year && transmission && (
            <span aria-hidden="true">•</span>
          )}

          {transmission && (
            <span>{transmission}</span>
          )}

          {(year || transmission) &&
            fuelType && (
              <span aria-hidden="true">•</span>
            )}

          {fuelType && (
            <span>{fuelType}</span>
          )}
        </div>

        <p className="mt-5 font-mono text-xl font-semibold text-prussian">
          {price}
        </p>

        <div className="mt-6 grid grid-cols-[1fr_48px] gap-3">
          <Link
            href={`/cars/${slug}`}
            className="inline-flex min-h-12 items-center justify-center bg-bronze px-5 text-sm font-bold text-prussian transition-all duration-300 hover:bg-[#d9a83c]"
          >
            View Details

            <span
              aria-hidden="true"
              className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>

          <button
            type="button"
            aria-label={`Save ${name} to favorites`}
            className="flex h-12 w-12 items-center justify-center border border-prussian/15 text-prussian transition-all duration-300 hover:border-bronze hover:bg-bronze"
          >
            <Heart
              size={20}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
    </article>
  );
}