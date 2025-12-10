const healthController = (req, res) => {
  const mongoose = require("mongoose");
  const state = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({ server: "ok", db: states[state] });
}

module.exports = healthController