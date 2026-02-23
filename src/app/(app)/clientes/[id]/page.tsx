import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Phone, Mail, MapPin } from "lucide-react";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { DeleteClientButton } from "@/components/clients/delete-client-button";

export default async function ClienteDetailPage({
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

  const { data: client } = await supabase
    .from("iba_clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!client) notFound();

  // Get vehicles with IUC status
  const { data: vehicles } = await supabase
    .from("iba_vehicles")
    .select("*")
    .eq("client_id", id)
    .eq("is_active", true)
    .order("brand");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Get IUC payments for current year for these vehicles
  const vehicleIds = (vehicles || []).map((v) => v.id);
  const { data: payments } = vehicleIds.length
    ? await supabase
        .from("iba_iuc_payments")
        .select("*")
        .in("vehicle_id", vehicleIds)
        .eq("year", currentYear)
    : { data: [] };

  const paymentsMap = new Map(
    (payments || []).map((p) => [p.vehicle_id, p])
  );

  const vehiclesWithStatus = (vehicles || []).map((v) => {
    const payment = paymentsMap.get(v.id);
    let iucStatus: "paid" | "pending" | "overdue" | "upcoming";

    if (payment) {
      iucStatus = "paid";
    } else if (v.iuc_month < currentMonth) {
      iucStatus = "overdue";
    } else if (v.iuc_month === currentMonth) {
      iucStatus = "pending";
    } else {
      iucStatus = "upcoming";
    }

    return {
      ...v,
      iuc_status: iucStatus,
      payment,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">
            NIF: {client.nif}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/clientes/${id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteClientButton clientId={id} clientName={client.name} />
        </div>
      </div>

      {/* Client info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client.address}</span>
              </div>
            )}
            {client.notes && (
              <div className="sm:col-span-2 lg:col-span-3 text-sm text-muted-foreground">
                <strong>Notas:</strong> {client.notes}
              </div>
            )}
            {!client.email && !client.phone && !client.address && !client.notes && (
              <p className="text-sm text-muted-foreground">
                Sem informações adicionais.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicles section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Veículos
            <Badge variant="secondary" className="ml-2">
              {vehiclesWithStatus.length}
            </Badge>
          </h2>
          <Button asChild>
            <Link href={`/veiculos/novo?clientId=${id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Veículo
            </Link>
          </Button>
        </div>
        <VehicleList
          vehicles={vehiclesWithStatus}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
}
