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
      return message.reply('Usage: .add <code> [Upload a file or provide text]');
    }
    const code = args[0];
    const product = await Product.findOne({ code });
    if (!product) {
      return message.reply('Product not found.');
    }
    switch (product.type) {
      case 'df':
        return addDFTypeDetails(message, code, args.slice(1));
      case 'yes':
        return addYesTypeDetails(message, code, args.slice(1));
      case 'no':
        return addNoTypeDetails(message, code, args.slice(1));
      default:
        return message.reply('Invalid type. Supported types are df, yes, and no.');
    }
  },
};

async function addDFTypeDetails(message, code, details) {
  try {
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('Product not found.');
    }

    if (message.attachments.size === 1) {
      const attachment = message.attachments.first();
      const fileContents = await axios.get(attachment.url).then(response => response.data);

      product.variations.push(fileContents);
      product.stock++;
      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply('Details added/updated successfully for "df" type.');
    } else {
      if (details.length === 0) {
        return message.reply('Please provide text details or attach a .txt file for "df" type.');
      }

      const textDetails = details.join(' ');
      product.variations.push(textDetails);
      product.stock++;
      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply('Details added/updated successfully for "df" type.');
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('Something went wrong for "df" type.');
  }
}

async function addYesTypeDetails(message, code, details) {
  try {
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('Product not found.');
    }

    if (message.attachments.size === 1) {
      const attachment = message.attachments.first();
      const fileContents = await axios.get(attachment.url).then(response => response.data);

      product.variations.push(fileContents);
      product.stock++;
      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply('Details added/updated successfully for "script" type.');
    } else {
      if (details.length === 0) {
        return message.reply('Please provide text details or attach a .txt file for "script" type.');
      }

      const textDetails = details.join(' ');
      product.variations.push(textDetails);
      product.stock++;
      await product.save();
      purchaseEmitter.emit('purchase');

      return message.reply('Details added/updated successfully for "script" type.');
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('Something went wrong for "script" type.');
  }
}


async function addNoTypeDetails(message, code, details) {
  try {
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('Product not found.');
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

      return message.reply(`Added ${words.length} variations successfully for "no" type.`);
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('Something went wrong for "no" type.');
  }
}