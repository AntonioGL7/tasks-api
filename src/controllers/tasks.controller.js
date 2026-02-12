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

function parseBoolQuery(res, value, fieldName) {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  res.status(400).json({ error: `${fieldName} must be true or false` });
  return null;
}

function parsePositiveIntQuery(res, value, fieldName) {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (Number.isNaN(n) || n < 1) {
    res.status(400).json({ error: `${fieldName} must be a positive number` });
    return null;
  }
  return n;
}

function parseDateQuery(res, value, fieldName) {
  if (value === undefined) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    res.status(400).json({ error: `${fieldName} must be a valid ISO date` });
    return null;
  }
  return d;
}

async function listTasks(req, res, next) {
  let {
    page,
    limit,
    done,
    sort,
    order,
    search,
    createdFrom,
    createdTo,
    includeDeleted,
    onlyDeleted,
  } = req.query;

  // page/limit
  page = parsePositiveIntQuery(res, page, "page");
  if (page === null) return;

  limit = parsePositiveIntQuery(res, limit, "limit");
  if (limit === null) return;

  // done/includeDeleted
  done = parseBoolQuery(res, done, "done");
  if (done === null) return;

  includeDeleted = parseBoolQuery(res, includeDeleted, "includeDeleted");
  if (includeDeleted === null) return;
  if (includeDeleted === undefined) includeDeleted = false;

  // onlyDeleted
  if (onlyDeleted !== undefined) {
    if (onlyDeleted === "true") onlyDeleted = true;
    else if (onlyDeleted === "false") onlyDeleted = false;
    else {
      return res
        .status(400)
        .json({ error: "onlyDeleted must be true or false" });
    }
  } else {
    onlyDeleted = false;
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

  // search
  if (search !== undefined) {
    if (typeof search !== "string") {
      return res.status(400).json({ error: "search must be a string" });
    }
    search = search.trim();
    if (search.length === 0) {
      return res.status(400).json({ error: "search cannot be empty" });
    }
  }

  // date range
  const fromDate = parseDateQuery(res, createdFrom, "createdFrom");
  if (fromDate === null) return;

  const toDate = parseDateQuery(res, createdTo, "createdTo");
  if (toDate === null) return;

  let createdAtRange;
  if (fromDate !== undefined || toDate !== undefined) {
    createdAtRange = {};
    if (fromDate !== undefined) createdAtRange.gte = fromDate;
    if (toDate !== undefined) createdAtRange.lte = toDate;
  }

  try {
    const tasks = await tasksService.listTasks({
      page,
      limit,
      done,
      sort,
      order,
      search,
      includeDeleted,
      onlyDeleted,
      createdAtRange,
    });

    // Compat: si no hay paginación -> array plano
    if (page === undefined || limit === undefined) {
      return res.json(tasks);
    }

    const total = await tasksService.countTasks({
      done,
      search,
      includeDeleted,
      onlyDeleted,
      createdAtRange,
    });

    const pages = Math.ceil(total / limit);

    return res.json({
      data: tasks,
      meta: { page, limit, total, pages },
    });
  } catch (err) {
    return next(err);
  }
}

async function createTask(req, res, next) {
  const { title, description } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      error: "title is required and must be a non-empty string",
    });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ error: "description must be a string" });
  }

  try {
    const newTask = await tasksService.createTask(title, description);
    return res.status(201).json(newTask);
  } catch (err) {
    return next(err);
  }
}

async function getTask(req, res, next) {
  const taskId = parseId(req, res);
  if (!taskId) return;

  try {
    const task = await tasksService.getTaskById(taskId);
    if (!task) return res.status(404).json({ error: "task not found" });

    // Si está borrada, por defecto no existe (a menos que includeDeleted=true)
    if (task.deletedAt && req.query.includeDeleted !== "true") {
      return res.status(404).json({ error: "task not found" });
    }

    return res.json(task);
  } catch (err) {
    return next(err);
  }
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
    // Prisma: registro no encontrado
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "task not found" });
    }
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
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "task not found" });
    }
    return next(err);
  }
}

async function restoreTask(req, res, next) {
  const taskId = parseId(req, res);
  if (!taskId) return;

  try {
    const restored = await tasksService.restoreTask(taskId);
    return res.json(restored);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return next(err);
  }
}

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  restoreTask,
};
