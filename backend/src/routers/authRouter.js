const express = require("express");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const { isRegexEmail } = require("../utils/authUtils");
const { isAuth } = require("../middlewares/authMiddleware");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

const authRouter = new express.Router();
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
  .post("/logout", isAuth, (req, res) => {
    req.session.destroy((e) => {
      if (e) {
        res.status(500).send({
          message: "Logout failed.",
        });
      }
      return res.status(202).send({
        message: "Logout successfull.",
      });
    });
  })
  .post("/logout_from_all_devices", isAuth, async (req, res) => {
    try {
      const username = req.session.user.username;

      const sessionSchema = new mongoose.Schema(
        { _id: String },
        { strict: false }
      );
      const sessionModel = new mongoose.model("sessions", sessionSchema);

      const result = await sessionModel.deleteMany({
        "session.user.username": username,
      });
      res.status(200).send({ message: "Logout from all devices successfull" });
    } catch (error) {
      return res.status(500).send({
        error: error.message,
      });
    }
  });

module.exports = authRouter;
