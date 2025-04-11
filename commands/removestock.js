const Product = require('../models/product');
const { ownerid } = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'removestock',
  description: 'Remove stock to an existing product',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 2) {
      return message.reply('Harap berikan kode produk dan jumlah stok yang ingin ditambahkan');
    }

    const code = args[0];
    const quantityToAdd = parseInt(args[1]);

    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return message.reply('harap berikan jumlah yang valid lebih besar dari 0');
    }

    try {
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('Produk tidak ditemukan. Pastikan untuk memberikan kode produk yang benar.');
      }

      product.stock -= quantityToAdd;

      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply(`stok berhasil di hapus`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
