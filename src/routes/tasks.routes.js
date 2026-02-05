const router = require("express").Router();

/**
 * "Base de datos" temporal en memoria
 */
const tasks = [];

/**
 * GET /tasks
 * Lista tareas
 */
router.get("/", (req, res) => {
  return res.json(tasks);
});

/**
 * POST /tasks
 * Crea una tarea
 */
router.post("/", (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      error: "title is required and must be a non-empty string",
    });
  }

  const newTask = {
    id: tasks.length + 1,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

/**
 * GET /tasks/:id
 * Devuelve una tarea por id
 */
router.get("/:id", (req, res) => {
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }

  return res.json(task);
});

/**
 * PUT /tasks/:id
 * Actualiza una tarea (title y/o done)
 */
router.put("/:id", (req, res) => {
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }

  const { title, done } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "title must be a non-empty string" });
    }
    task.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "done must be a boolean" });
    }
    task.done = done;
  }

  return res.json(task);
});

/**
 * DELETE /tasks/:id
 * Elimina una tarea por id
 */
router.delete("/:id", (req, res) => {
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const index = tasks.findIndex((t) => t.id === taskId);

  if (index === -1) {
    return res.status(404).json({ error: "task not found" });
  }

  tasks.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;
