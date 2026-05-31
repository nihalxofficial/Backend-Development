import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import prisma from './prisma';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", async (req: Request, res: Response) => {
    res.json({ "message": "Server is active ✔" })
})


app.get("/students", async (req: Request, res: Response) => {
    const result = await prisma.student.findMany({
        take: 3,
        orderBy:{
            age: "desc"
        }
    });
    res.send(result);
})


app.get("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await prisma.student.findUnique({
        where: { id: Number(id) }
    });
    res.send(result);
})

app.post("/students", async (req: Request, res: Response) => {
    const studentData = req.body;
    const result = await prisma.student.create({ data: studentData });
    res.send(result);
})


app.post("/students/startup", async (req: Request, res: Response) => {
    const studentData = req.body;
    const result = await prisma.student.createMany({
        data: studentData
    });
    res.send(result);
})

app.patch("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentData = req.body;
    const result = await prisma.student.update({
        where: { id: Number(id) },
        data: studentData
    });
    res.send(result);
})

app.delete("/students/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await prisma.student.delete({
        where: { id: Number(id) }
    });
    res.send(result);
})


app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});