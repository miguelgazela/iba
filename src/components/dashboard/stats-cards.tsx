import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, AlertTriangle, Clock } from "lucide-react";

interface StatsCardsProps {
  totalClients: number;
  totalVehicles: number;
  pendingThisMonth: number;
  overdue: number;
}

export function StatsCards({
  totalClients,
  totalVehicles,
  pendingThisMonth,
  overdue,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Clientes",
      value: totalClients,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Veículos",
      value: totalVehicles,
      icon: Car,
      color: "text-slate-600",
    },
    {
      title: "IUC Pendente Este Mês",
      value: pendingThisMonth,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "IUC em Atraso",
      value: overdue,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
