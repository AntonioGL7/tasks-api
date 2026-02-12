// src/services/tasks.service.js
const prisma = require("../config/prisma");

function buildWhere({
  done,
  search,
  includeDeleted,
  onlyDeleted,
  createdAtRange,
} = {}) {
  const where = {};

  // Soft delete
  if (onlyDeleted) {
    where.deletedAt = { not: null };
  } else if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (done !== undefined) {
    where.done = done;
  }

  if (search !== undefined) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (createdAtRange !== undefined) {
    where.createdAt = createdAtRange; // { gte?, lte? }
  }

  return where;
}

async function listTasks({
  page,
  limit,
  done,
  sort = "id",
  order = "asc",
  search,
  includeDeleted = false,
  onlyDeleted = false,
  createdAtRange,
} = {}) {
  const where = buildWhere({
    done,
    search,
    includeDeleted,
    onlyDeleted,
    createdAtRange,
  });

  const query = {
    where,
    orderBy: { [sort]: order },
  };

  if (page !== undefined && limit !== undefined) {
    query.skip = (page - 1) * limit;
    query.take = limit;
  }

  return prisma.task.findMany(query);
}

async function countTasks({
  done,
  search,
  includeDeleted = false,
  onlyDeleted = false,
  createdAtRange,
} = {}) {
  const where = buildWhere({
    done,
    search,
    includeDeleted,
    onlyDeleted,
    createdAtRange,
  });

  return prisma.task.count({ where });
}

async function createTask(title, description) {
  return prisma.task.create({
    data: {
      title: title.trim(),
      description: description !== undefined ? description.trim() : null,
      done: false,
    },
  });
}

async function getTaskById(id) {
  return prisma.task.findUnique({ where: { id } });
}

async function updateTask(id, data) {
  return prisma.task.update({
    where: { id },
    data: {
      title: data.title !== undefined ? data.title : undefined,
      done: data.done !== undefined ? data.done : undefined,
      description:
        data.description !== undefined ? data.description : undefined,
    },
  });
}

async function deleteTask(id) {
  await prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return true;
}

async function restoreTask(id) {
  const result = await prisma.task.updateMany({
    where: { id, deletedAt: { not: null } }, // solo si está borrada
    data: { deletedAt: null },
  });

  // No estaba borrada (o no existe)
  if (result.count === 0) {
    const existing = await prisma.task.findUnique({ where: { id } });

    // existe pero no está borrada
    if (existing) {
      const err = new Error("task is not deleted");
      err.statusCode = 409; // conflicto de estado (recomendado)
      throw err;
    }

    // no existe
    const err = new Error("task not found");
    err.statusCode = 404;
    throw err;
  }

  // Devuelve la task ya restaurada
  return prisma.task.findUnique({ where: { id } });
}

module.exports = {
  listTasks,
  countTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  restoreTask,
};
