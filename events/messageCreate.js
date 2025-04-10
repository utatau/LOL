const User = require('../models/user');
const { wlEmoji, desiredChannelId, specificUserId } = require('../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  once: false,
  execute: async (message, client) => {
    if (message.author.id === specificUserId && message.channel.id === desiredChannelId) {
      const description = message.embeds[0].description;
      const growIDMatch = description.match(/GrowID: (\w+)/);
      const depositMatch = description.match(/Deposit: (\d+) (.*)/);

      if (growIDMatch && depositMatch) {
        const growID = growIDMatch[1];
        const depositAmount = parseInt(depositMatch[1]);
        const itemName = depositMatch[2];

        try {
          const itemValues = {
            "World Lock": 1,
            "Diamond Lock": 100,
            "Blue Gem Lock": 10000,
          };

          let user = await User.findOne({ growId: new RegExp(`^${growID}$`, 'i') });

          if (user) {
            if (itemValues[itemName]) {
              user.balance += depositAmount * itemValues[itemName];
              await user.save();

              message.reply(`Successfully Adding **${depositAmount}** **${itemName}** to **${growID}**\nYour new balance is **${user.balance}** ${wlEmoji}`);

              console.log(`Sent a success message: Successfully updated ${growID}'s balance by ${depositAmount} ${itemName}.`);
            } else {
              message.reply(`Unknown item name: ${itemName}`);
              console.log('Unknown item name');
            }
          } else {
            message.reply(`You are not registered. Please set your GrowID first.`);
            console.log('Not Registered');
          }
        } catch (error) {
          console.error('Error:', error);
          message.reply('Something went wrong.');
        }
      }
    }
  },
};