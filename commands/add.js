// Import necessary libraries
const Product = require('../models/product');
const { ownerid } = require('../config.json');
const axios = require('axios');
const { AttachmentBuilder } = require('discord.js');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'add',
  description: 'Add product details to the database',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }
    if (args.length < 1) {
      return message.reply('Cara: .add <code> [upload file atau text]');
    }
    const code = args[0];
    const product = await Product.findOne({ code });
    if (!product) {
      return message.reply('produk ga ada');
    }
    switch (product.type) {
      case 'df':
        return addDFTypeDetails(message, code, args.slice(1));
      case 'yes':
        return addYesTypeDetails(message, code, args.slice(1));
      case 'no':
        return addNoTypeDetails(message, code, args.slice(1));
      default:
        return message.reply('hanya bisa type df, yes, and no.');
    }
  },
};

async function addDFTypeDetails(message, code, details) {
  try {
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('produk tidak ada');
    }

    if (message.attachments.size === 1) {
      const attachment = message.attachments.first();
      const fileContents = await axios.get(attachment.url).then(response => response.data);

      product.variations.push(fileContents);
      product.stock++;
      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply('berhasil menambahkan "df"');
    } else {
      if (details.length === 0) {
        return message.reply('Harap berikan rincian teks atau lampirkan file .txt untuk jenis "df".');
      }

      const textDetails = details.join(' ');
      product.variations.push(textDetails);
      product.stock++;
      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply('berhasil menambahkan untuk "df" type');
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('salah pada df type');
  }
}

async function addYesTypeDetails(message, code, details) {
  try {
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('produk tidak di temukan');
    }

    if (message.attachments.size === 1) {
      const attachment = message.attachments.first();
      const fileContents = await axios.get(attachment.url).then(response => response.data);

      product.variations.push(fileContents);
      product.stock++;
      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply('berhasil menambahkan untuk "script" type');
    } else {
      if (details.length === 0) {
        return message.reply('lampirkan detail berbentuk text atau .txt file untuk "script" type.');
      }

      const textDetails = details.join(' ');
      product.variations.push(textDetails);
      product.stock++;
      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply('berhasil menambahkan untuk "script" type.');
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('salah dari "script" type.');
  }
}


async function addNoTypeDetails(message, code, details) {
  try {
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('produk tidak di temukan');
    }

    if (message.attachments.size === 1) {
      const attachment = message.attachments.first();
      const fileContents = await axios.get(attachment.url).then(response => response.data);

      const lines = fileContents.split('\n');
      product.variations.push(...lines);

      product.stock += lines.length;

      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply(`Added ${lines.length} variations successfully for "no" type.`);
    } else {
      if (details.length === 0) {
        return message.reply('Please provide text details or attach a .txt file for "df" type.');
      }

      const words = details.join(' ').split(/\s+/);
      product.variations.push(...words);

      product.stock += words.length;

      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply(`berhasil menambahkan ${words.length} dengan "no" type.`);
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('Something went wrong for "no" type.');
  }
}