const { Client, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const { wlEmoji } = require('../config.json');

module.exports = {
  name: 'checkbal',
  description: 'Check the balance of a user',
  async execute(message, args) {
    const userMention = message.mentions.users.first();

    if (!userMention) {
      return message.reply('tag orangnya buat ngecek saldo');
    }

    try {
      const user = await User.findOne({ discordId: userMention.id });

      if (!user) {
        return message.reply('user gaada dalam database');
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${userMention.tag}'saldo di dalam server`)
            .setDescription(`**${userMention.tag}** adalah **${user.balance}** World lock ${wlEmoji}`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
