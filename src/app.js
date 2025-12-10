const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require('dotenv').config();
const bookRoutes = require('./routes/bookRoutes')
const wishlistRoutes = require('./routes/wishlist')
const cartRoutes = require('./routes/cart')
const authRoutes = require('./routes/auth')
const healthController = require('./controllers/health')
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URI,
    credentials: true,
  })
);

app.use('/api/books',bookRoutes)
app.use('/api/wishlist',wishlistRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/auth',authRoutes)


app.get("/health",healthController);

module.exports = app;
