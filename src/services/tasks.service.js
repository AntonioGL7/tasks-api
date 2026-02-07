// src/services/tasks.service.js

const prisma = require("../config/prisma");

async function listTasks() {
  return prisma.task.findMany({ orderBy: { id: "asc" } });
}

async function createTask(title) {
  return prisma.task.create({
    data: {
      title: title.trim(),
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
    },
  });
}

async function deleteTask(id) {
  await prisma.task.delete({ where: { id } });
  return true;
}

module.exports = {
  listTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
