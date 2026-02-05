// src/services/tasks.service.js

const tasks = []; // almacenamiento en memoria

function listTasks() {
  return tasks;
}

function createTask(title) {
  const newTask = {
    id: tasks.length + 1,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  return newTask;
}

function getTaskById(id) {
  return tasks.find((t) => t.id === id) || null;
}

function updateTask(id, data) {
  const task = getTaskById(id);
  if (!task) return null;

  if (data.title !== undefined) task.title = data.title;
  if (data.done !== undefined) task.done = data.done;

  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  return true;
}

module.exports = {
  listTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
