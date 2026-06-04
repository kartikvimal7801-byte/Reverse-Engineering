# Database Setup Guide

## Prerequisites

1. **PostgreSQL 15+** installed and running
2. **Node.js 18+** installed
3. **npm** package manager

## Initial Setup

### 1. Create Database

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE pump_reverse_engineering;
```

Or using command line:

```bash
createdb pump_reverse_engineering
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pump_reverse_engineering
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Test Database Connection

```bash
npm run test:db
```

Expected output:
```
✓ Database connection successful
✓ Test query successful: { now: 2024-01-01T12:00:00.000Z }
```

### 5. Run Database Migrations

```bash
npm run migrate:ts
```

Expected output:
```
Database schema created successfully
Migration completed
```

## Database Schema

The schema includes the following tables:

### Core Tables
- **users** - User authentication and roles
- **projects** - Reverse engineering projects
- **workflow_steps** - Step-by-step workflow data (JSONB)

### Component Data (Steps 2-4)
- **components** - Product components from teardown
- **measurements** - Component measurements and dimensions
- **materials** - Material identification data

### Analysis Data (Steps 5-6)
- **performance_data** - Performance benchmarking results
- **cost_data** - Cost breakdown analysis

### AI & Review (Steps 7-10)
- **ai_analysis** - AI-generated analysis and suggestions
- **management_reviews** - Management review decisions

### Output (Step 11)
- **reports** - Generated PDF reports
- **files** - File upload tracking (images, CAD, PDFs)

## Connection Pooling

The application uses `pg-pool` for connection pooling with the following configuration:

- **Max connections**: 20
- **Idle timeout**: 30 seconds
- **Connection timeout**: 2 seconds

## Troubleshooting

### Connection Issues

1. **Error: password authentication failed**
   - Check DB_USER and DB_PASSWORD in .env file
   - Verify PostgreSQL user exists and has correct password

2. **Error: database does not exist**
   - Create the database using: `createdb pump_reverse_engineering`
   - Or create manually in psql: `CREATE DATABASE pump_reverse_engineering;`

3. **Error: connection refused**
   - Ensure PostgreSQL is running: `pg_ctl status`
   - Check DB_HOST and DB_PORT in .env file
   - Verify PostgreSQL is accepting connections on the specified port

### Migration Issues

1. **Tables already exist**
   - Migrations use `CREATE TABLE IF NOT EXISTS`, so re-running is safe
   - To reset: Drop and recreate the database

2. **Permission errors**
   - Ensure the database user has CREATE privileges
   - Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE pump_reverse_engineering TO your_user;`

## Running Tests

### Unit Tests

Run the complete test suite (requires database to be set up and running):

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

### Test Files
- `src/db/pool.test.ts` - Connection pooling tests
- `src/db/models.test.ts` - Database model CRUD tests (80+ test cases)
- `src/db/migrate.test.ts` - Migration system tests
- `src/db/testConnection.test.ts` - Connection utility tests

**Note**: Tests require a running PostgreSQL instance. Ensure the database is set up and migrations have been run before executing tests.

## Useful Commands

```bash
# Test database connection
npm run test:db

# Run migrations (TypeScript)
npm run migrate:ts

# Run migrations (JavaScript)
npm run migrate

# Run all tests with coverage
npm test

# Start server with TypeScript
npm run dev:ts

# Build TypeScript to JavaScript
npm run build
```

## Database Backup & Restore

### Backup
```bash
pg_dump pump_reverse_engineering > backup.sql
```

### Restore
```bash
psql pump_reverse_engineering < backup.sql
```
