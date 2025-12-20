import { useState } from "react";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign, Calculator, Info, Gauge } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export default function UberPage() {
  const { settings, updateSettings } = useApp();
  
  // Daily Calculation State
  const [grossIncome, setGrossIncome] = useState<string>("");
  const [hoursWorked, setHoursWorked] = useState<string>("");
  const [localKmPerHour, setLocalKmPerHour] = useState<string>(settings.kmPerHour.toString());
  
  // Calculate fixed daily cost
  const monthlyFixed = settings.rent + settings.debt;
  const weeklyCar = settings.carRentalWeekly;
  const dailyFixedCost = (monthlyFixed / 30) + (weeklyCar / 7);
  
  const calculateProfit = () => {
    const gross = parseFloat(grossIncome) || 0;
    const hours = parseFloat(hoursWorked) || 0;
    const kmh = parseFloat(localKmPerHour) || 25;
    
    // Calculate fuel cost based on hours worked
    const kmDriven = hours * kmh;
    const litersUsed = kmDriven / (settings.vehicleEfficiency || 12);
    const fuel = litersUsed * settings.gasPrice;
    
    const tax = gross * 0.14; // 14% SII retention
    const trueProfit = gross - tax - fuel - dailyFixedCost;
    
    return {
      gross,
      hours,
      kmDriven,
      litersUsed,
      fuel,
      tax,
      fixed: dailyFixedCost,
      net: trueProfit,
      netPerHour: hours > 0 ? trueProfit / hours : 0
    };
  };

  const stats = calculateProfit();
  const isProfitable = stats.net > 0;
  
  // Pie chart data
  const costBreakdown = [
    { name: "Costo Fijo", value: Math.round(stats.fixed), color: "var(--chart-1)" },
    { name: "Impuesto (SII)", value: Math.round(stats.tax), color: "var(--chart-2)" },
    { name: "Combustible", value: Math.round(stats.fuel), color: "var(--chart-3)" },
    { name: "Ganancia", value: Math.max(0, Math.round(stats.net)), color: "var(--chart-4)" },
  ].filter(item => item.value > 0);

  // Bar chart for hourly breakdown
  const hourlyData = [
    { name: "Ingresos", value: stats.hours > 0 ? Math.round(stats.gross / stats.hours) : 0 },
    { name: "Costos", value: stats.hours > 0 ? Math.round((stats.fixed + stats.tax + stats.fuel) / stats.hours) : 0 },
    { name: "Ganancia/h", value: Math.round(stats.netPerHour) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Uber & Finanzas</h1>
        <p className="text-muted-foreground">Calculadora de Ganancia Real ("True Profit") con precisión en combustible.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Calculator */}
        <Card className="lg:col-span-1 border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-primary" />
              Cálculo Diario
            </CardTitle>
            <CardDescription className="text-xs">Datos de tu turno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gross" className="text-sm">Ingresos Brutos (App)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="gross" 
                  className="pl-9 font-mono text-sm" 
                  placeholder="0" 
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value)}
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours" className="text-sm">Horas Trabajadas</Label>
              <div className="relative">
                <Gauge className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="hours" 
                  className="pl-9 font-mono text-sm" 
                  placeholder="0" 
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  type="number"
                  step="0.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kmh" className="text-sm">Km/Hora Promedio</Label>
              <Input 
                id="kmh" 
                className="font-mono text-sm" 
                placeholder="25" 
                value={localKmPerHour}
                onChange={(e) => setLocalKmPerHour(e.target.value)}
                type="number"
              />
              <p className="text-xs text-muted-foreground">
                Basado: {Math.round(stats.kmDriven)} km
              </p>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-xs">Costo Fijo Diario</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground mt-1 font-mono">
                ${Math.round(dailyFixedCost).toLocaleString()}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className={cn(
          "lg:col-span-1 border-l-4 transition-colors",
          isProfitable ? "border-l-emerald-500" : "border-l-rose-500"
        )}>
          <CardHeader>
            <CardTitle className="text-lg">Ganancia Neta</CardTitle>
            <CardDescription className="text-xs">Después de todos los costos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bruto</span>
              <span className="font-mono">${stats.gross.toLocaleString()}</span>
            </div>
            
            <div className="space-y-1 py-2 border-y border-border">
              <div className="flex justify-between text-rose-400/80">
                <span className="text-xs">Impuesto (14%)</span>
                <span className="font-mono text-xs">-${Math.round(stats.tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-400/80">
                <span className="text-xs">Combustible</span>
                <span className="font-mono text-xs">-${Math.round(stats.fuel).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-400/80">
                <span className="text-xs">Costo Fijo</span>
                <span className="font-mono text-xs">-${Math.round(stats.fixed).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-bold">Ganancia Real</span>
                <span className={cn(
                  "text-xl font-bold font-mono",
                  isProfitable ? "text-emerald-500" : "text-rose-500"
                )}>
                  ${Math.round(stats.net).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Por Hora</span>
                <span className="font-mono text-accent-foreground">${Math.round(stats.netPerHour).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {isProfitable ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
                <span className={isProfitable ? "text-emerald-500" : "text-rose-500"}>
                  {isProfitable ? "Ganancia positiva" : "Pérdida"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-2 rounded bg-primary/5 border border-primary/20">
              <p className="text-muted-foreground text-xs mb-1">Km Recorridos</p>
              <p className="font-mono font-bold text-lg">{Math.round(stats.kmDriven)} km</p>
            </div>
            <div className="p-2 rounded bg-accent/5 border border-accent-foreground/20">
              <p className="text-muted-foreground text-xs mb-1">Combustible Usado</p>
              <p className="font-mono font-bold text-lg">{stats.litersUsed.toFixed(1)} L</p>
            </div>
            <div className="p-2 rounded bg-chart-1/5">
              <p className="text-muted-foreground text-xs mb-1">Costo por Km</p>
              <p className="font-mono font-bold text-lg">
                ${stats.kmDriven > 0 ? ((stats.fuel + stats.fixed + stats.tax) / stats.kmDriven).toFixed(0) : 0}/km
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {stats.gross > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Desglose de Costos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Análisis Horario</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: "hsl(var(--card))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Gastos Mensuales Base</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ítem</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Impacto Diario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Arriendo Depto</TableCell>
                <TableCell className="text-right font-mono text-sm">${settings.rent.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">${Math.round(settings.rent / 30).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Crédito / Deuda</TableCell>
                <TableCell className="text-right font-mono text-sm">${settings.debt.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">${Math.round(settings.debt / 30).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Arriendo Auto (x4 semanas)</TableCell>
                <TableCell className="text-right font-mono text-sm">${(settings.carRentalWeekly * 4).toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">${Math.round(settings.carRentalWeekly / 7).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow className="font-bold bg-muted/50">
                <TableCell>TOTAL MENSUAL</TableCell>
                <TableCell className="text-right font-mono text-primary">
                  ${(settings.rent + settings.debt + (settings.carRentalWeekly * 4)).toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-primary">
                  ${Math.round(dailyFixedCost).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
