// changecode.js

const Product = require('../models/product');
const { ownerid } = require('../config.json');
const { EmbedBuilder } = require('discord.js');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'changecode',
  description: 'Change the code of a product',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 2) {
      return message.reply('Please provide the current product code and the new code.');
    }

    const currentCode = args[0];
    const newCode = args[1];

    if (!newCode) {
      return message.reply('Please provide a new code for the product.');
    }

    try {
      const product = await Product.findOne({ code: currentCode });

      if (!product) {
        return message.reply('The product with the current code does not exist.');
      }

      const existingProduct = await Product.findOne({ code: newCode });

      if (existingProduct) {
        return message.reply('A product with the new code already exists.');
      }

      product.code = newCode;
      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`The code of product **${currentCode}** has been changed to **${newCode}**.`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
