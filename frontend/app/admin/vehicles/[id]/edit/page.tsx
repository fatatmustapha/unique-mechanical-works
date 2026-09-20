import VehicleForm from "@/components/admin/VehicleForm";

type EditVehiclePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVehiclePage({
  params,
}: EditVehiclePageProps) {
  const { id } = await params;

  const carId = Number(id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-bronze">
          Vehicle Management
        </p>

        <h1 className="mt-2 font-heading text-3xl font-bold text-prussian">
          Edit Vehicle
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
          Update the vehicle information, features and photographs.
        </p>
      </div>

      <VehicleForm carId={carId} />
    </div>
  );
}