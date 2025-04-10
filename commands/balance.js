const { Client, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const { wlEmoji, prefix } = require('../config.json');

module.exports = {
  name: 'bal',
  description: 'Check your balance',
  async execute(message, args) {
    try {
      const discordId = message.author.id;

      const user = await User.findOne({ discordId });

      if (!user) {
        return message.reply(`You need to set your GrowID using the **${prefix}set** command first.`);
      }

      const userBalance = user.balance;
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Your Balance in this server')
            .setDescription(`You have **${userBalance}** ${wlEmoji}`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
