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
import { Eye, Car } from "lucide-react";
import type { ClientWithStats } from "@/lib/types/database";

export function ClientList({ clients }: { clients: ClientWithStats[] }) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Car className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Sem clientes</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione o primeiro cliente para começar.
        </p>
        <Button asChild className="mt-4">
          <Link href="/clientes/novo">Adicionar Cliente</Link>
        </Button>
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
              <TableHead>Nome</TableHead>
              <TableHead>NIF</TableHead>
              <TableHead className="text-center">Veículos</TableHead>
              <TableHead className="text-center">IUC Pendente</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  {client.nif}
                </TableCell>
                <TableCell className="text-center">
                  {client.vehicle_count}
                </TableCell>
                <TableCell className="text-center">
                  {client.pending_iuc_count > 0 ? (
                    <Badge variant="destructive">
                      {client.pending_iuc_count}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">0</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/clientes/${client.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clientes/${client.id}`}
            className="block rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{client.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  NIF: {client.nif}
                </p>
              </div>
              {client.pending_iuc_count > 0 && (
                <Badge variant="destructive">
                  {client.pending_iuc_count} pendente
                  {client.pending_iuc_count > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {client.vehicle_count} veículo
              {client.vehicle_count !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
