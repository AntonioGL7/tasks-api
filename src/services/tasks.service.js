// src/services/tasks.service.js
const prisma = require("../config/prisma");

async function listTasks({
  page,
  limit,
  done,
  sort = "id",
  order = "asc",
  search,
} = {}) {
  const where = {};

  if (done !== undefined) where.done = done;

  if (search !== undefined) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const query = {
    orderBy: { [sort]: order },
    ...(Object.keys(where).length ? { where } : {}),
  };

  if (done !== undefined) {
    query.where = { done };
  }

  if (page !== undefined && limit !== undefined) {
    query.skip = (page - 1) * limit;
    query.take = limit;
  }

  return prisma.task.findMany(query);
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
  await prisma.task.delete({ where: { id } });
  return true;
}

async function countTasks({ done, search } = {}) {
  const where = {};

  if (done !== undefined) where.done = done;

  if (search !== undefined) {
    where.title = { contains: search, mode: "insensitive" };
  }

  return prisma.task.count({
    ...(Object.keys(where).length ? { where } : {}),
  });
}

module.exports = {
  listTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  countTasks,
};
