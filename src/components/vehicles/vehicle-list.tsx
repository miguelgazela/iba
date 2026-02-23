"use client";

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
import { Button } from "@/components/ui/button";
import { Pencil, Car, CheckCircle2 } from "lucide-react";
import { LicensePlate } from "./license-plate";
import { MarkIucPaidDialog } from "./mark-iuc-paid-dialog";
import { DeleteVehicleButton } from "./delete-vehicle-button";
import { getMonthName } from "@/lib/validators";
import type { Vehicle, IucPayment, IucStatus } from "@/lib/types/database";

type VehicleWithStatus = Vehicle & {
  iuc_status: IucStatus;
  payment?: IucPayment | null;
};

const statusConfig: Record<
  IucStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  paid: { label: "Pago", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  overdue: { label: "Em Atraso", variant: "destructive" },
  upcoming: { label: "Futuro", variant: "outline" },
};

export function VehicleList({
  vehicles,
  currentYear,
}: {
  vehicles: VehicleWithStatus[];
  currentYear: number;
}) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border bg-card">
        <Car className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Sem veículos</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione o primeiro veículo deste cliente.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Mês IUC</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => {
              const status = statusConfig[vehicle.iuc_status];
              return (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <LicensePlate plate={vehicle.license_plate} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {vehicle.brand} {vehicle.model}
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{getMonthName(vehicle.iuc_month)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {vehicle.iuc_amount
                      ? `${vehicle.iuc_amount.toFixed(2)} €`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {vehicle.iuc_status !== "paid" && (
                        <MarkIucPaidDialog
                          vehicle={vehicle}
                          currentYear={currentYear}
                        />
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/veiculos/${vehicle.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteVehicleButton
                        vehicleId={vehicle.id}
                        vehicleName={`${vehicle.brand} ${vehicle.model}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {vehicles.map((vehicle) => {
          const status = statusConfig[vehicle.iuc_status];
          return (
            <div
              key={vehicle.id}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <LicensePlate plate={vehicle.license_plate} />
                  <p className="mt-2 font-medium">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.year} &middot; IUC: {getMonthName(vehicle.iuc_month)}
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">
                  {vehicle.iuc_amount
                    ? `${vehicle.iuc_amount.toFixed(2)} €`
                    : "Valor não definido"}
                </span>
                <div className="flex gap-1">
                  {vehicle.iuc_status !== "paid" && (
                    <MarkIucPaidDialog
                      vehicle={vehicle}
                      currentYear={currentYear}
                    />
                  )}
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/veiculos/${vehicle.id}/editar`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteVehicleButton
                    vehicleId={vehicle.id}
                    vehicleName={`${vehicle.brand} ${vehicle.model}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
