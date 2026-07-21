export interface NavigationLink {
  title: string;
  href: string;
}

export const navigationLinks: NavigationLink[] = [
  {
    title: "Cars for Sale",
    href: "/cars",
  },
  {
    title: "Services",
    href: "/#services",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Book Appointment",
    href: "/appointment",
  },
];