"use client";

import {
  Check,
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export type CustomerSelectOption = {
  value: string;
  label: string;
};

type CustomerSelectProps = {
  value: string;
  options: CustomerSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

export default function CustomerSelect({
  value,
  options,
  onChange,
  placeholder = "Select option",
  ariaLabel = "Select option",
  className = "",
}: CustomerSelectProps) {
  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find(
      (option) =>
        option.value === value,
    ) ?? null;

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        className={`flex min-h-12 w-full items-center justify-between gap-5 border bg-white px-4 text-left text-sm font-medium transition-all duration-200 ${
          open
            ? "border-bronze text-prussian"
            : "border-prussian/15 text-prussian hover:border-bronze/70"
        }`}
      >
        <span
          className={
            selectedOption
              ? "text-prussian"
              : "text-slate/60"
          }
        >
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${
            open
              ? "rotate-180 text-bronze"
              : "text-prussian"
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-full overflow-hidden border border-prussian/10 bg-white py-1 shadow-xl"
        >
          {options.map(
            (option) => {
              const selected =
                option.value ===
                value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={
                    selected
                  }
                  onClick={() => {
                    onChange(
                      option.value,
                    );

                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-5 px-4 py-3 text-left text-sm transition-colors duration-150 ${
                    selected
                      ? "bg-bronze text-prussian"
                      : "bg-white text-prussian hover:bg-bronze hover:text-prussian"
                  }`}
                >
                  <span>
                    {option.label}
                  </span>

                  {selected && (
                    <Check
                      size={15}
                      strokeWidth={
                        2.5
                      }
                      className="shrink-0"
                    />
                  )}
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}