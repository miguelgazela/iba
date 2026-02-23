import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LicensePlate } from "@/components/vehicles/license-plate";
import { getMonthName } from "@/lib/validators";
import type { IucStatus } from "@/lib/types/database";

interface IucVehicle {
  vehicle_id: string;
  client_id: string;
  client_name: string;
  brand: string;
  model: string;
  license_plate: string;
  iuc_month: number;
  iuc_amount: number | null;
  iuc_status: IucStatus;
}

const statusConfig: Record<
  IucStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  paid: { label: "Pago", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  overdue: { label: "Em Atraso", variant: "destructive" },
  upcoming: { label: "Futuro", variant: "outline" },
};

export function IucOverview({ vehicles }: { vehicles: IucVehicle[] }) {
  if (vehicles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">IUC — Atenção Necessária</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sem pagamentos pendentes ou em atraso. Tudo em dia!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">IUC — Atenção Necessária</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Mês IUC</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => {
                const status = statusConfig[v.iuc_status];
                return (
                  <TableRow key={v.vehicle_id}>
                    <TableCell>
                      <Link
                        href={`/clientes/${v.client_id}`}
                        className="hover:underline font-medium"
                      >
                        {v.client_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <LicensePlate plate={v.license_plate} />
                    </TableCell>
                    <TableCell>
                      {v.brand} {v.model}
                    </TableCell>
                    <TableCell>{getMonthName(v.iuc_month)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {v.iuc_amount ? `${v.iuc_amount.toFixed(2)} €` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {vehicles.map((v) => {
            const status = statusConfig[v.iuc_status];
            return (
              <Link
                key={v.vehicle_id}
                href={`/clientes/${v.client_id}`}
                className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{v.client_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {v.brand} {v.model}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <LicensePlate plate={v.license_plate} />
                  <span className="text-xs text-muted-foreground font-mono">
                    {v.iuc_amount ? `${v.iuc_amount.toFixed(2)} €` : "—"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
