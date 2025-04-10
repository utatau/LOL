const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  name: String,
  code: String,
  price: Number,
  stock: Number,
  type: String,
  variations: [String],
});

module.exports = mongoose.model('Script', scriptSchema);