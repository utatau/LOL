const User = require('../models/user');
const { ownerid } = require('../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removeuser',
  description: 'Remove a user from the database',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    const userMention = message.mentions.users.first();

    if (!userMention) {
      return message.reply('Please mention a user to remove from the database.');
    }

    try {
      const removedUser = await User.findOneAndRemove({ discordId: userMention.id });

      if (!removedUser) {
        return message.reply('User not found in the database.');
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`Removed ${userMention.tag} from the database.`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong while removing the user from the database.');
    }
  },
};
