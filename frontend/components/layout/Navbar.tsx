"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navigation = [
  { label: "Cars for Sale", href: "/cars" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Book Appointment", href: "/book-appointment" },
  { label: "Sell Your Car", href: "/sell-your-car" },
];

export default function Navbar() {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY >= window.innerHeight - 80);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolledPastHero || menuOpen
          ? "bg-prussian shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-24 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Unique Mechanical Works home"
          className="relative z-50 flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/brand/umw-logo.png"
            alt="Unique Mechanical Works"
            width={150}
            height={70}
            priority
            className="h-auto w-[105px] object-contain sm:w-[120px] lg:w-[135px]"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative py-2 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white"
            >
              {item.label}

              <span className="absolute bottom-0 left-0 h-px w-0 bg-bronze transition-all duration-300 hover:w-full" />
            </Link>
          ))}

          <Link
            href="/login"
            className="ml-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-bronze hover:bg-bronze hover:text-prussian"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="relative z-50 flex h-11 w-11 items-center justify-center lg:hidden"
        >
          <span className="sr-only">
            {menuOpen ? "Close menu" : "Open menu"}
          </span>

          <span className="relative block h-5 w-7">
            <span
              className={`absolute left-0 top-1 block h-px w-7 bg-white transition-all duration-300 ${
                menuOpen ? "translate-y-1.5 rotate-45" : ""
              }`}
            />

            <span
              className={`absolute left-0 top-2.5 block h-px w-7 bg-white transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`absolute left-0 top-4 block h-px w-7 bg-white transition-all duration-300 ${
                menuOpen ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`overflow-hidden bg-prussian transition-all duration-500 lg:hidden ${
          menuOpen
            ? "max-h-[560px] border-t border-white/10"
            : "max-h-0"
        }`}
      >
        <div className="flex flex-col px-5 py-6 sm:px-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-white/10 py-4 text-base font-medium text-white/85 transition-colors duration-300 hover:text-bronze"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-bronze px-6 font-semibold text-prussian transition-colors duration-300 hover:bg-[#d9a83c]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}