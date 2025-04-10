const Product = require('../models/product');
const { ownerid } = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'addstock',
  description: 'Add stock to an existing product',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 2) {
      return message.reply('Please provide the product code and the quantity of stock to add.');
    }

    const code = args[0];
    const quantityToAdd = parseInt(args[1]);

    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return message.reply('Please provide a valid quantity greater than 0.');
    }

    try {
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('Product not found. Make sure to provide the correct product code.');
      }

      product.stock += quantityToAdd;

      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply(`Stock Added successfully.`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
