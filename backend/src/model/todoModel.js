const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

const todoModel = new mongoose.model("todo", todoSchema);
module.exports = todoModel;
