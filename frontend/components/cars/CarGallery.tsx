"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Images,
} from "lucide-react";
import {
  TouchEvent,
  useState,
} from "react";

import { getCarImageUrl } from "@/lib/api/cars";
import type { CarImage } from "@/types/car";

type CarGalleryProps = {
  images: CarImage[];
  carName: string;
};

export default function CarGallery({
  images,
  carName,
}: CarGalleryProps) {
  const [activeIndex, setActiveIndex] =
    useState(0);

  const [touchStart, setTouchStart] =
    useState<number | null>(null);

  const [touchEnd, setTouchEnd] =
    useState<number | null>(null);

  const galleryImages =
    images.length > 0
      ? images
      : [];

  const activeImage =
    galleryImages[activeIndex];

  function previousImage() {
    if (galleryImages.length <= 1) return;

    setActiveIndex((current) =>
      current === 0
        ? galleryImages.length - 1
        : current - 1,
    );
  }

  function nextImage() {
    if (galleryImages.length <= 1) return;

    setActiveIndex((current) =>
      current === galleryImages.length - 1
        ? 0
        : current + 1,
    );
  }

  function handleTouchStart(
    event: TouchEvent<HTMLDivElement>,
  ) {
    setTouchEnd(null);
    setTouchStart(
      event.targetTouches[0].clientX,
    );
  }

  function handleTouchMove(
    event: TouchEvent<HTMLDivElement>,
  ) {
    setTouchEnd(
      event.targetTouches[0].clientX,
    );
  }

  function handleTouchEnd() {
    if (
      touchStart === null ||
      touchEnd === null
    ) {
      return;
    }

    const distance =
      touchStart - touchEnd;

    const minimumSwipeDistance = 50;

    if (
      distance >
      minimumSwipeDistance
    ) {
      nextImage();
    }

    if (
      distance <
      -minimumSwipeDistance
    ) {
      previousImage();
    }
  }

  return (
    <div>
      <div
        className="relative aspect-[16/8.5] overflow-hidden bg-[#e9ecef] sm:aspect-[16/8]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeImage ? (
          <Image
            src={getCarImageUrl(
              activeImage,
            )}
            alt={
              activeImage.alt_text ??
              carName
            }
            fill
            priority
            sizes="100vw"
            className="object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-prussian/5">
            <div className="text-center text-slate">
              <Images
                size={42}
                strokeWidth={1.4}
                className="mx-auto"
              />

              <p className="mt-3 text-sm">
                No vehicle images available.
              </p>
            </div>
          </div>
        )}

        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous vehicle image"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-prussian/90 text-white backdrop-blur transition-transform hover:scale-105 sm:left-6"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next vehicle image"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-prussian/90 text-white backdrop-blur transition-transform hover:scale-105 sm:right-6"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-5 right-5 rounded-full bg-prussian/85 px-4 py-2 font-mono text-xs text-white backdrop-blur">
              {activeIndex + 1} /{" "}
              {galleryImages.length}
            </div>
          </>
        )}
      </div>

      {galleryImages.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {galleryImages.map(
            (image, index) => (
              <button
                key={image.image_id}
                type="button"
                onClick={() =>
                  setActiveIndex(index)
                }
                aria-label={`View image ${
                  index + 1
                }`}
                className={`h-2 transition-all duration-300 ${
                  index ===
                  activeIndex
                    ? "w-10 bg-prussian"
                    : "w-2 bg-prussian/20 hover:bg-prussian/40"
                }`}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}