import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { config } from './env';

const poolConfig: PoolConfig = config.database.url
  ? {
      connectionString: config.database.url,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    };

export const pool = new Pool(poolConfig);

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<{ res: QueryResult<R>; duration: number }> {
  const start = Date.now();
  const res = await pool.query<R>(text, params);
  const duration = Date.now() - start;
  return { res, duration };
}
