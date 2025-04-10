const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: String,
  discordTag: String,
  growId: String,
  createdAt: Date,
  balance: Number
});

module.exports = mongoose.model('User', userSchema);