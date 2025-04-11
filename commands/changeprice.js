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
      return message.reply('masukan kode produk untuk mengubah harganya');
    }

    const code = args[0];
    const newPrice = parseFloat(args[1]);

    if (isNaN(newPrice) || newPrice <= 0) {
      return message.reply('masukin angka yang valid dong jangan 0 juga');
    }

    try {
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('produk ini gaada');
      }

      product.price = newPrice;
      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`harga produk dari kode **${code}** di ganti menjadi **${newPrice}**.`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
