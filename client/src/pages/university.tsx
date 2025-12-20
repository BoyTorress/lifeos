import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Mail, GraduationCap, AlertCircle, Clock } from "lucide-react";

// Mock Data
const COURSES = [
  { id: 1, name: "Cálculo III", professor: "juan.perez@uv.cl", credits: 6, average: 5.2, passing: 4.0, exams: [{ name: "Certamen 1", date: "2025-04-10", weight: 0.3, grade: 5.5 }, { name: "Certamen 2", date: "2025-05-20", weight: 0.3, grade: null }] },
  { id: 2, name: "Física II", professor: "maria.gonzalez@uv.cl", credits: 5, average: 3.8, passing: 4.0, exams: [{ name: "Lab 1", date: "2025-03-15", weight: 0.2, grade: 4.5 }, { name: "Prueba 1", date: "2025-04-05", weight: 0.4, grade: 3.2 }] },
  { id: 3, name: "Programación Avanzada", professor: "carlos.rojas@uv.cl", credits: 6, average: 6.1, passing: 4.0, exams: [{ name: "Proyecto", date: "2025-06-01", weight: 0.5, grade: 6.5 }, { name: "Examen", date: "2025-07-10", weight: 0.5, grade: 5.7 }] },
  { id: 4, name: "Estructura de Datos", professor: "ana.silva@uv.cl", credits: 5, average: 4.0, passing: 4.0, exams: [{ name: "Quiz 1", date: "2025-03-20", weight: 0.1, grade: 4.0 }] },
];

const SCHEDULE = [
  { time: "08:30 - 10:00", mon: "Cálculo III", tue: "", wed: "Cálculo III", thu: "", fri: "Física II" },
  { time: "10:15 - 11:45", mon: "Física II", tue: "Prog. Avanzada", wed: "Física II", thu: "Prog. Avanzada", fri: "" },
  { time: "12:00 - 13:30", mon: "", tue: "Estructura Datos", wed: "", thu: "Estructura Datos", fri: "" },
  { time: "14:30 - 16:00", mon: "Lab Física", tue: "", wed: "Lab Prog", thu: "", fri: "" },
];

export default function UniversityPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Universidad de Valparaíso</h1>
        <p className="text-muted-foreground">Ingeniería Civil Informática - Semestre 1 2025</p>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Asignaturas & Notas</TabsTrigger>
          <TabsTrigger value="schedule">Horario</TabsTrigger>
          <TabsTrigger value="exams">Próximas Evaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {COURSES.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" /> {course.professor}
                      </CardDescription>
                    </div>
                    <Badge variant={course.average >= 4.0 ? "default" : "destructive"}>
                      Promedio: {course.average}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso Semestre</span>
                        <span>{course.average >= 4.0 ? "Aprobando" : "En riesgo"}</span>
                      </div>
                      <Progress value={Math.min((course.average / 7) * 100, 100)} className={course.average < 4.0 ? "bg-destructive/20" : ""} />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Evaluaciones</h4>
                      <div className="space-y-1">
                        {course.exams.map((exam, idx) => (
                          <div key={idx} className="flex justify-between text-sm p-1 rounded hover:bg-muted/50 transition-colors">
                            <span className="text-muted-foreground w-1/2 truncate">{exam.name}</span>
                            <span className="text-xs text-muted-foreground w-1/4 text-right">{(exam.weight * 100)}%</span>
                            <span className={`w-1/4 text-right font-mono ${!exam.grade ? 'text-muted-foreground/50' : ''}`}>
                              {exam.grade ? exam.grade : "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Hora</TableHead>
                    <TableHead>Lunes</TableHead>
                    <TableHead>Martes</TableHead>
                    <TableHead>Miércoles</TableHead>
                    <TableHead>Jueves</TableHead>
                    <TableHead>Viernes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCHEDULE.map((slot, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{slot.time}</TableCell>
                      <TableCell>{slot.mon && <Badge variant="secondary" className="w-full justify-center">{slot.mon}</Badge>}</TableCell>
                      <TableCell>{slot.tue && <Badge variant="secondary" className="w-full justify-center">{slot.tue}</Badge>}</TableCell>
                      <TableCell>{slot.wed && <Badge variant="secondary" className="w-full justify-center">{slot.wed}</Badge>}</TableCell>
                      <TableCell>{slot.thu && <Badge variant="secondary" className="w-full justify-center">{slot.thu}</Badge>}</TableCell>
                      <TableCell>{slot.fri && <Badge variant="secondary" className="w-full justify-center">{slot.fri}</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Evaluaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {COURSES.flatMap(c => c.exams.map(e => ({ ...e, courseName: c.name })))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .filter(e => new Date(e.date) > new Date()) // Future exams only
                  .map((exam, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
                        <span className="text-xs font-bold uppercase">{new Date(exam.date).toLocaleString('es-CL', { month: 'short' })}</span>
                        <span className="text-lg font-bold">{new Date(exam.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{exam.name}</h4>
                        <p className="text-sm text-muted-foreground">{exam.courseName}</p>
                      </div>
                      <div className="text-right">
                         <Badge variant="outline">{(exam.weight * 100)}%</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
