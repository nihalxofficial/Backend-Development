import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import prisma from './prisma';
import cors from "cors";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
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
  const students = await prisma.student.findMany({
    orderBy: { age: "asc" },
  });
  res.json(students);
});

app.get('/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const students = await prisma.student.findUnique({
    where: { id: String(id) }
  });
  res.json(students);
});

app.post('/students', async (req: Request, res: Response) => {
  const student = req.body;
  const result = await prisma.student.create({
    data: student,
  });
  io.emit("student-created", result);
  io.emit("dashboard-updated");
  res.json(result);
});


app.post('/students/startup', async (req: Request, res: Response) => {
  const students = req.body;
  const result = await prisma.student.createMany({
    data: students,
  });
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
  io.emit("student-updated", result);
  io.emit("dashboard-updated");
  res.json(result);
});

app.delete('/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await prisma.student.delete({
    where: { id: String(id) },
  });
  io.emit("student-deleted", result.id);
  io.emit("dashboard-updated");
  res.json(result);
});


app.get("/analytics", async (req: Request, res: Response) => {
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
  // io.emit("student-analytics-updated", result);
  res.send(result);
})

app.get("/top-students", async (req: Request, res: Response) => {
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
  // io.emit("top-students-updated", result);
  res.json(result);
})



// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

httpServer.listen(PORT, () => {
  console.log(`Socket Server running on ${PORT}`);
});