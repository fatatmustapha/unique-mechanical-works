"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getCurrentUser, logout } from "@/lib/api/auth";

import type { Customer } from "@/types/auth";

const navigation = [
  {
    label: "Cars for Sale",
    href: "/cars",
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "About Us",
    href: "/#about",
  },
  {
    label: "Book Appointment",
    href: "/book-appointment",
  },
  {
    label: "Sell Your Car",
    href: "/sell-your-car",
  },
];

type NavbarProps = {
  solid?: boolean;
};

export default function Navbar({ solid = false }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const accountMenuRef = useRef<HTMLDivElement>(null);

  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);

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

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await getCurrentUser();

        if (!active) {
          return;
        }

        if (response.data.accountType === "customer") {
          setCustomer(response.data.customer);
        } else {
          setCustomer(null);
        }
      } catch {
        if (active) {
          setCustomer(null);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logout();

      setCustomer(null);
      setAccountMenuOpen(false);
      setMenuOpen(false);

      router.push("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const isHomePage = pathname === "/";

  const showSolidNavbar =
    solid || !isHomePage || scrolledPastHero || menuOpen || accountMenuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        showSolidNavbar
          ? "bg-prussian shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-24 lg:px-12">
        {/* LOGO */}
        <Link
          href="/"
          aria-label="Unique Mechanical Works home"
          className="relative z-50 flex items-center"
          onClick={() => {
            setMenuOpen(false);
            setAccountMenuOpen(false);
          }}
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

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-2 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white"
            >
              {item.label}

              <span className="absolute bottom-0 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {!authLoading && !customer && (
            <Link
              href="/login"
              className="ml-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-bronze hover:bg-bronze hover:text-prussian"
            >
              Login
            </Link>
          )}

          {!authLoading && customer && (
            <div ref={accountMenuRef} className="relative ml-2">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((current) => !current)}
                aria-expanded={accountMenuOpen}
                className="flex items-center gap-2 rounded-full border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-bronze"
              >
                <UserRound size={17} />

                <span>My Dashboard</span>
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] w-64 border border-gray-200 bg-white py-2 shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                      Signed in as
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-[#08294B]">
                      {customer.first_name} {customer.last_name}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#6B7280]">
                      {customer.phone}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#08294B] transition hover:bg-[#F7F7F5]"
                  >
                    <UserRound size={17} />
                    My Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#6B1D1D] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={17} />

                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}

          {authLoading && (
            <div className="ml-2 h-10 w-24 animate-pulse rounded-full bg-white/10" />
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((current) => !current);

            setAccountMenuOpen(false);
          }}
          className="relative z-50 flex h-11 w-11 items-center justify-center text-white lg:hidden"
        >
          {menuOpen ? <X size={27} /> : <Menu size={27} />}
        </button>
      </nav>

      {/* MOBILE NAVIGATION */}
      <div
        className={`overflow-hidden bg-prussian transition-all duration-500 lg:hidden ${
          menuOpen ? "max-h-[720px] border-t border-white/10" : "max-h-0"
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

          {!authLoading && !customer && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-bronze px-6 font-semibold text-prussian transition-colors duration-300 hover:bg-[#d9a83c]"
            >
              Login
            </Link>
          )}

          {!authLoading && customer && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                Signed in as
              </p>

              <p className="mt-2 font-semibold text-white">
                {customer.first_name} {customer.last_name}
              </p>

              <p className="mt-1 text-sm text-white/60">{customer.phone}</p>

              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="mt-5 flex min-h-12 items-center justify-center gap-2 bg-bronze px-6 font-semibold text-prussian transition hover:bg-[#d9a83c]"
              >
                <UserRound size={18} />
                My Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 border border-white/20 px-6 font-semibold text-white transition hover:border-white/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={18} />

                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
