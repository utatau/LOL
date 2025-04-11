const { EmbedBuilder } = require('discord.js');
const Product = require('../models/product');
const { ownerid } = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'changename',
  description: 'mengganti nama produk',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 2) {
      return message.reply('masukan kode produk dan nama baru untuk produk');
    }

    const code = args[0];
    const newName = args.slice(1).join(' ');

    if (!newName) {
      return message.reply('masukan nama baru untuk produk');
    }

    try {
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('produk tidak ada');
      }

      product.name = newName;
      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`nama produk dari kode **${code}** di ganti menjadi **${newName}**.`)
        ]
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
