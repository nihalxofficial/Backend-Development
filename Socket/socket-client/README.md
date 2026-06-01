# Better Auth + Prisma 7 + Neon + Next.js Setup Guide

> Stack: **Better Auth 1.6** · **Prisma 7** · **Neon PostgreSQL** · **Next.js 16**

---

## Step 1 — Install Packages

```bash
npm install better-auth @prisma/client @prisma/adapter-neon dotenv
npm install -D prisma
```

---

## Step 2 — Environment Variables (`.env`)

Go to **Neon Console → your project → Connect** and copy the connection string.

```env
# Pooled — has -pooler in hostname (used by app at runtime)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"

# Direct — remove -pooler from hostname (used by Prisma CLI)
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

BETTER_AUTH_SECRET="any-long-random-string-minimum-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

> **Tip:** `DIRECT_URL` is just `DATABASE_URL` with `-pooler` removed from the hostname.

---

## Step 3 — Initialize Prisma

```bash
npx prisma init --output ../src/generated/prisma
```

---

## Step 4 — `prisma/schema.prisma`

> In Prisma 7: provider is `prisma-client`, `output` is required, and `url`/`directUrl` are moved to `prisma.config.ts`.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?
}
```

---

## Step 5 — `prisma.config.ts` (root of project)

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"), // CLI uses direct connection
  },
});
```

---

## Step 6 — `src/lib/prisma.ts`

```ts
import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

---

## Step 7 — `src/lib/auth.ts`

> Use `better-auth/minimal` with Prisma — it excludes Kysely and fixes the Turbopack ESM error.

```ts
import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
```

---

## Step 8 — `src/app/api/auth/[...all]/route.ts`

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

---

## Step 9 — `src/lib/auth-client.ts`

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

---

## Step 10 — Generate & Push to Database

```bash
npx prisma generate
npx prisma db push
npm run dev
```

---

## Usage in Components

```ts
// Sign up
await signUp.email({ name, email, password });

// Sign in
await signIn.email({ email, password });

// Sign out
await signOut();

// Get session (in a Client Component)
const { data: session } = useSession();
console.log(session?.user);
```

---

## When to Run Prisma Commands

| Situation | Commands |
|-----------|----------|
| Changed `schema.prisma` | `npx prisma db push` → `npx prisma generate` |
| Changed TypeScript only | Nothing needed |
| Want migration history (production) | `npx prisma migrate dev` → `npx prisma generate` |

> **Rule:** Always run both commands in order whenever `schema.prisma` changes.

---

## Why `better-auth/minimal`?

Next.js 16 uses Turbopack by default. `better-auth` (full) imports `@better-auth/kysely-adapter`
which causes a Turbopack ESM export error. `better-auth/minimal` skips Kysely entirely —
it is the correct import when using Prisma or Drizzle adapters.

---

## Why Two Database URLs?

| Variable | Used by | Why |
|----------|---------|-----|
| `DATABASE_URL` | Your app (runtime) | Pooled connection handles serverless concurrency |
| `DIRECT_URL` | Prisma CLI (`db push`, `migrate`) | Schema changes need a direct connection |