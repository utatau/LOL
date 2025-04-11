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
      return message.reply('masukan kode saat ini dan masukan kode yang baru');
    }

    const currentCode = args[0];
    const newCode = args[1];

    if (!newCode) {
      return message.reply('masukan kode yang baru untuk sebuah produk');
    }

    try {
      const product = await Product.findOne({ code: currentCode });

      if (!product) {
        return message.reply('Produk dengan kode saat ini tidak ada.');
      }

      const existingProduct = await Product.findOne({ code: newCode });

      if (existingProduct) {
        return message.reply('kode yang anda input sudah di gunakan');
      }

      product.code = newCode;
      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`kode dari produk **${currentCode}** telah di ubah menjadi **${newCode}**.`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
