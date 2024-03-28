const express = require("express");
const todoModel = require("../model/todoModel");
const { isAuth } = require("../middlewares/authMiddleware");
const todoRaouter = new express.Router();

todoRaouter
  .get("/all-todos", isAuth, async (req, res) => {
    try {
      const SKIP = Number(req.query.skip) || 0;
      const LIMIT = 3;
      const username = req.session.user.username;
      // const allTodos = await todoModel.find({ username: username });

      const allTodos = await todoModel.aggregate([
        { $match: { username: username } },
        {
          $facet: {
            data: [{ $skip: SKIP }, { $limit: LIMIT }],
          },
        },
      ]);
      console.log(allTodos);
      if (allTodos[0].data.length === 0) {
        return res.status(400).send({
          message: "No todo found",
        });
      }
      console.log(allTodos);
      res.status(200).send({
        message: `Success : No of todos found ${allTodos[0].data.length}`,
        data: allTodos[0].data,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  })
  .post("/create-todo", isAuth, async (req, res) => {
    try {
      const { task, priority } = req.body;
      const username = req.session.user.username;
      const newTodo = new todoModel({
        task,
        priority,
        username,
      });
      const savedTask = await newTodo.save();
      return res.status(201).send({
        data: savedTask,
        message: "task created successfully.",
      });
    } catch (error) {
      if (error.name === "ValidationError") res.status(400);
      else res.status(500);
      res.send({
        message: error.message,
      });
    }
  })
  .post("/edit-todo", isAuth, async (req, res) => {
    try {
      const { todoId, updatedTask, newPriority } = req.body;
      const username = req.session.user.username;
      const todoDb = await todoModel.findOne({ _id: todoId });
      if (todoDb.username !== username) {
        return res.status(403).send({
          message: "Not authorized to edit the todo.",
        });
      }

      const prevTodo = await todoModel.findOneAndUpdate(
        { _id: todoId },
        { task: updatedTask, priority: newPriority }
      );
      return res.status(200).send({
        message: "Edit success",
        data: prevTodo,
      });
    } catch (error) {
      if (error.name === "ValidationError") res.status(400);
      else res.status(500);
      res.send({
        error,
      });
    }
  })
  .post("/delete-todo", isAuth, async (req, res) => {
    try {
      const { todoId } = req.body;
      const username = req.session.user.username;
      const todoDb = await todoModel.findOne({ _id: todoId });
      console.log(todoDb);
      if (todoDb.username !== username) {
        return res.status(403).send({
          message: "Not authorized to delete this task.",
        });
      }

      const prevTodo = await todoModel.findOneAndDelete({ _id: todoId });
      return res.status(202).send({
        message: "Delete success.",
        data: prevTodo,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  });

module.exports = todoRaouter;
