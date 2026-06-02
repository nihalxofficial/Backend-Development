# Redis Caching with Upstash

A beginner-friendly guide to adding Redis caching to your Node.js project using Upstash — works with both **MongoDB (Mongoose)** and **PostgreSQL (Prisma)**.

---

## What is Redis?

Redis is a super fast **in-memory cache**. Instead of hitting your database on every request, you save the result in Redis. Next request? Return from Redis instantly.

```
Without Redis:  Request → Database → Response         (slow)
With Redis:     Request → Redis → Response             (fast)
                Request → Redis miss → Database → Redis → Response
```

---

## Why Upstash?

- ✅ Free tier (no credit card)
- ✅ No Docker, no local setup
- ✅ Works perfectly on Vercel / serverless
- ✅ HTTP based (no persistent connection needed)

---

## Setup (Same for Both MongoDB & Prisma)

### Step 1 — Create Upstash Database

1. Go to [upstash.com](https://upstash.com) and sign up
2. Click **Create Database**
3. Choose a name, pick your region, click **Create**
4. Copy your `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

---

### Step 2 — Install SDK

```bash
npm install @upstash/redis
```

> ⚠️ Do NOT use `ioredis` or `redis` packages — those need a persistent TCP connection which breaks on Vercel/serverless. Always use `@upstash/redis`.

---

### Step 3 — Add to `.env`

```env
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

---

### Step 4 — Add to Vercel

Go to your Vercel project → **Settings** → **Environment Variables** → add the same two values.

---

## How Caching Works (Simple Rules)

| Request Type | What to do with Redis |
|---|---|
| `GET` | Check cache first → if found return it → if not, fetch DB then save to cache |
| `POST` | Write to DB → delete related cache |
| `PATCH` | Update in DB → delete related cache |
| `DELETE` | Delete from DB → delete related cache |

**Why delete cache on write?**
Because the cached data is now outdated. Deleting it forces the next GET to fetch fresh data and re-cache it.

---

## Key Naming Convention

Redis keys are just strings you make up. Use `:` as a separator for readability:

```
"students:all"   →  stores the full list
"student:1"      →  stores one student with id 1
"student:2"      →  stores one student with id 2
```

Redis has **no fixed key names** — these are just labels you invent. Only the methods are fixed: `redis.get()`, `redis.set()`, `redis.del()`.

---
---

# Example 1 — MongoDB + Mongoose (index.js)

### Install dependencies
```bash
npm install express mongoose @upstash/redis dotenv
```

### `index.js`

```js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import { Redis } from '@upstash/redis';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI);

// ─── Student Schema & Model ────────────────────────────────────
const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    grade: String,
});
const Student = mongoose.model('Student', studentSchema);

// ─── Redis Client Setup ────────────────────────────────────────
// Connects to your Upstash Redis using credentials from .env
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
// ──────────────────────────────────────────────────────────────


app.get("/", (req, res) => {
    res.json({ message: "aServer is active ✔" });
});


// ─── GET all students ─────────────────────────────────────────
app.get("/students", async (req, res) => {

    // Check if students list is already saved in Redis
    const cached = await redis.get("students:all");

    // If yes → return cached data, skip the database entirely
    if (cached) {
        return res.send(cached);
    }

    // If no → fetch from MongoDB
    const result = await Student.find().sort({ age: -1 }).limit(3);

    // Save result in Redis for 60 seconds
    await redis.set("students:all", result, { ex: 60 });

    res.send(result);
});


// ─── GET single student by ID ─────────────────────────────────
app.get("/students/:id", async (req, res) => {
    const { id } = req.params;

    // Check cache using unique key per student e.g. "student:abc123"
    const cached = await redis.get(`student:${id}`);

    // If found → return it, no DB call needed
    if (cached) {
        return res.send(cached);
    }

    // Not in cache → fetch from MongoDB
    const result = await Student.findById(id);

    // Save this student in Redis for 60 seconds
    await redis.set(`student:${id}`, result, { ex: 60 });

    res.send(result);
});


// ─── POST create one student ──────────────────────────────────
app.post("/students", async (req, res) => {
    const studentData = req.body;

    // Save new student to MongoDB
    const result = await Student.create(studentData);

    // New student added → old list cache is outdated → delete it
    await redis.del("students:all");

    res.send(result);
});


// ─── PATCH update a student ───────────────────────────────────
app.patch("/students/:id", async (req, res) => {
    const { id } = req.params;
    const studentData = req.body;

    // Update student in MongoDB
    const result = await Student.findByIdAndUpdate(id, studentData, { new: true });

    // Data changed → delete individual cache
    await redis.del(`student:${id}`);

    // Also delete list cache since it includes this student
    await redis.del("students:all");

    res.send(result);
});


// ─── DELETE a student ─────────────────────────────────────────
app.delete("/students/:id", async (req, res) => {
    const { id } = req.params;

    // Delete from MongoDB
    const result = await Student.findByIdAndDelete(id);

    // Student gone → delete individual cache
    await redis.del(`student:${id}`);

    // Also delete list cache since the list changed
    await redis.del("students:all");

    res.send(result);
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### `.env` for MongoDB
```env
MONGO_URI=mongodb+srv://your-connection-string
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
PORT=5000
```

---
---

# Example 2 — PostgreSQL + Prisma (index.ts)

### Install dependencies
```bash
npm install express @upstash/redis dotenv
npm install -D typescript @types/express @types/node
```

### `index.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import prisma from './prisma'; // your prisma client instance
import { Redis } from '@upstash/redis';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ─── Redis Client Setup ────────────────────────────────────────
// Connects to your Upstash Redis using credentials from .env
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
// ──────────────────────────────────────────────────────────────


app.get("/", async (req: Request, res: Response) => {
    res.json({ message: "Server is active ✔" });
});


// ─── GET all students ─────────────────────────────────────────
app.get("/students", async (req: Request, res: Response) => {

    // Check if students list is already saved in Redis
    const cached = await redis.get("students:all");

    // If yes → return cached data, skip the database entirely
    if (cached) {
        res.send(cached);
        return;
    }

    // If no → fetch from PostgreSQL via Prisma
    const result = await prisma.student.findMany({
        take: 3,
        orderBy: { age: "desc" }
    });

    // Save result in Redis for 60 seconds
    await redis.set("students:all", result, { ex: 60 });

    res.send(result);
});


// ─── GET single student by ID ─────────────────────────────────
app.get("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check cache using unique key per student e.g. "student:1"
    const cached = await redis.get(`student:${id}`);

    // If found → return it, no DB call needed
    if (cached) {
        res.send(cached);
        return;
    }

    // Not in cache → fetch from PostgreSQL via Prisma
    const result = await prisma.student.findUnique({
        where: { id: Number(id) }
    });

    // Save this student in Redis for 60 seconds
    await redis.set(`student:${id}`, result, { ex: 60 });

    res.send(result);
});


// ─── POST create one student ──────────────────────────────────
app.post("/students", async (req: Request, res: Response) => {
    const studentData = req.body;

    // Save new student to PostgreSQL
    const result = await prisma.student.create({ data: studentData });

    // New student added → old list cache is outdated → delete it
    await redis.del("students:all");

    res.send(result);
});


// ─── POST create many students ────────────────────────────────
app.post("/students/startup", async (req: Request, res: Response) => {
    const studentData = req.body;

    // Save many students to PostgreSQL at once
    const result = await prisma.student.createMany({ data: studentData });

    // Many added → delete list cache so it refreshes
    await redis.del("students:all");

    res.send(result);
});


// ─── PATCH update a student ───────────────────────────────────
app.patch("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentData = req.body;

    // Update student in PostgreSQL
    const result = await prisma.student.update({
        where: { id: Number(id) },
        data: studentData
    });

    // Data changed → delete individual cache
    await redis.del(`student:${id}`);

    // Also delete list cache since it includes this student
    await redis.del("students:all");

    res.send(result);
});


// ─── DELETE a student ─────────────────────────────────────────
app.delete("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    // Delete from PostgreSQL
    const result = await prisma.student.delete({
        where: { id: Number(id) }
    });

    // Student gone → delete individual cache
    await redis.del(`student:${id}`);

    // Also delete list cache since the list changed
    await redis.del("students:all");

    res.send(result);
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### `.env` for Prisma
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
PORT=5000
```

---
---

# Example 3 — Better Auth Session Store with Redis (Next.js)

By default, Better Auth stores sessions in your main database (Postgres/MongoDB). This means **every authenticated request hits your DB** just to validate a session token. Redis fixes this — sessions live in-memory and resolve in microseconds.

```
Without Redis:  Request → DB session lookup → Response     (slow, DB hit every time)
With Redis:     Request → Redis session lookup → Response  (fast, in-memory)
```

---

## Why use Redis for Better Auth sessions?

| Concern | Without Redis | With Redis |
|---|---|---|
| Session lookup speed | DB query every request | In-memory, ~1ms |
| DB load | Every request hits DB | Only on first login |
| Forced logout / revoke | Manual DB update | `redis.del()` instantly |
| Scale across serverless | Slow cold-start DB calls | Fast stateless lookup |

---

### Install dependencies

```bash
npm install better-auth @upstash/redis @better-auth/redis
```

> `@better-auth/redis` is the official Better Auth adapter for Redis session storage.

---

### File structure

```
lib/
  auth.ts          ← Better Auth config (server-side)
  auth-client.ts   ← Better Auth client (used in components)
  redis.ts         ← Shared Redis client
app/
  api/
    auth/
      [...all]/
        route.ts   ← Next.js API route that handles all auth
  dashboard/
    page.tsx       ← Protected page example
  api/
    revoke-session/
      route.ts     ← Admin: force logout any user
```

---

### Step 1 — `lib/redis.ts`

```typescript
import { Redis } from '@upstash/redis';

// Shared Redis instance — import this wherever you need Redis
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

---

### Step 2 — `lib/auth.ts`

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { upstashRedisAdapter } from '@better-auth/redis';
import { redis } from './redis';
import prisma from './prisma';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql', // or 'mongodb'
    }),

    // ─── Use Redis as the session store ───────────────────────
    // Sessions are saved in Redis instead of your main DB.
    // The DB adapter is still used for user/account data only.
    secondaryStorage: upstashRedisAdapter(redis),
    // ──────────────────────────────────────────────────────────

    session: {
        // How long a session stays valid (e.g. 7 days)
        expiresIn: 60 * 60 * 24 * 7,

        // Sliding expiry — resets TTL on every active request
        // so active users never get logged out
        updateAge: 60 * 60 * 24, // refresh if older than 1 day

        // Cookie settings
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // client-side cache for 5 minutes
        },
    },

    emailAndPassword: {
        enabled: true,
    },
});
```

---

### Step 3 — `lib/auth-client.ts`

```typescript
import { createAuthClient } from 'better-auth/react';

// Use this in React components (client-side)
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});
```

---

### Step 4 — `app/api/auth/[...all]/route.ts`

```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Better Auth handles all /api/auth/* routes automatically:
// sign-in, sign-up, sign-out, session, callback, etc.
export const { GET, POST } = toNextJsHandler(auth);
```

---

### Step 5 — Protect a Server Component (e.g. `app/dashboard/page.tsx`)

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {

    // Validate session — Better Auth checks Redis (not DB)
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // No valid session → redirect to login
    if (!session) {
        redirect('/login');
    }

    // Session valid → render page
    return (
        <div>
            <h1>Welcome, {session.user.name}</h1>
            <p>User ID: {session.user.id}</p>
        </div>
    );
}
```

---

### Step 6 — Protect an API Route (e.g. `app/api/students/route.ts`)

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {

    // Validate session from request headers
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // No session → 401
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Authorized → return protected data
    return NextResponse.json({
        message: `Hello ${session.user.name}`,
        userId: session.user.id,
    });
}
```

---

### Step 7 — Manual Session Management

Since sessions live in Redis, you have full control over them.

**Force logout any user** — `app/api/admin/revoke-session/route.ts`

```typescript
import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/revoke-session  { sessionToken: "..." }
// Useful for: password change, account ban, security breach
export async function POST(req: NextRequest) {
    const { sessionToken } = await req.json();

    // Delete the session from Redis immediately
    // User's next request will fail auth and be logged out
    await redis.del(`session:${sessionToken}`);

    return NextResponse.json({ message: 'Session revoked' });
}
```

**Sign out current user from a Client Component**

```typescript
'use client';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        // Better Auth clears the session from Redis + removes the cookie
        await authClient.signOut();
        router.push('/login');
    };

    return <button onClick={handleSignOut}>Sign Out</button>;
}
```

**Check session status in a Client Component**

```typescript
'use client';
import { authClient } from '@/lib/auth-client';

export default function SessionStatus() {
    // useSession hook — reads from Redis via the auth API
    const { data: session, isPending } = authClient.useSession();

    if (isPending) return <p>Loading...</p>;

    return (
        <div>
            {session
                ? <p>✅ Logged in as {session.user.name}</p>
                : <p>❌ Not logged in</p>
            }
        </div>
    );
}
```

---

### How session keys are stored in Redis

Better Auth stores sessions under this key pattern:

```
"session:<token>"   →  stores full session object with user info + expiry
```

---

### `.env` for Better Auth + Redis (Next.js)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---
---

## Quick Reference

### The 3 Redis methods used

```js
// Save something (ex = expire in seconds)
await redis.set("key", value, { ex: 60 });

// Get something (returns null if not found or expired)
await redis.get("key");

// Delete something
await redis.del("key");
```

### Cache expiry (`ex`) cheatsheet

| Use Case | TTL |
|---|---|
| List of records | `ex: 60` (1 min) |
| Single record | `ex: 60` (1 min) |
| Session / token | `ex: 86400` (1 day) |
| Rate limit window | `ex: 60` (1 min) |
| Heavy query | `ex: 300` (5 min) |

---

## Deploying to Vercel

No extra config needed. Just make sure your two Upstash env variables are added in **Vercel → Project → Settings → Environment Variables**. Your local Docker or local Redis is irrelevant — Upstash is hosted in the cloud and works from anywhere.