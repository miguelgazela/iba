import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LicensePlate } from "@/components/vehicles/license-plate";
import { getMonthName } from "@/lib/validators";

interface UpcomingVehicle {
  vehicle_id: string;
  client_id: string;
  client_name: string;
  brand: string;
  model: string;
  license_plate: string;
  iuc_month: number;
  iuc_amount: number | null;
}

export function UpcomingPayments({
  vehicles,
}: {
  vehicles: UpcomingVehicle[];
}) {
  if (vehicles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sem pagamentos nos próximos meses.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by month
  const grouped = vehicles.reduce(
    (acc, v) => {
      const month = v.iuc_month;
      if (!acc[month]) acc[month] = [];
      acc[month].push(v);
      return acc;
    },
    {} as Record<number, UpcomingVehicle[]>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Próximos Pagamentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([month, monthVehicles]) => (
            <div key={month}>
              <h4 className="text-sm font-medium mb-2">
                {getMonthName(Number(month))}
                <Badge variant="secondary" className="ml-2">
                  {monthVehicles.length}
                </Badge>
              </h4>
              <div className="space-y-2">
                {monthVehicles.map((v) => (
                  <Link
                    key={v.vehicle_id}
                    href={`/clientes/${v.client_id}`}
                    className="flex items-center justify-between rounded-lg border p-2 hover:bg-muted/50 transition-colors text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <LicensePlate plate={v.license_plate} />
                      <div>
                        <p className="font-medium">{v.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.brand} {v.model}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-muted-foreground">
                      {v.iuc_amount ? `${v.iuc_amount.toFixed(2)} €` : "—"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
