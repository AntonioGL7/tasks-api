// src/routes/tasks.routes.js

const router = require("express").Router();
const tasksController = require("../controllers/tasks.controller");

router.get("/", tasksController.listTasks);
router.post("/", tasksController.createTask);

router.get("/:id", tasksController.getTask);
router.put("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);
router.patch("/:id/restore", tasksController.restoreTask);

module.exports = router;
