const { Client } = require('discord.js');
const User = require('../models/user');
const { ownerid } = require('../config.json');

module.exports = {
  name: 'addbal',
  description: 'Add balance to a user',
  async execute(message, args) {
    const userMention = message.mentions.users.first();

    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (!userMention) {
      return message.reply('Please mention a user to add balance to.');
    }

    if (args.length < 2 || isNaN(args[1])) {
      return message.reply('Please provide a valid amount to add.');
    }

    const amountToAdd = parseFloat(args[1]);

    try {
      const user = await User.findOne({ discordId: userMention.id });

      if (!user) {
        return message.reply('User not found in the database.');
      }

      user.balance += amountToAdd;
      await user.save();

      return message.reply(`Added **${amountToAdd}** to ${userMention.tag}'s balance.\nNew balance: **${user.balance}**<:worldlock1:1152549532756885624>`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
