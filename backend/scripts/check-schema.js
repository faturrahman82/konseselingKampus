const { Prisma } = require('@prisma/client');
const prisma = require('../src/config/database');

const requiredModels = Prisma.dmmf.datamodel.models.map((model) => ({
    tableName: model.dbName || model.name,
    columns: model.fields
        .filter((field) => field.kind === 'scalar' || field.kind === 'enum')
        .map((field) => field.dbName || field.name),
}));

async function checkSchema() {
    const databaseRows = await prisma.$queryRaw`SELECT DATABASE() AS databaseName`;
    const databaseName = databaseRows[0]?.databaseName;

    if (!databaseName) {
        throw new Error('Database aktif tidak dapat ditentukan.');
    }

    const missingTables = [];
    const missingColumns = [];

    for (const { tableName, columns } of requiredModels) {
        const rows = await prisma.$queryRaw`
            SELECT COLUMN_NAME AS columnName
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ${databaseName}
              AND TABLE_NAME = ${tableName}
        `;
        const existingColumns = new Set(rows.map((row) => row.columnName));

        if (existingColumns.size === 0) {
            missingTables.push(tableName);
            continue;
        }

        for (const columnName of columns) {
            if (!existingColumns.has(columnName)) {
                missingColumns.push(`${tableName}.${columnName}`);
            }
        }
    }

    if (missingTables.length > 0 || missingColumns.length > 0) {
        console.error('Skema database belum sinkron.');
        if (missingTables.length > 0) {
            console.error('Tabel yang hilang:');
            missingTables.forEach((table) => console.error(`- ${table}`));
        }
        if (missingColumns.length > 0) console.error('Kolom yang hilang:');
        missingColumns.forEach((column) => console.error(`- ${column}`));
        process.exitCode = 1;
        return;
    }

    console.log(`Skema database "${databaseName}" sinkron dengan seluruh model Prisma.`);
}

checkSchema()
    .catch((error) => {
        console.error('Gagal memeriksa skema database:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
