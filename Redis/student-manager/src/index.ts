import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import prisma from './prisma';
import { Redis } from '@upstash/redis';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ─── Redis Setup ───────────────────────────────────────────────
// Create a Redis client using your Upstash credentials from .env
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
// ───────────────────────────────────────────────────────────────

app.get("/", async (req: Request, res: Response) => {
    console.log("default server");
    res.json({ "message": "Server is active ✔" });
});


// ─── GET all students ──────────────────────────────────────────
app.get("/students", async (req: Request, res: Response) => {

    // 1. Check if "students:all" key exists in Redis
    const cached = await redis.get("students:all");

    // 2. If found in cache → return it directly, skip the database
    if (cached) {
        console.log("✅ Cache HIT → returning from Redis");
        res.send(cached);
        return;
    }

    // 3. Not in cache → go fetch from PostgreSQL
    console.log("❌ Cache MISS → fetching from database");
    const result = await prisma.student.findMany({
        take: 3,
        orderBy: { age: "desc" }
    });

    // 4. Store result in Redis for 60 seconds so next request is faster
    await redis.set("students:all", result, { ex: 60 });

    res.send(result);
});


// ─── GET single student by ID ──────────────────────────────────
app.get("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    // 1. Each student gets their own cache key e.g. "student:1", "student:5"
    const cached = await redis.get(`student:${id}`);

    // 2. If found in cache → return it directly
    if (cached) {
        console.log(`✅ Cache HIT → student ${id} from Redis`);
        res.send(cached);
        return;
    }

    // 3. Not in cache → fetch from database
    console.log(`❌ Cache MISS → fetching student ${id} from database`);
    const result = await prisma.student.findUnique({
        where: { id: Number(id) }
    });

    // 4. Save in Redis for 60 seconds
    await redis.set(`student:${id}`, result, { ex: 60 });

    res.send(result);
});


// ─── POST create one student ───────────────────────────────────
app.post("/students", async (req: Request, res: Response) => {
    const studentData = req.body;
    const result = await prisma.student.create({ data: studentData });

    // New student added → delete "all students" cache so it refreshes next time
    await redis.del("students:all");

    res.send(result);
});


// ─── POST create many students ─────────────────────────────────
app.post("/students/startup", async (req: Request, res: Response) => {
    const studentData = req.body;
    const result = await prisma.student.createMany({ data: studentData });

    // Many students added → delete "all students" cache so it refreshes next time
    await redis.del("students:all");

    res.send(result);
});


// ─── PATCH update a student ────────────────────────────────────
app.patch("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentData = req.body;
    const result = await prisma.student.update({
        where: { id: Number(id) },
        data: studentData
    });

    // Student data changed → delete their individual cache
    await redis.del(`student:${id}`);

    // Also delete "all students" cache since it contains this student too
    await redis.del("students:all");

    res.send(result);
});


// ─── DELETE a student ──────────────────────────────────────────
app.delete("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await prisma.student.delete({
        where: { id: Number(id) }
    });

    // Student removed → delete their individual cache
    await redis.del(`student:${id}`);

    // Also delete "all students" cache since the list changed
    await redis.del("students:all");

    res.send(result);
});


app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});