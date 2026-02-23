"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createClientAction, updateClientAction } from "@/actions/clients";
import { isValidNIF } from "@/lib/validators";
import type { Client } from "@/lib/types/database";

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [nifError, setNifError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!client;

  function handleNifChange(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 9);
    if (clean.length === 9 && !isValidNIF(clean)) {
      setNifError("NIF inválido.");
    } else {
      setNifError(null);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      const result = isEdit
        ? await updateClientAction(client.id, formData)
        : await createClientAction(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (e) {
      // redirect() throws a NEXT_REDIRECT error — that's expected, let it propagate
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={client?.name ?? ""}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">NIF *</Label>
              <Input
                id="nif"
                name="nif"
                required
                maxLength={9}
                defaultValue={client?.nif ?? ""}
                placeholder="123456789"
                className="font-mono"
                onChange={(e) => handleNifChange(e.target.value)}
              />
              {nifError && (
                <p className="text-xs text-destructive">{nifError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email ?? ""}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={client?.phone ?? ""}
                placeholder="+351 912 345 678"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Morada</Label>
            <Input
              id="address"
              name="address"
              defaultValue={client?.address ?? ""}
              placeholder="Morada completa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes ?? ""}
              placeholder="Notas internas..."
              rows={3}
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
              {isEdit ? "Guardar" : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
