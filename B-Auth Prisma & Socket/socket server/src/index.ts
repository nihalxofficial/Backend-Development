import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import prisma from './prisma';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;


app.get('/', async (req: Request, res: Response) => {
  res.json({"message": "Server is active ✅"});
});

app.get('/students', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


app.post('/students', async (req: Request, res: Response) => {
  const student = req.body;
  const user = await prisma.user.create({
    data: student,
  });
  res.json(user);
});

app.post('/students/startup', async (req: Request, res: Response) => {
  const student = req.body;
  const user = await prisma.user.createMany({
    data: student,
  });
  res.json(user);
});

app.patch('/students/:id', async (req: Request, res: Response) => {
  const {id} = req.params;
  const student = req.body;
  const user = await prisma.user.update({
    where: {id: String(id)},
    data: student,
  });
  res.json(user);
});

app.delete('/students/:id', async (req: Request, res: Response) => {
  const {id} = req.params;
  const user = await prisma.user.delete({
    where: {id: String(id)},
  });
  res.json(user);
});




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});