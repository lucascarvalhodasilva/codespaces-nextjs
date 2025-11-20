# GitHub Codespaces ♥️ Next.js

A batteries-included Next.js starter configured to run entirely inside GitHub Codespaces with a Dockerized Postgres database. Follow the steps below to stand up the database, sync Prisma, and launch the app.

## Requirements

- Node.js 18+ (already preinstalled inside this Codespace)
- npm 9+
- Docker CLI (available inside the Codespace VM) for the local Postgres container

## 1. Configure `.env.local`

Create a `.env.local` file at the repo root (this file is git-ignored) with your desired database credentials. A good starting point is:

```bash
DATABASE_URL="postgresql://admin:super-secret@localhost:5432/grodt?schema=public"
POSTGRES_USER="admin"
POSTGRES_PASSWORD="super-secret"
POSTGRES_DB="grodt"
POSTGRES_PORT="5432"
POSTGRES_CONTAINER="postgres-local"
POSTGRES_IMAGE="postgres:15"
```

> The helper script and all npm database commands source this file, so you only have to declare the values once.

## 2. Create & start the Postgres database

The project ships with `scripts/shared/docker-db.sh`, a thin wrapper around `docker run`. It will create the database container the first time you start it and reuse it thereafter.

```bash
npm run db:start   # creates (if needed) and starts the container defined in .env.local
```

You can inspect status or logs at any time:

```bash
npm run db:status
npm run db:logs
```

To recreate the database from scratch, stop the container, delete the Docker volume it created (`pgdata` by default), update `.env.local` if desired, and run `npm run db:start` again.

## 3. Generate the Prisma client & apply the schema

With the container running, sync the Prisma client and schema against Postgres:

```bash
npm run db:generate   # emits a Postgres-aware Prisma client
npm run db:push       # or: npm run db:migrate to apply migration history
```

`db:push` is great for local prototyping; `db:migrate` applies the tracked migrations and is what you should run in CI/staging/prod.

## 4. Seed sample data (optional)

Need starter trades or strategies? Run the seeder, which auto-runs `db:generate` via npm’s `pre` hook and accepts optional filters:

```bash
npm run db:seed -- --all          # run every seed script
npm run db:seed -- --trades       # just seed trade data
npm run db:seed -- --strategies   # just seed strategy data
```

## 5. Run the Next.js app

Next.js automatically loads `.env.local`, so once the database is up and migrated, just run:

```bash
npm run dev
```

Prisma will connect to the Postgres instance defined in `DATABASE_URL` and the seeded data will appear in the UI (see `src/app`).

## Script reference

| Command | Purpose |
| --- | --- |
| `npm run db:start` | Create/start the Postgres container using values from `.env.local`. |
| `npm run db:stop` | Stop the Postgres container without removing it. |
| `npm run db:status` | Show the container’s current status. |
| `npm run db:logs` | Tail Postgres logs for troubleshooting. |
| `npm run db:generate` | Generate the Prisma client for Postgres. |
| `npm run db:push` | Push the current Prisma schema directly to Postgres. |
| `npm run db:migrate` | Apply the Prisma migration history. |
| `npm run db:seed [-- trades|strategies|all]` | Seed the database with demo data. |
| `npm run db:studio` | Launch Prisma Studio connected to the Postgres instance. |

## Additional notes

- Prisma models live in `db/prisma/schema.prisma`, the single source of truth for both the client and migrations.
- Docker helper defaults to `./.env.local`. Override the path by exporting `POSTGRES_ENV_FILE` before running the scripts.
- Personal helper scripts can go in `scripts/local/` (git-ignored) if you want custom automation without touching shared tooling.
