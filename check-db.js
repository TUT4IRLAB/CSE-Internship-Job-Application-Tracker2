require("dotenv").config({ path: "backend/.env" });

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkDatabase() {
    try {
        const result = await pool.query(`
            SELECT
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'applications'
            ORDER BY ordinal_position;
        `);

        console.table(result.rows);
    } catch (error) {
        console.error("Database error:", error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();