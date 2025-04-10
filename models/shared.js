const { EmbedBuilder } = require('discord.js');
const Product = require('../models/product');
const { thumbnailURL, imageURL, wlEmoji, emoji1, emoji2 } = require('../config.json');

const sendStockMessage = async (message) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return message.reply('No products found in the database.');
    }

    const stockInfoEmbed = new EmbedBuilder()
      .setColor('#36393e')
      .setTitle('REALTIME STOCK\nUpdated every purchase')
      .setImage(imageURL)
      .setTimestamp()
      .setFooter({ text: 'DEN STORE' });

    products.forEach((product) => {
      stockInfoEmbed.addFields(
        {
          name: product.name.replace(/"/g, ''),
          value: `${emoji1}  Code: **${product.code}**\n${emoji1}  Stock: **${product.stock}**\n${emoji1}  Price: **${product.price}** ${wlEmoji}\n------------------------------------------\n`,
          inline: false,
        }
      );
    });

    let sentMessage;

    if (!message._editedMessage) {
      sentMessage = await message.channel.send({ embeds: [stockInfoEmbed] });
      message._editedMessage = sentMessage;
    } else {
      sentMessage = await message._editedMessage.edit({ embeds: [stockInfoEmbed] });
    }

    return sentMessage;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

module.exports = { sendStockMessage };
