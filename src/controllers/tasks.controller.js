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

async function listTasks(req, res, next) {
  let { page, limit } = req.query;

  page = page !== undefined ? Number(page) : undefined;
  limit = limit !== undefined ? Number(limit) : undefined;

  if (page !== undefined && (Number.isNaN(page) || page < 1)) {
    return res.status(400).json({ error: "page must be a positive number" });
  }

  if (limit !== undefined && (Number.isNaN(limit) || limit < 1)) {
    return res.status(400).json({ error: "limit must be a positive number" });
  }

  try {
    const tasks = await tasksService.listTasks({ page, limit });
    return res.json(tasks);
  } catch (err) {
    return next(err);
  }
}

async function createTask(req, res) {
  const { title, description } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      error: "title is required and must be a non-empty string",
    });
  }
  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ error: "description must be a string" });
    }
  }

  const newTask = await tasksService.createTask(title, description);
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

async function updateTask(req, res, next) {
  const taskId = parseId(req, res);
  if (!taskId) return;

  const { title, done, description } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "title must be a non-empty string" });
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ error: "description must be a string" });
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
      description: description !== undefined ? description.trim() : undefined,
    });

    return res.json(updated);
  } catch (err) {
    return next(err);
  }
}

async function deleteTask(req, res, next) {
  const taskId = parseId(req, res);
  if (!taskId) return;

  try {
    await tasksService.deleteTask(taskId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
