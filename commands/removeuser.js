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
      return message.reply('tag user yang ingin data nya di hapus dari database');
    }

    try {
      const removedUser = await User.findOneAndRemove({ discordId: userMention.id });

      if (!removedUser) {
        return message.reply('user tidak di temukan di database');
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`menghapus ${userMention.tag} dari database.`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong while removing the user from the database.');
    }
  },
};
