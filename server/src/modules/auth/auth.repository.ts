import { pool } from '../../config/database';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: 'STUDENT' | 'ADMIN';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  verification_token: string | null;
  verification_expires_at: Date | null;
  reset_token: string | null;
  reset_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class AuthRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const res = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const res = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByVerificationToken(token: string): Promise<UserRow | null> {
    const res = await pool.query(
      `SELECT * FROM users WHERE verification_token = $1`,
      [token]
    );
    return res.rows[0] || null;
  }

  async findByResetToken(token: string): Promise<UserRow | null> {
    const res = await pool.query(
      `SELECT * FROM users WHERE reset_token = $1`,
      [token]
    );
    return res.rows[0] || null;
  }

  async createUserWithProfile(
    email: string,
    passwordHash: string,
    fullName: string,
    verificationToken: string,
    verificationExpiresAt: Date
  ): Promise<UserRow> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role, status, verification_token, verification_expires_at)
         VALUES ($1, $2, 'STUDENT', 'PENDING_VERIFICATION', $3, $4)
         RETURNING *;`,
        [email, passwordHash, verificationToken, verificationExpiresAt]
      );

      const createdUser = userRes.rows[0];

      await client.query(
        `INSERT INTO student_profiles (user_id, full_name)
         VALUES ($1, $2);`,
        [createdUser.id, fullName]
      );

      await client.query('COMMIT');
      return createdUser;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateVerificationStatus(userId: string): Promise<UserRow> {
    const res = await pool.query(
      `UPDATE users
       SET status = 'ACTIVE',
           verification_token = NULL,
           verification_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *;`,
      [userId]
    );
    return res.rows[0];
  }

  async updateVerificationToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `UPDATE users
       SET verification_token = $1,
           verification_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3;`,
      [token, expiresAt, userId]
    );
  }

  async updateResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `UPDATE users
       SET reset_token = $1,
           reset_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3;`,
      [token, expiresAt, userId]
    );
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await pool.query(
      `UPDATE users
       SET password_hash = $1,
           reset_token = NULL,
           reset_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2;`,
      [passwordHash, userId]
    );
  }
}

export const authRepository = new AuthRepository();
