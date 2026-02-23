import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { IucOverview } from "@/components/dashboard/iuc-overview";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get totals
  const { count: totalClients } = await supabase
    .from("iba_clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const { count: totalVehicles } = await supabase
    .from("iba_vehicles")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  // Get all active vehicles with client info
  const { data: allVehicles } = await supabase
    .from("iba_vehicles")
    .select(`
      id,
      client_id,
      brand,
      model,
      license_plate,
      iuc_month,
      iuc_amount,
      is_active,
      iba_clients!inner (
        name,
        is_active
      )
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("iba_clients.is_active", true);

  // Get all IUC payments for current year
  const vehicleIds = (allVehicles || []).map((v) => v.id);
  const { data: payments } = vehicleIds.length
    ? await supabase
        .from("iba_iuc_payments")
        .select("vehicle_id")
        .in("vehicle_id", vehicleIds)
        .eq("year", currentYear)
    : { data: [] };

  const paidVehicleIds = new Set((payments || []).map((p) => p.vehicle_id));

  // Calculate stats and categorize vehicles
  let pendingThisMonth = 0;
  let overdue = 0;

  const attentionVehicles: Array<{
    vehicle_id: string;
    client_id: string;
    client_name: string;
    brand: string;
    model: string;
    license_plate: string;
    iuc_month: number;
    iuc_amount: number | null;
    iuc_status: "paid" | "pending" | "overdue" | "upcoming";
  }> = [];

  const upcomingVehicles: Array<{
    vehicle_id: string;
    client_id: string;
    client_name: string;
    brand: string;
    model: string;
    license_plate: string;
    iuc_month: number;
    iuc_amount: number | null;
  }> = [];

  for (const v of allVehicles || []) {
    const isPaid = paidVehicleIds.has(v.id);
    const clientData = v.iba_clients as unknown as { name: string; is_active: boolean };

    if (isPaid) continue;

    const vehicleInfo = {
      vehicle_id: v.id,
      client_id: v.client_id,
      client_name: clientData.name,
      brand: v.brand,
      model: v.model,
      license_plate: v.license_plate,
      iuc_month: v.iuc_month,
      iuc_amount: v.iuc_amount,
    };

    if (v.iuc_month < currentMonth) {
      overdue++;
      attentionVehicles.push({
        ...vehicleInfo,
        iuc_status: "overdue" as const,
      });
    } else if (v.iuc_month === currentMonth) {
      pendingThisMonth++;
      attentionVehicles.push({
        ...vehicleInfo,
        iuc_status: "pending" as const,
      });
    } else {
      // Upcoming: next 3 months
      if (v.iuc_month <= currentMonth + 3) {
        upcomingVehicles.push(vehicleInfo);
      }
    }
  }

  // Sort attention vehicles: overdue first, then pending
  attentionVehicles.sort((a, b) => {
    if (a.iuc_status === "overdue" && b.iuc_status !== "overdue") return -1;
    if (a.iuc_status !== "overdue" && b.iuc_status === "overdue") return 1;
    return a.iuc_month - b.iuc_month;
  });

  upcomingVehicles.sort((a, b) => a.iuc_month - b.iuc_month);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Painel</h1>

      <StatsCards
        totalClients={totalClients || 0}
        totalVehicles={totalVehicles || 0}
        pendingThisMonth={pendingThisMonth}
        overdue={overdue}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <IucOverview vehicles={attentionVehicles} />
        <UpcomingPayments vehicles={upcomingVehicles} />
      </div>
    </div>
  );
}
