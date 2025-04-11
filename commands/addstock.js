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
      return message.reply('masukin kode dari produk dan jumlah yang ingin di masukan');
    }

    const code = args[0];
    const quantityToAdd = parseInt(args[1]);

    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return message.reply('masukan angka yang valid, jangan di bawah 0');
    }

    try {
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('produk tidak ditemukan, ketik kode yang benar');
      }

      product.stock += quantityToAdd;

      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply(`stok berhasil di tambahkan`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
