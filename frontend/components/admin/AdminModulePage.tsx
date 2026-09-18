import Link from "next/link";
import {
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

type AdminModulePageProps = {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
};

export default function AdminModulePage({
  title,
  eyebrow,
  description,
  icon: Icon,
  children,
}: AdminModulePageProps) {
  return (
    <main className="min-h-screen bg-[#f6f4ef]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate transition-colors hover:text-prussian"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mt-10 flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-prussian text-bronze">
            <Icon size={25} />
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-bronze">
              {eyebrow}
            </p>

            <h1 className="mt-2 font-heading text-4xl font-bold tracking-[-0.035em] text-prussian sm:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate sm:text-base sm:leading-8">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-12">
          {children}
        </div>
      </div>
    </main>
  );
}