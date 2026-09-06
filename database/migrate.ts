import * as fs from 'fs';
import * as path from 'path';
import { pool } from './db';

async function runMigrations() {
  console.log('=== Starting UniConnect Database Migrations ===');
  const client = await pool.connect();

  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration file(s) to execute.`);

    for (const file of files) {
      console.log(`Executing migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✓ Migration ${file} completed successfully.`);
    }

    console.log('=== All Database Migrations Applied Successfully ===');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}
