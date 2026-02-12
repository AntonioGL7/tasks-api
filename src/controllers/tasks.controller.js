// src/controllers/tasks.controller.js
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
  let { page, limit, done, sort, order, search } = req.query;

  // page/limit
  page = page !== undefined ? Number(page) : undefined;
  limit = limit !== undefined ? Number(limit) : undefined;

  if (page !== undefined && (Number.isNaN(page) || page < 1)) {
    return res.status(400).json({ error: "page must be a positive number" });
  }

  if (limit !== undefined && (Number.isNaN(limit) || limit < 1)) {
    return res.status(400).json({ error: "limit must be a positive number" });
  }

  // done filter
  if (done !== undefined) {
    if (done === "true") done = true;
    else if (done === "false") done = false;
    else return res.status(400).json({ error: "done must be true or false" });
  }

  // sort/order
  const allowedSort = new Set([
    "id",
    "title",
    "done",
    "createdAt",
    "updatedAt",
  ]);

  if (sort !== undefined) {
    if (!allowedSort.has(sort)) {
      return res.status(400).json({
        error: "sort must be one of: id, title, done, createdAt, updatedAt",
      });
    }
  } else {
    sort = "id";
  }

  if (order !== undefined) {
    if (order !== "asc" && order !== "desc") {
      return res.status(400).json({ error: "order must be asc or desc" });
    }
  } else {
    order = "asc";
  }

  if (search !== undefined) {
    if (typeof search !== "string") {
      return res.status(400).json({ error: "search must be a string" });
    }
    search = search.trim();
    if (search.length === 0) {
      return res.status(400).json({ error: "search cannot be empty" });
    }
  }

  try {
    const tasks = await tasksService.listTasks({
      page,
      limit,
      done,
      sort,
      order,
      search,
    });

    // Sin paginación: compatibilidad (devuelve array)
    if (page === undefined || limit === undefined) {
      return res.json(tasks);
    }

    const total = await tasksService.countTasks({ done, search });
    const pages = Math.ceil(total / limit);

    return res.json({
      data: tasks,
      meta: { page, limit, total, pages },
    });
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

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ error: "description must be a string" });
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

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ error: "description must be a string" });
  }

  if (done !== undefined && typeof done !== "boolean") {
    return res.status(400).json({ error: "done must be a boolean" });
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
