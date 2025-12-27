import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, BookOpen, TrendingUp, Award } from "lucide-react";

type AcademicStats = {
    gpa: number;
    totalCredits: number;
    approvedCredits: number;
    failedCredits: number;
    coursesApproved: number;
    coursesFailed: number;
};

type Enrollment = {
    id: number;
    courseCode: string;
    academicPeriod: string;
    status: string;
    finalGrade: number | null;
};

export default function AcademicDashboard() {
    const { toast } = useToast();
    const [activePeriod] = useState("2025-2");

    const { data: stats } = useQuery<AcademicStats>({
        queryKey: ["/api/academic/stats"],
    });

    const { data: currentEnrollments = [] } = useQuery<Enrollment[]>({
        queryKey: ["/api/academic/enrollments", { period: activePeriod }],
        queryFn: async () => {
            const res = await fetch(`/api/academic/enrollments?period=${activePeriod}`);
            return res.json();
        }
    });

    const { data: allEnrollments = [] } = useQuery<Enrollment[]>({
        queryKey: ["/api/academic/enrollments"],
    });

    const totalCreditsRequired = 300; // Typical for engineering degree
    const progressPercentage = stats ? (stats.approvedCredits / totalCreditsRequired) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión Académica</h1>
                    <p className="text-muted-foreground">Ingeniería Civil Informática - UV</p>
                </div>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="enrollment">Toma de Ramos</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                    <TabsTrigger value="import">Importar Datos</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.gpa.toFixed(2) || "N/A"}</div>
                                <p className="text-xs text-muted-foreground">
                                    Escala 1.0 - 7.0
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Créditos Aprobados</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.approvedCredits || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    de {totalCreditsRequired} totales
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ramos Aprobados</CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.coursesApproved || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.coursesFailed || 0} reprobados
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Período Actual</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activePeriod}</div>
                                <p className="text-xs text-muted-foreground">
                                    {currentEnrollments.length} ramos inscritos
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Progreso de Carrera</CardTitle>
                            <CardDescription>
                                {stats?.approvedCredits || 0} / {totalCreditsRequired} créditos completados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={progressPercentage} className="h-2" />
                            <p className="text-sm text-muted-foreground mt-2">
                                {progressPercentage.toFixed(1)}% completado
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ramos del Semestre Actual ({activePeriod})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {currentEnrollments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No hay ramos inscritos para este período.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Nota</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentEnrollments.map((enrollment) => (
                                            <TableRow key={enrollment.id}>
                                                <TableCell className="font-medium">{enrollment.courseCode}</TableCell>
                                                <TableCell>
                                                    <Badge variant={enrollment.status === "cursando" ? "default" : "secondary"}>
                                                        {enrollment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {enrollment.finalGrade ? enrollment.finalGrade.toFixed(1) : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Enrollment Tab - Placeholder */}
                <TabsContent value="enrollment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Toma de Ramos</CardTitle>
                            <CardDescription>Sistema de inscripción - En construcción</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Próximamente: Sistema de inscripción con límite de 32 créditos</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial Académico Completo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Período</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Nota Final</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allEnrollments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                No hay datos históricos. Usa la pestaña "Importar Datos" para cargar tu historial.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        allEnrollments.map((enrollment) => (
                                            <TableRow key={enrollment.id}>
                                                <TableCell>{enrollment.academicPeriod}</TableCell>
                                                <TableCell className="font-medium">{enrollment.courseCode}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={enrollment.status === "aprobado" ? "default" : enrollment.status === "reprobado" ? "destructive" : "secondary"}
                                                    >
                                                        {enrollment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {enrollment.finalGrade ? enrollment.finalGrade.toFixed(1) : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Import Tab - Placeholder */}
                <TabsContent value="import">
                    <Card>
                        <CardHeader>
                            <CardTitle>Importar Historial Académico</CardTitle>
                            <CardDescription>Carga masiva de datos históricos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Próximamente: Herramienta de importación de datos desde archivo o texto</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
