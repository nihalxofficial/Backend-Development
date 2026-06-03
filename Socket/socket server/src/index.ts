import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import prisma from './prisma';
import cors from "cors";

import { Redis } from '@upstash/redis';

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;


const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST","PATCH","PUT", "DELETE"]
  }
});


io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.get('/ping', (req: Request, res: Response) => {
  res.send("pong");
});

app.get('/', async (req: Request, res: Response) => {
  res.json({ "message": "Server is active ✅" });
});

app.get('/customers', async (req: Request, res: Response) => {
  const customers = await prisma.customer.findMany();
  res.json(customers);
});


app.post('/customers', async (req: Request, res: Response) => {
  const customer = req.body;
  const result = await prisma.customer.create({
    data: customer,
  });
  res.json(result);
});

app.post('/customers/startup', async (req: Request, res: Response) => {
  const customers = req.body;
  const result = await prisma.customer.createMany({
    data: customers,
  });
  res.json(result);
});

app.get('/students', async (req: Request, res: Response) => {
  const cached = await redis.get("students:all");
    if (cached) {
        res.send(cached);
        return;
    }
  const students = await prisma.student.findMany({
    orderBy: { age: "asc" },
  });
  await redis.set("students:all", students, { ex: 60 });
  res.json(students);
});

app.get('/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const cached = await redis.get(`student:${id}`);
    if (cached) {
        res.send(cached);
        return;
    }
  const student = await prisma.student.findUnique({
    where: { id: String(id) }
  });
  await redis.set(`student:${id}`, student, { ex: 60 });
  res.json(student);
});

app.post('/students', async (req: Request, res: Response) => {
  const student = req.body;
  const result = await prisma.student.create({
    data: student,
  });
  await redis.del("students:all");
  await redis.del("students:analytics");
  await redis.del("students:top-students");

  io.emit("student-created", result);
  io.emit("dashboard-updated");
  res.json(result);
});


app.post('/students/startup', async (req: Request, res: Response) => {
  const students = req.body;
  const result = await prisma.student.createMany({
    data: students,
  });
  await redis.del("students:all");
  await redis.del("students:analytics");
  await redis.del("students:top-students");

  io.emit("students-created", result);
  io.emit("dashboard-updated");
  res.json(result);
});


app.patch('/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = req.body;
  const result = await prisma.student.update({
    where: { id: String(id) },
    data: student,
  });
  await redis.del("students:all");
  await redis.del(`student:${id}`);
  await redis.del("students:analytics");
  await redis.del("students:top-students");
  io.emit("student-updated", result);
  io.emit("dashboard-updated");
  res.json(result);
});

app.delete('/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await prisma.student.delete({
    where: { id: String(id) },
  });
  await redis.del("students:all");
  await redis.del(`student:${id}`);
  await redis.del("students:analytics");
  await redis.del("students:top-students");
  
  io.emit("student-deleted", result.id);
  io.emit("dashboard-updated");
  res.json(result);
});


app.get("/analytics", async (req: Request, res: Response) => {
  const cached = await redis.get("students:analytics");

    if (cached) {
        res.send(cached);
        return;
    }
  const [result] = await prisma.$queryRaw<{
    totalStudents: number;
    avgCgpa: number;
    topCgpa: number;
    avgAge: number;
  }[]>`
  SELECT
    COUNT(id)::int AS "totalStudents",
    ROUND(AVG(cgpa)::numeric, 2)::float AS "avgCgpa",
    MAX(cgpa) AS "topCgpa",
    ROUND(AVG(age)::numeric, 1)::float AS "avgAge"
  FROM "Student";
`
  await redis.set("students:analytics", result, { ex: 60 });
  res.send(result);
})

app.get("/top-students", async (req: Request, res: Response) => {
  const cached = await redis.get("students:top-students");
    if (cached) {
        res.send(cached);
        return;
    }
  const result = await prisma.$queryRaw<{
    name: string,
    department: string,
    age: number,
    cgpa: number
  }[]>
    `
  select
  name,
  dept as department,
  age::int,
  cgpa::float
  from "Student"
  where cgpa>=3.5
  order by cgpa desc;
  `
  await redis.set("students:top-students", result, { ex: 60 });
  res.json(result);
})



// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

httpServer.listen(PORT, () => {
  console.log(`Socket Server running on ${PORT}`);
});



const SERVER_URL = process.env.SERVER_URL ;

setInterval(() => {
  fetch(`${SERVER_URL}/ping`)
    .then(() => console.log("Keep-alive ping sent"))
    .catch((err) => console.error("Ping failed:", err));
}, 10 * 60 * 1000); // every 10 minutes