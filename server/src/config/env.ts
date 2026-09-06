import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function validateEnv(): void {
  const issues: string[] = [];

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.trim() === '' || jwtSecret.includes('replace_with')) {
    issues.push('JWT_SECRET is mandatory, cannot be empty, and must not use placeholder text.');
  } else if (jwtSecret.trim().length < 32) {
    issues.push('JWT_SECRET must be at least 32 characters long for cryptographic security (NFR-SEC-001).');
  }

  const port = process.env.PORT;
  if (port && isNaN(parseInt(port, 10))) {
    issues.push('PORT must be a valid integer.');
  }

  if (issues.length > 0) {
    console.error('❌ Environment Security Configuration Error:');
    issues.forEach((issue) => console.error(`  - ${issue}`));
    throw new Error(`Invalid environment configuration:\n${issues.join('\n')}`);
  }
}

// Perform fail-fast validation on module load
validateEnv();

const rawJwtExpiresIn = process.env.JWT_EXPIRES_IN || '86400';
const parsedJwtExpiresIn = parseInt(rawJwtExpiresIn, 10);

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'uniconnect_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true',
  },

  // JWT Security (NFR-SEC-001) - Strictly Mandatory, No Fallbacks
  jwt: {
    secret: (process.env.JWT_SECRET as string).trim(),
    expiresIn: isNaN(parsedJwtExpiresIn) ? 86400 : parsedJwtExpiresIn,
  },

  // Institutional Email Domain Policy
  institution: {
    domainRegex: new RegExp(
      process.env.INSTITUTION_EMAIL_DOMAIN_REGEX || '^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\\.)*edu\\.vn$',
      'i'
    ),
    defaultDomain: process.env.INSTITUTION_DEFAULT_DOMAIN || 'university.edu.vn',
  },
};
