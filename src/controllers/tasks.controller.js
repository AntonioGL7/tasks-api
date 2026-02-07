// src/controllers/tasks.controller.js

const { Prisma } = require("@prisma/client");
const tasksService = require("../services/tasks.service");

function parseId(req, res) {
  const taskId = Number(req.params.id);
  if (Number.isNaN(taskId)) {
    res.status(400).json({ error: "id must be a number" });
    return null;
  }
  return taskId;
}

async function listTasks(req, res) {
  const tasks = await tasksService.listTasks();
  return res.json(tasks);
}

async function createTask(req, res) {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      error: "title is required and must be a non-empty string",
    });
  }

  const newTask = await tasksService.createTask(title);
  return res.status(201).json(newTask);
}

async function getTask(req, res) {
  const taskId = parseId(req, res);
  if (!taskId) return;

  const task = await tasksService.getTaskById(taskId);
  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }

  return res.json(task);
}

async function updateTask(req, res) {
  const taskId = parseId(req, res);
  if (!taskId) return;

  const { title, done } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "title must be a non-empty string" });
    }
  }

  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "done must be a boolean" });
    }
  }

  try {
    const updated = await tasksService.updateTask(taskId, {
      title: title !== undefined ? title.trim() : undefined,
      done,
    });

    return res.json(updated);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "task not found" });
    }
    throw err;
  }
}

async function deleteTask(req, res) {
  const taskId = parseId(req, res);
  if (!taskId) return;

  try {
    await tasksService.deleteTask(taskId);
    return res.status(204).send();
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "task not found" });
    }
    throw err;
  }
}

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
