const prisma = require('../src/config/database');

const requiredColumns = {
    Appointment: [
        'id',
        'studentId',
        'counselorId',
        'scheduleId',
        'appointmentDate',
        'startTime',
        'endTime',
        'counselingType',
        'meetingLink',
        'topicOrReason',
        'status',
        'createdAt',
        'updatedAt',
        'hiddenByStudentAt',
        'hiddenByCounselorAt',
    ],
};

async function checkSchema() {
    const databaseRows = await prisma.$queryRaw`SELECT DATABASE() AS databaseName`;
    const databaseName = databaseRows[0]?.databaseName;

    if (!databaseName) {
        throw new Error('Database aktif tidak dapat ditentukan.');
    }

    const missingColumns = [];

    for (const [tableName, columns] of Object.entries(requiredColumns)) {
        const rows = await prisma.$queryRaw`
            SELECT COLUMN_NAME AS columnName
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ${databaseName}
              AND TABLE_NAME = ${tableName}
        `;
        const existingColumns = new Set(rows.map((row) => row.columnName));

        for (const columnName of columns) {
            if (!existingColumns.has(columnName)) {
                missingColumns.push(`${tableName}.${columnName}`);
            }
        }
    }

    if (missingColumns.length > 0) {
        console.error('Skema database belum sinkron. Kolom yang hilang:');
        missingColumns.forEach((column) => console.error(`- ${column}`));
        process.exitCode = 1;
        return;
    }

    console.log(`Skema database "${databaseName}" sinkron untuk kolom kritis.`);
}

checkSchema()
    .catch((error) => {
        console.error('Gagal memeriksa skema database:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
