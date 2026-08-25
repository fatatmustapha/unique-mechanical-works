import { getHealth } from "@/lib/api/health";

export default async function Home() {
  const health = await getHealth();

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-bronze">
          Unique Mechanical Works
        </p>

        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-prussian sm:text-5xl">
          Backend Connection Test
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate">
          API Status:{" "}
          <span className="font-semibold text-prussian">
            {health.data.status}
          </span>
        </p>

        <p className="mt-2 font-mono text-sm text-slate">
          Environment: {health.data.environment}
        </p>
      </div>
    </main>
  );
}