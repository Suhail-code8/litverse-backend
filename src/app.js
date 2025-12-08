const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require('dotenv').config();
const {register,login,refresh,logout} = require('./controllers/authController')
const authMiddleware = require('./middlewares/authMiddleware')
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URI,
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post('/register',register)
app.post('/login',login)
app.post('/logout',logout)
app.post('/refresh',refresh)


// sample protected route;
app.get('/protected',authMiddleware,(req,res)=>{
    res.status(200).json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
})

app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const state = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({ server: "ok", db: states[state] });
});

module.exports = app;
