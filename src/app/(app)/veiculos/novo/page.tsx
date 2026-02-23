import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default async function NovoVeiculoPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const clientId = params.clientId;

  if (!clientId) redirect("/clientes");

  // Verify client exists and belongs to user
  const { data: client } = await supabase
    .from("iba_clients")
    .select("id, name")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/clientes");

  return (
    <div className="max-w-2xl mx-auto">
      <VehicleForm clientId={client.id} clientName={client.name} />
    </div>
  );
}
