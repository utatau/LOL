const { Client, EmbedBuilder } = require('discord.js');
const Product = require('../models/product');
const { stockChannelId } = require('../config.json');

module.exports = {
  name: 'stock',
  description: 'Display product stock information',
  async execute(message, args) {
    try {
      const products = await Product.find();

      if (products.length === 0) {
        return message.reply('No products found in the database.');
      }

      const stockInfoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setDescription(`You can see the current stock in <#${stockChannelId}> `)

      message.reply({ embeds: [stockInfoEmbed] });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
