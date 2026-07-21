"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Button from "../ui/Button";
import { navigationLinks } from "@/lib/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight - 100);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-[#0B2545] shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-8">
        {/* Logo */}

        <Link href="/">
          <Image
            src={
              scrolled
                ? "/logo/logo-dark.png"
                : "/logo/logo-white.png"
            }
            alt="Unique Mechanical Works"
            width={180}
            height={60}
            priority
          />
        </Link>

        {/* Navigation */}

        <nav className="hidden items-center gap-10 lg:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="font-medium text-white transition hover:text-[#C9962B]"
            >
              {link.title}
            </Link>
          ))}

          <Button href="/login">
            Login
          </Button>
        </nav>

        {/* Mobile button (placeholder) */}

        <button className="text-white lg:hidden">
          ☰
        </button>
      </div>
    </header>
  );
}