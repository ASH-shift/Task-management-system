import { Router } from "express";
import prisma from "../prisma";
import { auth } from "../middleware/auth";

const router = Router();

/* GET ALL TASKS (USER-SCOPED) */
router.get("/", auth, async (req: any, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.user.id }
  });
  res.json(tasks);
});

/* CREATE TASK */
router.post("/", auth, async (req: any, res) => {
  const { title } = req.body;

  if (!title)
    return res.status(400).json({ message: "Title is required" });

  const task = await prisma.task.create({
    data: {
      title,
      userId: req.user.id
    }
  });

  res.status(201).json(task);
});

/* TOGGLE TASK (CORRECT WAY) */
router.patch("/:id/toggle", auth, async (req: any, res) => {
  const id = Number(req.params.id);

  // 1️⃣ Find task first
  const existingTask = await prisma.task.findUnique({
    where: { id }
  });

  // 2️⃣ Ownership check
  if (!existingTask || existingTask.userId !== req.user.id) {
    return res.status(404).json({ message: "Task not found" });
  }

  // 3️⃣ Toggle correctly
  const updatedTask = await prisma.task.update({
    where: { id },
    data: { completed: !existingTask.completed }
  });

  res.json(updatedTask);
});

export default router;
