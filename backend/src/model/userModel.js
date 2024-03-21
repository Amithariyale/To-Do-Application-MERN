const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email already exist"],
    validator(v) {
      if (!validator.isEmail(v)) {
        throw new Error("Invalid email");
      }
    },
  },
  username: {
    type: String,
    required: true,
    unique: [true, "usename already exist"],
  },
  password: {
    type: String,
    required: true,
  },
});

const userModel = new mongoose.model("user", userSchema);

module.exports = userModel;
