const Product = require('../models/product');
const { ownerid } = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'changeprice',
  description: 'Change the price of a product',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 2) {
      return message.reply('Please provide a product code and the new price.');
    }

    const code = args[0];
    const newPrice = parseFloat(args[1]);

    if (isNaN(newPrice) || newPrice <= 0) {
      return message.reply('Please provide a valid price greater than 0.');
    }

    try {
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('This product does not exist.');
      }

      product.price = newPrice;
      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`The price of product **${code}** has been changed to **${newPrice}**.`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
