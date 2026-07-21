import Link from "next/link";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function Button({
  href,
  children,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className="
        rounded-full
        bg-[#C9962B]
        px-6
        py-3
        font-semibold
        text-white
        transition-all
        duration-300
        hover:scale-105
        hover:bg-[#b98922]
      "
    >
      {children}
    </Link>
  );
}