const mongoose = require('mongoose');

const SerialCounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 1 }
});

module.exports = mongoose.model('SerialCounter', SerialCounterSchema);
