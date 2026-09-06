# UniConnect Database Module

This directory contains the physical schema migrations, triggers, constraints, and seed scripts for the **UniConnect** platform in PostgreSQL 15+.

## Directory Layout
- `migrations/`
  - `001_create_schema_tables.sql`: 17 physical tables with keys, foreign keys, cascades, and check constraints.
  - `002_create_indexes_triggers.sql`: Search & join performance indexes, participant integrity triggers, and cross-table self-application guards (BR-003).
  - `003_create_seed_data.sql`: Standard skills catalog and standard courses catalog.
- `db.ts`: Parameterized PostgreSQL connection pool.
- `migrate.ts`: Transaction-safe migration runner.
- `seed.ts`: Dynamic administrative account seeder with zero plaintext credentials.

## Execution Commands
```bash
# Run migrations
npm run migrate

# Run seeds
npm run seed
```
