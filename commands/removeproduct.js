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
      return message.reply('masukan kode produk untuk di hapus');
    }

    const productCode = args[0];

    try {
      const product = await Product.findOne({ code: productCode });

      if (!product) {
        return message.reply('produk ini tidak di temukan');
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
            .setDescription(`berhasil menghapus produk **${productName}** dari database`),
        ],
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
