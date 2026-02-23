"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  createVehicleAction,
  updateVehicleAction,
} from "@/actions/vehicles";
import { formatLicensePlate, isValidLicensePlate, MONTH_NAMES } from "@/lib/validators";
import type { Vehicle } from "@/lib/types/database";

interface VehicleFormProps {
  vehicle?: Vehicle;
  clientId?: string;
  clientName?: string;
}

export function VehicleForm({ vehicle, clientId, clientName }: VehicleFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plate, setPlate] = useState(vehicle?.license_plate ?? "");
  const isEdit = !!vehicle;

  function handlePlateChange(value: string) {
    const formatted = formatLicensePlate(value);
    setPlate(formatted);
    if (formatted.length === 8 && !isValidLicensePlate(formatted)) {
      setPlateError("Formato de matrícula inválido.");
    } else {
      setPlateError(null);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = isEdit
      ? await updateVehicleAction(vehicle.id, formData)
      : await createVehicleAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Editar Veículo" : "Novo Veículo"}
          {clientName && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              — {clientName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {clientId && (
            <input type="hidden" name="client_id" value={clientId} />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                name="brand"
                required
                defaultValue={vehicle?.brand ?? ""}
                placeholder="Ex: Renault"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                name="model"
                required
                defaultValue={vehicle?.model ?? ""}
                placeholder="Ex: Clio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_plate">Matrícula *</Label>
              <Input
                id="license_plate"
                name="license_plate"
                required
                value={plate}
                onChange={(e) => handlePlateChange(e.target.value)}
                placeholder="AA-00-AA"
                className="font-mono uppercase"
                maxLength={8}
              />
              {plateError && (
                <p className="text-xs text-destructive">{plateError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Ano de Registo *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                required
                min={1900}
                max={currentYear + 1}
                defaultValue={vehicle?.year ?? currentYear}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iuc_month">Mês de Pagamento IUC *</Label>
              <Select
                name="iuc_month"
                defaultValue={vehicle?.iuc_month?.toString() ?? ""}
                required
              >
                <SelectTrigger id="iuc_month">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="iuc_amount">Valor IUC (€)</Label>
              <Input
                id="iuc_amount"
                name="iuc_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={vehicle?.iuc_amount?.toString() ?? ""}
                placeholder="0.00"
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={vehicle?.notes ?? ""}
              placeholder="Notas sobre o veículo..."
              rows={2}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar" : "Adicionar Veículo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
