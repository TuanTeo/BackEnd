const express = require("express");
const Router = express.Router();
const userRouter = require("./userRoutes")
Router.use("/", userRouter)
module.exports = Router