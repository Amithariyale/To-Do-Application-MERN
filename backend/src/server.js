const express = require("express");
const authRouter = require("./routers/authRouter");
const cors = require("cors");
const session = require("express-session");
const todoRaouter = require("./routers/todoRouter");
const mongoDbSession = require("connect-mongodb-session")(session);

require("./db/connect");
require("dotenv").config();

const PORT = process.env.PORT;
const app = express();
const store = new mongoDbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(authRouter);
app.use(todoRaouter)

app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});
