const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
  year: { type: String, required: true },
});

module.exports = mongoose.model("Counter", counterSchema);
