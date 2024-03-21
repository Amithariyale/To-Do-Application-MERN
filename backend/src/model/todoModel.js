const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
    minLength: [5, "Min length should be 5 characters"],
    maxLength: [100, "Max length should be 100 characters"],
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
