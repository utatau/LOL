const Product = require('../models/product');
const { ownerid, prefix } = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'addproduct',
  description: 'Add a new product to the database',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length !== 5) {
      return message.reply(`Usage: ${prefix}addproduct <name> <code> <price> <type [yes, no ,df, "yes" if script, "no" if not, and "df" if dirtfarm]> <mention-role>`);
    }

    const [name, code, price, type, roleToadd] = args;

    try {
      const existingProduct = await Product.findOne({ code });

      if (existingProduct) {
        return message.reply('A product with this code already exists.');
      }

      const newProduct = new Product({
        name,
        code,
        price: parseFloat(price),
        stock: 0,
        variations: [],
        type,
        roleToadd: roleToadd.replace(/<@&|>/g, ''),
      });

      await newProduct.save();
      purchaseEmitter.emit('purchase');

      return message.reply('Product added successfully.');
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
