const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");
const logAction = require("../utils/logAction");
const createCalendarEvent = require("../utils/createCalendarEvent");
const createMessage = require("../utils/createMessage");

const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// ===============================
// CREATE TASK (Manager Only)
// ===============================
router.post("/create",verifyToken, checkRole("manager"), async (req, res) => {
    try {
      const { title, description, assignedTo, deadline, priority } = req.body;

      const employee = await User.findById(assignedTo);

      if (!employee || employee.role !== "employee") {
        return res.status(400).json({
          msg: "Invalid employee selected",
        });
      }

      const task = await Task.create({
        title,
        description,
        assignedTo,
        assignedBy: req.user.id,
        deadline,
        priority,
      });

      await logAction({
        user: req.user,
        action: "CREATE_TASK",
        targetType: "task",
        targetId: task._id,
        description: `${req.user.name} created task "${task.title}"`
      });

      await createCalendarEvent(assignedTo, task);

      await createMessage({
        sender: req.user.name,
        receiver: assignedTo,
        type: "task",
        message: `You have been assigned a new task "${task.title}"`
      });

      res.json({
        msg: "Task Created Successfully",
        task,
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===============================
// GET TEAM TASKS (Manager)
// ===============================
router.get("/manager-tasks", verifyToken, checkRole("manager"), async (req, res) => {
    try {
      const tasks = await Task.find({
        assignedBy: req.user.id,
      })
        .populate("assignedTo", "name email");

      res.json(tasks);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===============================
// GET MY TASKS (Employee)
// ===============================
router.get("/my-tasks", verifyToken, checkRole("employee"), async (req, res) => {
    try {
      const tasks = await Task.find({
        assignedTo: req.user.id,
      });

      res.json(tasks);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET ALL TASKS (Admin Only)
router.get("/all", verifyToken, checkRole("admin"), async (req, res) => {
    const tasks = await Task.find()
      .populate("assignedTo", "name")
      .populate("assignedBy", "name");

    res.json(tasks);
  }
);

// ===============================
// UPDATE TASK STATUS (Employee)
// ===============================
router.patch("/update-status/:id", verifyToken, checkRole("employee"), async (req, res) => {
    try {
      const { status } = req.body;

      const task = await Task.findOne({
        _id: req.params.id,
        assignedTo: req.user.id, // ensures employee can only update their own task
      });

      if (!task) {
        return res.status(404).json({ msg: "Task not found" });
      }

      task.status = status;
      await task.save();

      await logAction({
        user: req.user,
        action: "UPDATE_TASK_STATUS",
        targetType: "task",
        targetId: task._id,
        description: `${req.user.name} changed status to ${status} of task "${task.title}"`
      });

      if(status === "Completed"){

        await createMessage({
          sender: req.user.name,
          receiver: req.user.id,
          type: "task",
          message: `You completed task "${task.title}"`
        });
      }

      res.json({ msg: "Status Updated", task });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===============================
// DELETE TASK (Manager & Admin)
// ===============================
router.delete(
  "/delete/:id",
  verifyToken,
  checkRole("manager", "admin"),
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ msg: "Task not found" });
      }

      // If manager → can delete only own tasks
      if (
        req.user.role === "manager" &&
        task.assignedBy.toString() !== req.user.id
      ) {
        return res.status(403).json({
          msg: "Not allowed to delete this task",
        });
      }

      await task.deleteOne();

      await logAction({
        user: req.user,
        action: "DELETE_TASK",
        targetType: "task",
        targetId: task._id,
        description: `${req.user.name} deleted task "${task.title}"`
      });

      await createMessage({
        sender: req.user.name,
        receiver: task.assignedTo,
        type: "task",
        message: `Task "${task.title}" assigned to you has been deleted`
      });

      res.json({ msg: "Task deleted successfully" });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;