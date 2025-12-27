import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, BookOpen, TrendingUp, Award, Plus, ShoppingCart, AlertCircle, Upload } from "lucide-react";

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

type AcademicCourse = {
    id: number;
    code: string;
    name: string;
    credits: number;
    semester: number;
};

// Import Data System Component
function ImportDataSystem() {
    const { toast } = useToast();
    const [jsonData, setJsonData] = useState("");

    const importMutation = useMutation({
        mutationFn: async (records: any[]) => {
            const res = await fetch("/api/academic/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ records })
            });
            if (!res.ok) throw new Error("Import failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Importación Exitosa",
                description: `Se importaron ${data.imported} registros correctamente.`
            });
            setJsonData("");
            queryClient.invalidateQueries({ queryKey: ["/api/academic/enrollments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/academic/stats"] });
        },
        onError: () => {
            toast({
                title: "Error al Importar",
                description: "Verifica el formato de los datos.",
                variant: "destructive"
            });
        }
    });

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonData);
            const records = Array.isArray(parsed) ? parsed : [parsed];
            importMutation.mutate(records);
        } catch (error) {
            toast({
                title: "Error de Formato",
                description: "Los datos deben estar en formato JSON válido.",
                variant: "destructive"
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Importar Historial Académico
                </CardTitle>
                <CardDescription>
                    Carga masiva de datos históricos en formato JSON
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Datos JSON</label>
                    <Textarea
                        placeholder='[{"courseCode": "INF111", "academicPeriod": "2023-1", "status": "aprobado", "finalGrade": 6.2}]'
                        value={jsonData}
                        onChange={(e) => setJsonData(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Formato: Array de objetos con courseCode, academicPeriod, status, finalGrade
                    </p>
                </div>

                <Button
                    className="w-full"
                    onClick={handleImport}
                    disabled={!jsonData || importMutation.isPending}
                >
                    {importMutation.isPending ? "Importando..." : "Importar Datos"}
                </Button>

                <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-2">Ejemplo de formato:</p>
                    <pre className="text-xs overflow-x-auto">
                        {`[
  {
    "courseCode": "INF111",
    "academicPeriod": "2023-1",
    "status": "aprobado",
    "finalGrade": 6.2
  },
  {
    "courseCode": "INF121",
    "academicPeriod": "2023-1",
    "status": "aprobado",
    "finalGrade": 4.1
  }
]`}
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
}

// Enrollment System Component
function EnrollmentSystem({ activePeriod }: { activePeriod: string }) {
    const { toast } = useToast();
    const [cart, setCart] = useState<string[]>([]);
    const [semesterFilter, setSemesterFilter] = useState<string>("all");

    const { data: catalog = [] } = useQuery<AcademicCourse[]>({
        queryKey: ["/api/academic/catalog"],
    });

    const { data: currentEnrollments = [] } = useQuery<Enrollment[]>({
        queryKey: ["/api/academic/enrollments", { period: activePeriod }],
        queryFn: async () => {
            const res = await fetch(`/api/academic/enrollments?period=${activePeriod}`);
            return res.json();
        }
    });

    const enrollMutation = useMutation({
        mutationFn: async (courseCode: string) => {
            const res = await fetch("/api/academic/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseCode,
                    academicPeriod: activePeriod
                })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Enrollment failed");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Ramo Inscrito", description: "El ramo se agregó correctamente." });
            setCart([]);
            queryClient.invalidateQueries({ queryKey: ["/api/academic/enrollments"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error al Inscribir",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const enrolledCodes = currentEnrollments.map(e => e.courseCode);
    const availableCourses = catalog.filter(c => !enrolledCodes.includes(c.code));
    const filteredCourses = semesterFilter === "all"
        ? availableCourses
        : availableCourses.filter(c => c.semester === parseInt(semesterFilter));

    const cartCourses = cart.map(code => catalog.find(c => c.code === code)!).filter(Boolean);
    const totalCreditsInCart = cartCourses.reduce((sum, c) => sum + c.credits, 0);
    const currentCredits = currentEnrollments.reduce((sum, e) => {
        const course = catalog.find(c => c.code === e.courseCode);
        return sum + (course?.credits || 0);
    }, 0);
    const totalCredits = currentCredits + totalCreditsInCart;
    const isOverLimit = totalCredits > 32;

    const addToCart = (code: string) => {
        if (!cart.includes(code)) {
            setCart([...cart, code]);
        }
    };

    const removeFromCart = (code: string) => {
        setCart(cart.filter(c => c !== code));
    };

    const handleEnrollAll = async () => {
        for (const code of cart) {
            await enrollMutation.mutateAsync(code);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Catálogo de Ramos</CardTitle>
                    <CardDescription>Ramos disponibles para {activePeriod}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Filtrar por semestre..."
                            value={semesterFilter === "all" ? "" : semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value || "all")}
                            className="max-w-xs"
                        />
                        <Button variant="outline" onClick={() => setSemesterFilter("all")}>
                            Todos
                        </Button>
                    </div>

                    {filteredCourses.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No hay ramos disponibles.</p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course.code}
                                    className="flex items-center justify-between p-3 border rounded-md"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{course.code}</p>
                                        <p className="text-xs text-muted-foreground">{course.name}</p>
                                        <Badge variant="secondary" className="mt-1 text-xs">
                                            {course.credits} créditos
                                        </Badge>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => addToCart(course.code)}
                                        disabled={cart.includes(course.code)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Inscripción ({activePeriod})
                    </CardTitle>
                    <CardDescription>
                        Créditos actuales: {currentCredits} | En carrito: {totalCreditsInCart} | Total: {totalCredits}/32
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isOverLimit && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive rounded-md">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                            <p className="text-sm text-destructive">
                                Límite de 32 créditos excedido
                            </p>
                        </div>
                    )}

                    <Progress value={(totalCredits / 32) * 100} className="h-2" />

                    {cart.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Agrega ramos desde el catálogo para inscribirlos.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {cartCourses.map((course) => (
                                <div
                                    key={course.code}
                                    className="flex items-center justify-between p-2 border rounded-md"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{course.code}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {course.credits} créditos
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFromCart(course.code)}
                                    >
                                        Quitar
                                    </Button>
                                </div>
                            ))}

                            <Button
                                className="w-full mt-4"
                                onClick={handleEnrollAll}
                                disabled={isOverLimit || enrollMutation.isPending}
                            >
                                {enrollMutation.isPending ? "Inscribiendo..." : "Confirmar Inscripción"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

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

                {/* Enrollment Tab */}
                <TabsContent value="enrollment" className="space-y-4">
                    <EnrollmentSystem activePeriod={activePeriod} />
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

                {/* Import Tab */}
                <TabsContent value="import">
                    <ImportDataSystem />
                </TabsContent>
            </Tabs>
        </div>
    );
}
