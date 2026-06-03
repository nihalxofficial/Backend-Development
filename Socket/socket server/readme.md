# Deploying Express + Socket.IO + Prisma + PostgreSQL on Render

A step-by-step guide to deploying your Express + Socket.IO + Prisma + PostgreSQL backend on [Render](https://render.com).

---

## Prerequisites

- Node.js project with Express + Socket.IO
- Prisma ORM with PostgreSQL (e.g. Neon)
- GitHub repository
- Render account

---

## Step 1 — Update `package.json`

Ensure your scripts are configured for both local dev and production build:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "prisma generate && tsc",
    "start": "node dist/index.js"
  }
}
```

> `prisma generate` runs before `tsc` so the generated client is available during compilation.

---

## Step 2 — Update `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "lib": ["ES2022"],
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "prisma.config.ts"]
}
```

> `skipLibCheck: true` avoids type errors from packages like Upstash during the build.
> `prisma.config.ts` is excluded because it uses ESM syntax incompatible with the CommonJS compiler output.

---

## Step 3 — Configure the Prisma Client

Your `prisma.ts` should use the `PrismaPg` driver adapter and read `DATABASE_URL` from environment variables:

```ts
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
```

Also verify that the `generator` block in your `schema.prisma` outputs to the path matching your import above:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/prisma/client"
}
```

---

## Step 4 — Use Render's Dynamic Port

Render injects a `PORT` environment variable. Never hardcode the port:

```ts
// ✅ Correct
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

// ❌ Wrong — will break on Render
server.listen(5000);
```

---

## Step 5 — Add a Health Check Route

Add a root route so Render (and you) can quickly verify the server is up:

```ts
app.get("/", (req, res) => {
  res.send("API Running");
});
```

---

## Step 6 — Configure Render Service

In the Render dashboard when creating a new **Web Service**:

| Setting | Value |
|---|---|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Runtime** | Node |

---

## Step 7 — Add Environment Variables

In the Render dashboard → your service → **Environment**, add all required variables:

```
DATABASE_URL=postgresql://user:password@host/dbname
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Add any other secrets your app needs (JWT secrets, API keys, etc.).

---

## Step 8 — Test the Build Locally

Before pushing, always verify the production build works on your machine:

```bash
npx prisma generate
npm run build
npm start
```

Fix any TypeScript or Prisma errors locally — Render will show the same errors if they exist.

---

## Step 9 — Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

If **Auto Deploy** is enabled in Render, a deployment will trigger automatically on every push to `main`.

---

## Deployment Flow Summary

```
git push → Render pulls repo → npm run build
  └─> prisma generate (generates client)
  └─> tsc (compiles TypeScript to dist/)
      → npm start → node dist/index.js
```

---

## Troubleshooting

**Build fails with Prisma errors**
Run `npx prisma generate` locally and commit the generated client, or ensure `prisma generate` is part of the build command.

**Port binding errors**
Make sure you're using `process.env.PORT` and not a hardcoded port number.

**Database connection refused**
Double-check `DATABASE_URL` in Render's environment variables. For Neon, ensure SSL is enabled in the connection string (e.g. `?sslmode=require`).

**TypeScript errors during build**
Add `skipLibCheck: true` to `tsconfig.json` and test with `npm run build` locally before pushing.


# Deploying Express + TypeScript + Prisma + Socket (Backend) On Docker

### Project Structure

```
my-ts-prisma-app/
├── src/
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Dockerfile

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

### ⚠️ Critical: package.json build script

Your `build` script must only run `tsc` — **not** `prisma generate`.

```json
// ✅ Correct
"scripts": {
  "build": "tsc"
}

// ❌ Wrong — crashes the Docker build (DATABASE_URL not available at build time)
"scripts": {
  "build": "prisma generate && tsc"
}
```

The Dockerfile already handles `prisma generate` as a separate step before `npm run build`. Running it again inside the build script fails because `DATABASE_URL` is not available during image builds.

### Why this order?

| Step | Why |
|------|-----|
| `RUN npm install` | Installs all dependencies including Prisma CLI |
| `RUN npx prisma generate` | Writes Prisma client into `node_modules/.prisma/client` — no `DATABASE_URL` needed |
| `RUN npm run build` (tsc only) | Compiles TypeScript → `dist/`. Prisma client already exists so imports resolve |
| `npx prisma migrate deploy` (CMD) | Applies pending migrations at container startup when `DATABASE_URL` is available |

> Never use `prisma migrate dev` in Docker — it's interactive and can reset your data.

### Commands to Build & Run

```bash
docker build -t my-ts-prisma-app .

# DATABASE_URL must be in your .env
docker run -d -p 5000:5000 --env-file .env --name ts-prisma-app my-ts-prisma-app
# http://localhost:5000
```

> ⚠️ Never hardcode `DATABASE_URL` in the Dockerfile. Always pass it at runtime with `--env-file .env`.
