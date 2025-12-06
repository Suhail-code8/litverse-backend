require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await connectDB(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`server is running in port ${PORT}`);
    });
  } catch (err) {
    console.error("failed to start server : ", err);
    process.exit(1);
  }
})();

