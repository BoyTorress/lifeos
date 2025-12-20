import { useState } from "react";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign, Calculator, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function UberPage() {
  const { settings } = useApp();
  
  // Daily Calculation State
  const [grossIncome, setGrossIncome] = useState<string>("");
  const [fuelCost, setFuelCost] = useState<string>("");
  
  // Calculate fixed daily cost
  const monthlyFixed = settings.rent + settings.debt;
  const weeklyCar = settings.carRentalWeekly;
  const dailyFixedCost = (monthlyFixed / 30) + (weeklyCar / 7);
  
  const calculateProfit = () => {
    const gross =  parseFloat(grossIncome) || 0;
    const fuel = parseFloat(fuelCost) || 0;
    const tax = gross * 0.14; // 14% SII retention
    
    const trueProfit = gross - tax - fuel - dailyFixedCost;
    return {
      gross,
      tax,
      fuel,
      fixed: dailyFixedCost,
      net: trueProfit
    };
  };

  const stats = calculateProfit();
  const isProfitable = stats.net > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Uber & Finanzas</h1>
        <p className="text-muted-foreground">Calculadora de Ganancia Real ("True Profit") y gestión de gastos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calculator */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Calculadora Diaria
            </CardTitle>
            <CardDescription>
              Ingresa los datos de tu turno de hoy para ver tu ganancia real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gross">Ingresos Brutos (App)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="gross" 
                  className="pl-9 font-mono text-lg" 
                  placeholder="0" 
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value)}
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel">Gasto Combustible Real</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="fuel" 
                  className="pl-9 font-mono text-lg" 
                  placeholder="0" 
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  type="number"
                />
              </div>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle>Costo Fijo Diario: ${Math.round(dailyFixedCost).toLocaleString()}</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground mt-1">
                Calculado automáticamente de tus gastos mensuales (Arriendo, Deuda, Auto).
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className={cn(
          "border-l-4 transition-colors",
          isProfitable ? "border-l-emerald-500" : "border-l-rose-500"
        )}>
          <CardHeader>
            <CardTitle>Resultado Neto</CardTitle>
            <CardDescription>Después de impuestos y costos operativos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ingreso Bruto</span>
              <span className="font-mono text-lg">${stats.gross.toLocaleString()}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-rose-400">
                <span>Impuesto (14% SII)</span>
                <span className="font-mono">-${Math.round(stats.tax).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-rose-400">
                <span>Combustible</span>
                <span className="font-mono">-${Math.round(stats.fuel).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-rose-400">
                <span>Costo Fijo Diario</span>
                <span className="font-mono">-${Math.round(stats.fixed).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Ganancia Real</span>
                <span className={cn(
                  "text-2xl font-bold font-mono",
                  isProfitable ? "text-emerald-500" : "text-rose-500"
                )}>
                  ${Math.round(stats.net).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                {isProfitable ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
                {isProfitable ? "Estás generando ganancias reales." : "Estás operando a pérdida hoy."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Gastos Mensuales</CardTitle>
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
                <TableCell className="text-right font-mono">${settings.rent.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">${Math.round(settings.rent / 30).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Crédito / Deuda</TableCell>
                <TableCell className="text-right font-mono">${settings.debt.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">${Math.round(settings.debt / 30).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Arriendo Auto (x4 semanas)</TableCell>
                <TableCell className="text-right font-mono">${(settings.carRentalWeekly * 4).toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">${Math.round(settings.carRentalWeekly / 7).toLocaleString()}</TableCell>
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
