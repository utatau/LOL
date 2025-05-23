const { EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const { wlEmoji, emoji2, emoji1, prefix } = require('../config.json');

module.exports = {
  name: 'info',
  description: 'Get your GrowID and balance information',
  async execute(message, args) {
    if (!message.guild) {
      return message.reply('This command can only be used in a guild.');
    }

    try {
      const discordId = message.author.id;
      const user = await User.findOne({ discordId });

      if (!user) {
        return message.reply(`You need to set your GrowID using the **${prefix}set** command first.`);
      }

      const depoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Account Information')
        .setDescription(`${emoji2}  GrowID: **${user.growId}**
${emoji1}  Balance: **${user.balance} ${wlEmoji}**`)

      return message.reply({ embeds: [depoEmbed] });

    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
