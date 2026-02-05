const router = require("express").Router();

/**
 * GET /tasks
 * Devuelve una lista de tareas (por ahora, en memoria).
 */
const tasks = []; // "base de datos" temporal en memoria

/**
 * GET /tasks/:id
 * Devuelve una tarea por su id
 */
router.get("/:id", (req, res) => {
  const { id } = req.params; // viene como string
  const taskId = Number(id); // lo convertimos a número

  // Si no es un número, el cliente ha enviado mal la URL
  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  // Buscamos la tarea en la "BD" en memoria
  const task = tasks.find((t) => t.id === taskId);

  // Si no existe, es un recurso inexistente
  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }

  // Si existe, devolvemos la tarea
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

  // Validación: si viene title, debe ser string no vacío
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({
        error: "title must be a non-empty string",
      });
    }
    task.title = title.trim();
  }

  // Validación: si viene done, debe ser boolean
  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({
        error: "done must be a boolean",
      });
    }
    task.done = done;
  }

  return res.json(task);
});

/**
 * POST /tasks
 * Crea una tarea nueva.
 */
router.post("/", (req, res) => {
  const { title } = req.body;

  // Validación mínima
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

  // 201 = creado correctamente
  return res.status(201).json(newTask);
});

module.exports = router;
