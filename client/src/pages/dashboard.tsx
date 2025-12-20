import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useApp } from "@/lib/store";
import { DollarSign, GraduationCap, Calendar, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { settings } = useApp();

  // Quick stats calculation
  const monthlyFixed = settings.rent + settings.debt;
  const weeklyCar = settings.carRentalWeekly;
  const dailyFixed = (monthlyFixed / 30) + (weeklyCar / 7);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Hola, Brandon</h1>
        <p className="text-muted-foreground text-lg">Aquí tienes el resumen de tu día.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Costo Diario */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo de Vida Diario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">${Math.round(dailyFixed).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Base para empezar a ganar
            </p>
          </CardContent>
        </Card>

        {/* Promedio Univ */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Actual</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">5.2</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Aprobando todo
            </p>
          </CardContent>
        </Card>

        {/* Peso */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Actual</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">85 kg</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -2.5kg este mes
            </p>
          </CardContent>
        </Card>

        {/* Próximo Pago */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arriendo Auto</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">Lunes</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vence en 2 días
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
             <Link href="/uber">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <span className="font-semibold">Ingresar Turno Uber</span>
                  <span className="text-xs text-muted-foreground font-normal">Calcular ganancia de hoy</span>
                </Button>
             </Link>
             
             <Link href="/university">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <span className="font-semibold">Ver Horario</span>
                  <span className="text-xs text-muted-foreground font-normal">Revisar clases de mañana</span>
                </Button>
             </Link>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Motivación</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-lg font-medium italic border-l-2 pl-4 border-white/30">
              "La disciplina es el puente entre metas y logros."
            </blockquote>
            <p className="text-sm mt-4 text-primary-foreground/80">
              Mantén el foco en tus estudios y tu salud. Los resultados llegarán.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
