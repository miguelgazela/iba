import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default async function EditarVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: vehicle } = await supabase
    .from("iba_vehicles")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!vehicle) notFound();

  const { data: client } = await supabase
    .from("iba_clients")
    .select("name")
    .eq("id", vehicle.client_id)
    .single();

  return (
    <div className="max-w-2xl mx-auto">
      <VehicleForm vehicle={vehicle} clientName={client?.name} />
    </div>
  );
}
