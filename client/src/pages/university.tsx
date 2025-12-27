import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen } from "lucide-react";

type Course = {
  id: number;
  name: string;
  professor: string;
  credits: number;
};

export default function UniversityPage() {
  const { toast } = useToast();
  const [newCourse, setNewCourse] = useState({ name: "", professor: "", credits: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const createCourseMutation = useMutation({
    mutationFn: async (course: any) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ramo Agregado", description: "El ramo se ha creado correctamente." });
      setNewCourse({ name: "", professor: "", credits: "" });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el ramo.", variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Universidad</h1>
          <p className="text-muted-foreground">Gestiona tus ramos y notas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Ramo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Ramo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre del Ramo</Label>
                <Input
                  placeholder="Ej: Cálculo III"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Profesor</Label>
                <Input
                  placeholder="Ej: juan.perez@uv.cl"
                  value={newCourse.professor}
                  onChange={(e) => setNewCourse({ ...newCourse, professor: e.target.value })}
                />
              </div>
              <div>
                <Label>Créditos</Label>
                <Input
                  type="number"
                  placeholder="6"
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createCourseMutation.mutate({
                  name: newCourse.name,
                  professor: newCourse.professor,
                  credits: parseInt(newCourse.credits)
                })}
                disabled={!newCourse.name || !newCourse.credits || createCourseMutation.isPending}
              >
                {createCourseMutation.isPending ? "Guardando..." : "Crear Ramo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.length === 0 && (
          <Card className="col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay ramos registrados aún.</p>
              <p className="text-sm text-muted-foreground">Comienza agregando tu primer ramo.</p>
            </CardContent>
          </Card>
        )}

        {courses.map((course: any) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>{course.professor}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Créditos: {course.credits}</span>
                <Badge>Activo</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
