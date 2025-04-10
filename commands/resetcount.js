const OrderCount = require('../models/orderCount'); // Import the OrderCount mode
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
        content: `Are you sure you want to reset the order count?`,
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
          content: 'Order count has been reset to 0.',
          components: [],
        });
      } else if (buttonInteraction.customId === 'cancel') {
        await buttonInteraction.update({
          content: 'Order count reset has been canceled.',
          components: [],
        });
      }
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong while resetting the order count.');
    }
  },
};