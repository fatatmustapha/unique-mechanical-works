import {
  CarFront,
} from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";
import VehicleForm from "@/components/admin/VehicleForm";

export default function AddVehiclePage() {
  return (
    <AdminModulePage
      eyebrow="Inventory Management"
      title="Add New Vehicle"
      description="Create a vehicle listing with the information currently available. Optional details can always be added later."
      icon={CarFront}
    >
      <VehicleForm />
    </AdminModulePage>
  );
}