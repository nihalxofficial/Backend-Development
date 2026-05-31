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
    res.json({ message: "Server is active ✔" });
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