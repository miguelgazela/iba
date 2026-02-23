"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2 } from "lucide-react";
import { markIucPaidAction } from "@/actions/vehicles";
import { toast } from "sonner";
import type { Vehicle } from "@/lib/types/database";

export function MarkIucPaidDialog({
  vehicle,
  currentYear,
}: {
  vehicle: Vehicle;
  currentYear: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await markIucPaidAction(formData);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Pagamento registado com sucesso.");
      setOpen(false);
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Marcar como pago">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registar Pagamento IUC</DialogTitle>
          <DialogDescription>
            {vehicle.brand} {vehicle.model} — {vehicle.license_plate} ({currentYear})
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="vehicle_id" value={vehicle.id} />
          <input type="hidden" name="year" value={currentYear} />
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (€)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={vehicle.iuc_amount?.toString() ?? ""}
              placeholder="0.00"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paid_at">Data de pagamento</Label>
            <Input
              id="paid_at"
              name="paid_at"
              type="date"
              required
              defaultValue={today}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Referência, recibo..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registar Pagamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
