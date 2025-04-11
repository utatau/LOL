const OrderCount = require('../models/orderCount');
const { ownerid } = require('../config.json');
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'resetcount',
  description: 'Reset the order count',
  async execute(message, args) {
    if (!message.guild) {
      return message.reply('This command can only be used in a guild.');
    }

    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    try {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm Ban')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary),
        );

      const confirmationMessage = await message.reply({
        content: `Apakah Anda yakin ingin mengatur ulang jumlah pesanan?`,
        components: [row],
      });

      const filter = (interaction) => interaction.user.id === message.author.id;

      const buttonInteraction = await confirmationMessage.awaitMessageComponent({
        filter,
        time: 10000,
      });

      if (buttonInteraction.customId === 'confirm') {
        await OrderCount.findOneAndUpdate({}, { count: 0 }, { upsert: true });

        await buttonInteraction.update({
          content: 'Jumlah pesanan telah diatur ulang ke 0.',
          components: [],
        });
      } else if (buttonInteraction.customId === 'cancel') {
        await buttonInteraction.update({
          content: 'Pengaturan ulang jumlah pesanan telah dibatalkan.',
          components: [],
        });
      }
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong while resetting the order count.');
    }
  },
};