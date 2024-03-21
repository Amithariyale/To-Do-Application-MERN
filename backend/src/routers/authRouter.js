const express = require("express");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const { isRegexEmail } = require("../utils/authUtils");
const { isAuth } = require("../middlewares/authMiddleware");
const authRouter = new express.Router();
require("dotenv").config();

authRouter
  .post("/signup", async (req, res) => {
    const { name, email, username, password, cpassword } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(
        password,
        parseInt(process.env.SALT)
      );
      console.log(hashedPassword);
      const newUser = new userModel({
        name,
        email,
        username,
        password: hashedPassword,
      });
      const savedUser = await newUser.save();
      res.send({
        status: 201,
        message: "User signed up successfully.",
      });
    } catch (error) {
      res.send({
        status: 500,
        message: "Sign up failed, please check the details.",
        error: error.message,
      });
    }
  })
  .post("/login", async (req, res) => {
    // res.send("this is login api");
    try {
      const { loginId, password } = req.body;
      // console.log(loginId, password);
      if (!loginId || !password)
        return res.status(400).json("Incomplete credentials.");

      let userDb;
      if (isRegexEmail({ email: loginId })) {
        userDb = await userModel.findOne({ email: loginId });
      } else {
        userDb = await userModel.findOne({ username: loginId });
      }

      // console.log(userDb);
      if (!userDb) return res.status(400).json("No user found.");

      const isPasswordMatch = await bcrypt.compare(password, userDb.password);

      if (!isPasswordMatch)
        return res.status(400).json("Incorrect credentials.");

      req.session.isAuth = true;
      req.session.user = {
        userId: userDb._id,
        email: userDb.email,
        username: userDb.username,
      };

      return res.status(200).send("Login successfull.");
    } catch (error) {
      return res.status(500).send(error.message);
    }
  })
  .get("/dashboard", isAuth, async (req, res) => {
    // return res.send("hiii");
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
      return res.status(500).send({
        message: "internal server error",
        error,
      });
    }
  });

module.exports = authRouter;
