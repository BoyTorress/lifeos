import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Scale } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function HealthPage() {
  const [weight, setWeight] = useState<string>("85");
  const [goal, setGoal] = useState<string>("75");
  
  const currentWeight = parseFloat(weight) || 0;
  const goalWeight = parseFloat(goal) || 0;
  
  // Simple calc for progress: Assuming weight loss
  const startWeight = 95; // Mock starting weight
  const totalToLose = startWeight - goalWeight;
  const lostSoFar = startWeight - currentWeight;
  const progress = Math.max(0, Math.min((lostSoFar / totalToLose) * 100, 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Salud & Fitness</h1>
        <p className="text-muted-foreground">Monitoreo de peso y objetivos de gimnasio.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Control de Peso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">Peso Actual</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono">{currentWeight}</span>
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Meta</p>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-2xl font-bold font-mono text-muted-foreground">{goalWeight}</span>
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Inicio: {startWeight}kg</span>
                <span>{Math.round(progress)}% completado</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label>Actualizar Peso</Label>
                <Input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Input 
                  type="number" 
                  value={goal} 
                  onChange={(e) => setGoal(e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              Rutina Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { day: "Lunes", muscle: "Pecho + Tríceps", done: true },
                { day: "Martes", muscle: "Espalda + Bíceps", done: true },
                { day: "Miércoles", muscle: "Descanso / Cardio", done: false },
                { day: "Jueves", muscle: "Piernas + Hombros", done: false },
                { day: "Viernes", muscle: "Full Body", done: false },
              ].map((workout, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      workout.done ? "bg-emerald-500" : "bg-muted-foreground/30"
                    )} />
                    <span className="font-medium">{workout.day}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{workout.muscle}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
