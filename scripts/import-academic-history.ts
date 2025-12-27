import fetch from 'node-fetch';

// Your complete academic history
const academicHistory = [
    // 2023-1
    { code: "INF111", period: "2023-1", grade: 6.2, credits: 8 },
    { code: "INF112", period: "2023-1", grade: 4.5, credits: 8 },
    { code: "INF113", period: "2023-1", grade: 6.1, credits: 2 },
    { code: "INF114", period: "2023-1", grade: 6.4, credits: 4 },
    { code: "INF115", period: "2023-1", grade: 5.2, credits: 4 },
    { code: "INF116", period: "2023-1", grade: 4.7, credits: 4 },
    { code: "INF121", period: "2023-1", grade: 4.1, credits: 8 },
    { code: "INF122", period: "2023-1", grade: 5.5, credits: 6 },
    { code: "INF123", period: "2023-1", grade: 4.1, credits: 6 },

    // 2023-2
    { code: "INF125", period: "2023-2", grade: 5.0, credits: 4 },
    { code: "INF126", period: "2023-2", grade: 4.1, credits: 2 },
    { code: "INF211", period: "2023-2", grade: 4.0, credits: 8 },
    { code: "INF212", period: "2023-2", grade: 5.3, credits: 7 },
    { code: "INF213", period: "2023-2", grade: 4.0, credits: 4 },
    { code: "INF214", period: "2023-2", grade: 4.5, credits: 6 },
    { code: "INF215", period: "2023-2", grade: 4.0, credits: 4 },
    { code: "INF221", period: "2023-2", grade: 4.0, credits: 8 },
    { code: "INF222", period: "2023-2", grade: 4.4, credits: 8 },
    { code: "INF223", period: "2023-2", grade: 2.2, credits: 7 }, // Reprobado
    { code: "INF224", period: "2023-2", grade: 2.4, credits: 4 }, // Reprobado
    { code: "INF225", period: "2023-2", grade: 2.6, credits: 4 }, // Reprobado

    // 2024-1
    { code: "INF124", period: "2024-1", grade: 6.8, credits: 4 },
    { code: "INF223", period: "2024-1", grade: 4.0, credits: 7 }, // Aprobado en 2do intento
    { code: "INF224", period: "2024-1", grade: 4.2, credits: 4 }, // Aprobado en 2do intento
    { code: "INF225", period: "2024-1", grade: 4.2, credits: 4 }, // Aprobado en 2do intento
    { code: "INF311", period: "2024-1", grade: 2.0, credits: 7 }, // Reprobado
    { code: "INF313", period: "2024-1", grade: 3.3, credits: 4 }, // Reprobado
    { code: "INF314", period: "2024-1", grade: 3.2, credits: 4 }, // Reprobado
    { code: "INF315", period: "2024-1", grade: 2.8, credits: 6 }, // Reprobado
    { code: "INF316", period: "2024-1", grade: 5.4, credits: 5 },

    // 2024-2
    { code: "INF227", period: "2024-2", grade: 7.0, credits: 10 },
    { code: "INF311", period: "2024-2", grade: 1.9, credits: 7 }, // Reprobado 2da vez
    { code: "INF313", period: "2024-2", grade: 2.2, credits: 4 }, // Reprobado 2da vez
    { code: "INF314", period: "2024-2", grade: 3.1, credits: 4 }, // Reprobado 2da vez
    { code: "INF315", period: "2024-2", grade: 4.4, credits: 6 }, // Aprobado en 2do intento
    { code: "INF317", period: "2024-2", grade: 4.5, credits: 4 },
    { code: "INF-TIUV-312", period: "2024-2", grade: 6.3, credits: 2 },
    { code: "INF-TIUV-327", period: "2024-2", grade: 6.7, credits: 2 },

    // 2025-1
    { code: "INF321", period: "2025-1", grade: 5.2, credits: 4 },
    { code: "INF323", period: "2025-1", grade: 4.4, credits: 5 },
    { code: "INF324", period: "2025-1", grade: 5.1, credits: 5 },
    { code: "INF325", period: "2025-1", grade: 5.3, credits: 4 },
    { code: "INF326", period: "2025-1", grade: 5.0, credits: 4 },
    { code: "INF415", period: "2025-1", grade: 6.1, credits: 4 },
    { code: "INF421", period: "2025-1", grade: 6.4, credits: 4 },
    { code: "INF422", period: "2025-1", grade: 6.0, credits: 3 },
    { code: "INF-TIUV-417", period: "2025-1", grade: 7.0, credits: 2 },
    { code: "INF511", period: "2025-1", grade: 4.1, credits: 3 },
    { code: "INF412", period: "2025-1", grade: 5.8, credits: 6 },
    { code: "INF522", period: "2025-1", grade: 4.3, credits: 4 },
];

// Transform to enrollment format
const enrollments = academicHistory.map((record) => ({
    courseCode: record.code,
    academicPeriod: record.period,
    status: record.grade >= 4.0 ? "aprobado" : "reprobado",
    finalGrade: record.grade,
    evaluations: null
}));

// Import function
async function importData() {
    try {
        console.log(`Importing ${enrollments.length} course records...`);

        const response = await fetch('http://localhost:5000/api/academic/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: 1,
                records: enrollments
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Import failed');
        }

        const result = await response.json();
        console.log(`✅ Successfully imported ${result.imported} records!`);

        // Now import academic courses catalog
        await importCatalog();

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        process.exit(1);
    }
}

// Sample catalog (you can expand this with all courses)
const catalogSample = [
    { code: "INF111", name: "FUNDAMENTOS DE MATEMÁTICAS", credits: 8, semester: 1 },
    { code: "INF112", name: "ÁLGEBRA", credits: 8, semester: 1 },
    { code: "INF113", name: "INGLÉS I", credits: 2, semester: 1 },
    { code: "INF114", name: "DESARROLLO PERSONAL I", credits: 4, semester: 1 },
    { code: "INF115", name: "INTRODUCCIÓN A LA INGENIERÍA INFORMÁTICA", credits: 4, semester: 1 },
    { code: "INF116", name: "FUNDAMENTOS DE PROGRAMACIÓN", credits: 4, semester: 1 },
    { code: "INF121", name: "CÁLCULO DIFERENCIAL", credits: 8, semester: 2 },
    { code: "INF122", name: "ÁLGEBRA LINEAL", credits: 6, semester: 2 },
    { code: "INF123", name: "FUNDAMENTOS DE FÍSICA", credits: 6, semester: 2 },
    { code: "INF124", name: "DESARROLLO PERSONAL II", credits: 4, semester: 2 },
    { code: "INF125", name: "PROGRAMACIÓN I", credits: 4, semester: 2 },
    { code: "INF126", name: "INGLÉS II", credits: 2, semester: 2 },
    // Add more as needed
];

async function importCatalog() {
    try {
        console.log(`\nImporting ${catalogSample.length} catalog courses...`);

        for (const course of catalogSample) {
            const response = await fetch('http://localhost:5000/api/academic/catalog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(course)
            });

            if (!response.ok) {
                console.log(`⚠️  Course ${course.code} may already exist, skipping...`);
            }
        }

        console.log(`✅ Catalog import complete!`);
    } catch (error) {
        console.log('⚠️  Catalog import had some issues, but enrollments are saved');
    }
}

// Run import
console.log('🚀 Starting academic history import...\n');
importData();
