const Product = require('../models/product');
const { ownerid } = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removeproduct',
  description: 'Remove a product and its stock',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }
    if (args.length < 1) {
      return message.reply('Please provide the product code to remove.');
    }

    const productCode = args[0];

    try {
      const product = await Product.findOne({ code: productCode });

      if (!product) {
        return message.reply('This product does not exist.');
      }

      const productName = product.name;

      await Product.deleteOne({ code: productCode });

      const remainingProducts = await Product.countDocuments();

      if (remainingProducts === 0) {
        purchaseEmitter.emit('noProductsLeft');
      } else {
        purchaseEmitter.emit('purchase');
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`Successfully removed the product **${productName}** from the database.`),
        ],
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
