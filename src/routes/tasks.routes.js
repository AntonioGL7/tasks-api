const router = require("express").Router();

/**
 * GET /tasks
 * Devuelve una lista de tareas (por ahora, en memoria).
 */
const tasks = []; // "base de datos" temporal en memoria

router.get("/", (req, res) => {
  res.json(tasks);
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
