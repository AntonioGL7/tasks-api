// src/controllers/tasks.controller.js

const tasksService = require("../services/tasks.service");

function listTasks(req, res) {
  return res.json(tasksService.listTasks());
}

function createTask(req, res) {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      error: "title is required and must be a non-empty string",
    });
  }

  const newTask = tasksService.createTask(title);
  return res.status(201).json(newTask);
}

function getTask(req, res) {
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const task = tasksService.getTaskById(taskId);
  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }

  return res.json(task);
}

function updateTask(req, res) {
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: "id must be a number" });
  }

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

  const updated = tasksService.updateTask(taskId, {
    title: title !== undefined ? title.trim() : undefined,
    done,
  });

  if (!updated) {
    return res.status(404).json({ error: "task not found" });
  }

  return res.json(updated);
}

function deleteTask(req, res) {
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const deleted = tasksService.deleteTask(taskId);
  if (!deleted) {
    return res.status(404).json({ error: "task not found" });
  }

  return res.status(204).send();
}

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
