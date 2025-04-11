const { Client } = require('discord.js');
const User = require('../models/user');
const { ownerid } = require('../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removebal',
  description: 'Remove balance from a user',
  async execute(message, args) {
    const userMention = message.mentions.users.first();

    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (!userMention) {
      return message.reply('tag orang yang mau di hapus saldonya');
    }

    if (args.length < 2 || isNaN(args[1])) {
      return message.reply('masukan jumlah yang valid');
    }

    const amountToRemove = parseFloat(args[1]);

    try {
      const user = await User.findOne({ discordId: userMention.id });

      if (!user) {
        return message.reply('data user gaada di dalam database');
      }

      if (user.balance < amountToRemove) {
        return message.reply(`user ${userMention.tag} tidak memiliki saldo yang cukup untuk menghapus ${amountToRemove}.`);
      }

      user.balance -= amountToRemove;
      await user.save();

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`menghapus **${amountToRemove}**<:worldlock1:1279417930521645070> dari ${userMention.tag}saldo.\nSaldo terkini: **${user.balance}**<:worldlock1:1279417930521645070>`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
