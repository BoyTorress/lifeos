import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const { toast } = useToast();
  
  // Local state for form to avoid jitters, initialized from global store
  const [formData, setFormData] = useState(settings);

  // Sync if store changes externally (unlikely but good practice)
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    toast({
      title: "Configuración guardada",
      description: "Los valores base han sido actualizados.",
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">Configura tus costos fijos y variables para los cálculos automáticos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Costos Mensuales Fijos</CardTitle>
          <CardDescription>Estos gastos se prorratean para calcular tu costo de vida diario.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="rent">Arriendo Departamento</Label>
            <Input 
              id="rent" 
              type="number" 
              value={formData.rent} 
              onChange={(e) => setFormData({...formData, rent: Number(e.target.value)})} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="debt">Cuota Crédito / Deuda</Label>
            <Input 
              id="debt" 
              type="number" 
              value={formData.debt} 
              onChange={(e) => setFormData({...formData, debt: Number(e.target.value)})} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operación Uber</CardTitle>
          <CardDescription>Variables para el cálculo de ganancias.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="car">Arriendo Vehículo (Semanal)</Label>
            <Input 
              id="car" 
              type="number" 
              value={formData.carRentalWeekly} 
              onChange={(e) => setFormData({...formData, carRentalWeekly: Number(e.target.value)})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gas">Precio Bencina ($/L)</Label>
              <Input 
                id="gas" 
                type="number" 
                value={formData.gasPrice} 
                onChange={(e) => setFormData({...formData, gasPrice: Number(e.target.value)})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="efficiency">Rendimiento (km/L)</Label>
              <Input 
                id="efficiency" 
                type="number" 
                value={formData.vehicleEfficiency} 
                onChange={(e) => setFormData({...formData, vehicleEfficiency: Number(e.target.value)})} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
