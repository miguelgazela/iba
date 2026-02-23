import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientList } from "@/components/clients/client-list";
import { ClientSearch } from "@/components/clients/client-search";
import type { ClientWithStats } from "@/lib/types/database";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const search = params.search?.trim();

  // Get clients with vehicle count and pending IUC count
  let query = supabase
    .from("iba_clients")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name");

  if (search) {
    query = query.or(`name.ilike.%${search}%,nif.ilike.%${search}%`);
  }

  const { data: clients } = await query;

  // For each client, count vehicles and pending IUC
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const clientsWithStats: ClientWithStats[] = await Promise.all(
    (clients || []).map(async (client) => {
      const { count: vehicleCount } = await supabase
        .from("iba_vehicles")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client.id)
        .eq("is_active", true);

      // Get vehicles that have IUC due this month or overdue
      const { data: vehicles } = await supabase
        .from("iba_vehicles")
        .select("id, iuc_month")
        .eq("client_id", client.id)
        .eq("is_active", true)
        .lte("iuc_month", currentMonth);

      let pendingCount = 0;
      if (vehicles) {
        for (const v of vehicles) {
          const { data: payment } = await supabase
            .from("iba_iuc_payments")
            .select("id")
            .eq("vehicle_id", v.id)
            .eq("year", currentYear)
            .maybeSingle();

          if (!payment) pendingCount++;
        }
      }

      return {
        ...client,
        vehicle_count: vehicleCount || 0,
        pending_iuc_count: pendingCount,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Button asChild>
          <Link href="/clientes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>
      <ClientSearch />
      <ClientList clients={clientsWithStats} />
    </div>
  );
}
