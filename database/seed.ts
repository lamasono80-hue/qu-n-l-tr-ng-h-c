import { pool } from './db';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runSeed() {
  console.log('=== Starting UniConnect Database Seeding ===');

  // 1. Mandatory Environment Configuration Verification (Zero Plaintext Credential Policy)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@uniconnect.edu.vn';
  const adminPasswordHash = process.env.SEED_ADMIN_PASSWORD_HASH;

  if (!adminPasswordHash || adminPasswordHash.trim() === '' || adminPasswordHash.includes('replace_with')) {
    console.error('❌ Configuration Error: SEED_ADMIN_PASSWORD_HASH is required and must be provided via environment variables. Refusing to seed administrator credentials without an explicit password hash.');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 2. Seed Administrator Account (Phase 4 Section 6.1)
    const adminUserRes = await client.query(
      `INSERT INTO users (email, password_hash, role, status)
       VALUES ($1, $2, 'ADMIN', 'ACTIVE')
       ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', status = 'ACTIVE'
       RETURNING id, email, role, status;`,
      [adminEmail.trim().toLowerCase(), adminPasswordHash.trim()]
    );

    console.log(`✓ Admin User Seeded: ${adminUserRes.rows[0].email} (ID: ${adminUserRes.rows[0].id})`);

    // 3. Seed Admin Profile
    if (adminUserRes.rows.length > 0) {
      await client.query(
        `INSERT INTO student_profiles (user_id, full_name, campus, major, bio)
         VALUES ($1, 'System Administrator', 'Main Campus', 'Administration', 'Official System Administrator for UniConnect Platform')
         ON CONFLICT (user_id) DO NOTHING;`,
        [adminUserRes.rows[0].id]
      );
      console.log('✓ Admin Profile Seeded.');
    }

    await client.query('COMMIT');
    console.log('=== Database Seeding Completed Successfully ===');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runSeed();
}
