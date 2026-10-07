require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const migrationsDirectory = path.resolve(__dirname, '../migration');

const required = ['DB_HOST', 'DB_NAME', 'DB_USER'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing database configuration: ${missing.join(', ')}`);

const databaseName = process.env.DB_NAME;
if (!/^[A-Za-z0-9_$]+$/.test(databaseName)) {
  throw new Error('DB_NAME may contain only letters, numbers, underscores, and dollar signs.');
}

function splitStatements(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8mb4',
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${databaseName}\``);

    const [[playersTable]] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'players'",
      [databaseName],
    );

    if (!playersTable) {
      const legacySchemaPath = path.resolve(__dirname, '../../Ncity-master/SQL/Database SQL.sql');
      const legacySql = fs.readFileSync(legacySchemaPath, 'utf8');
      for (const statement of splitStatements(legacySql)) {
        if (/^(SET|START TRANSACTION|COMMIT)\b/i.test(statement)) continue;
        await connection.query(statement);
      }
      console.info('Imported the legacy Naija Life schema and seed data.');
    }

    await connection.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(190) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    );

    const files = fs.readdirSync(migrationsDirectory)
      .filter((file) => /^\d+_[\w-]+\.sql$/.test(file))
      .sort();

    for (const file of files) {
      const [applied] = await connection.execute('SELECT name FROM schema_migrations WHERE name = ?', [file]);
      if (applied.length) {
        console.info(`Already applied: ${file}`);
        continue;
      }

      for (const statement of splitStatements(fs.readFileSync(path.join(migrationsDirectory, file), 'utf8'))) {
        await connection.query(statement);
      }
      await connection.execute('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      console.info(`Applied: ${file}`);
    }
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('Database migrations failed:', error.message);
  process.exitCode = 1;
});
