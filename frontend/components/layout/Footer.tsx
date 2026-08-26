import Link from "next/link";

const navigation = [
  { label: "Cars for Sale", href: "/cars" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Book Appointment", href: "/book-appointment" },
  { label: "Sell Your Car", href: "/sell-your-car" },
];

const branches = [
  {
    name: "Abuja",
    address:
      "Plot 121, Zakhariya Maimalari Street, Beside Now Chelsea Hotel, CBD Abuja",
  },
  {
    name: "Kano",
    address:
      "No. 20 H.W Romai/Baba Brothers Street, Bompai Kano",
  },
];

const phoneNumbers = [
  "08037877610",
  "08057877610",
  "08097877610",
];

const email = "uniquemwn@gmail.com";

function getGoogleMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-prussian text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-14 border-b border-white/15 pb-16 lg:grid-cols-[1.15fr_0.65fr_1fr] lg:gap-20">
          {/* BRAND */}
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-bronze">
              Unique Mechanical Works
            </p>

            <h2 className="mt-5 max-w-xl font-heading text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
              Driven by trust.
              <br />
              Built around your vehicle.
            </h2>

            <p className="mt-6 max-w-lg text-base leading-8 text-white/65">
              Premium vehicle sales and professional automotive care across
              Kano and Abuja.
            </p>

            <div className="mt-9">
              <Link
                href="/book-appointment"
                className="inline-flex min-h-13 items-center justify-center rounded-full bg-bronze px-7 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c]"
              >
                Book an Appointment

                <span aria-hidden="true" className="ml-3">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-bronze">
              Explore
            </p>

            <nav className="mt-6 flex flex-col">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-white/10 py-3.5 text-sm font-medium text-white/70 transition-colors duration-300 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* LOCATIONS + CONTACT */}
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-bronze">
              Our Branches
            </p>

            <div className="mt-6 space-y-8">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className="border-b border-white/10 pb-7 last:border-b-0"
                >
                  <h3 className="font-heading text-2xl font-semibold text-white">
                    {branch.name}
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">
                    {branch.address}
                  </p>

                  <a
                    href={getGoogleMapsUrl(branch.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-bronze transition-colors duration-300 hover:text-white"
                  >
                    View on Google Maps

                    <span aria-hidden="true" className="ml-2">
                      ↗
                    </span>
                  </a>
                </div>
              ))}
            </div>

            {/* CONTACT */}
            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-bronze">
                Contact
              </p>

              <div className="mt-6 space-y-6">
                {/* PHONE */}
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-bronze">
                    <PhoneIcon />
                  </div>

                  <div className="flex flex-col gap-2">
                    {phoneNumbers.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone}`}
                        className="w-fit text-sm font-medium text-white/65 transition-colors duration-300 hover:text-bronze"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-bronze">
                    <EmailIcon />
                  </div>

                  <a
                    href={`mailto:${email}`}
                    className="text-sm font-medium text-white/65 transition-colors duration-300 hover:text-bronze"
                  >
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col gap-5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Unique Mechanical Works. All rights
            reserved.
          </p>

          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
            Kano · Abuja · Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}