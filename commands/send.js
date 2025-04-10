const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Product = require('../models/product');
const User = require('../models/user');
const OrderCount = require('../models/orderCount');
const purchaseEmitter = require('../events/purchaseEmitter');
const fs = require('fs');
const mongoose = require('mongoose');
const { imageURL, wlEmoji, emoji1, emoji2, roleToAdd, buylogChannelId, ownerid } = require('../config.json');

const getOrderCount = async () => {
  const orderCountDoc = await OrderCount.findOne();
  if (orderCountDoc) {
    return orderCountDoc.count;
  }
  return 0;
};

module.exports = {
  name: 'send',
  description: 'Send product details to a user',
  async execute(message, args) {
    if (!message.guild) {
      return message.reply('This command can only be used in a guild.');
    }

    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 3) {
      return message.reply('Usage: .send <user mention> <code> <amount>');
    }

    const userMention = message.mentions.users.first();
    const productCode = args[1];
    const quantity = parseInt(args[2]);

    if (!userMention) {
      return message.reply('Please provide a valid user mention.');
    }

    if (isNaN(quantity) || quantity <= 0) {
      return message.reply('Please provide a valid quantity greater than 0.');
    }

    try {
      const product = await Product.findOne({ code: productCode });

      if (!product) {
        return message.reply('This product does not exist.');
      }

      if (!product.variations || product.variations.length === 0) {
        return message.reply('There are no account details available for this product.');
      }

      if (product.stock < quantity) {
        return message.reply(`There is not enough stock to send ${quantity} of this product.`);
      }

      const totalPrice = product.price * quantity;

      if (product.type === 'yes') {
        const randomDetails = [];
        for (let i = 0; i < quantity; i++) {
          const randomIndex = Math.floor(Math.random() * product.variations.length);
          randomDetails.push(product.variations[randomIndex]);
        }
        product.stock -= quantity;
        await product.save();
        purchaseEmitter.emit('purchase');
        const detailsMessages = randomDetails.join('\n');
        const fileNames = `${product.name.replace(/ /g, '_')}_details.txt`;

        fs.writeFileSync(fileNames, detailsMessages);

        const embedDM = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Purchase Successful')
          .setDescription(`You have received **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice} ${wlEmoji}** from **${message.author.tag}**\n\n**Don't forget to give reps.**\n`)
          .setImage(imageURL)
          .setTimestamp();

        await userMention.send({ embeds: [embedDM], files: [fileNames] });

        fs.unlinkSync(fileNames);
      } else if (product.type === 'no') {
        const selectedDetails = [];
        for (let i = 0; i < quantity; i++) {
          const randomIndex = Math.floor(Math.random() * product.variations.length);
          const selectedVariation = product.variations.splice(randomIndex, 1)[0];
          selectedDetails.push(selectedVariation);
        }

        const detailsMessage = selectedDetails.join('\n');
        const fileName = `details.txt`;
        fs.writeFileSync(fileName, detailsMessage);

        product.stock -= quantity;

        await product.save();

        const embedDM = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Purchase Successful')
          .setDescription(`You have received **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice} ${wlEmoji}** from **${message.author.tag}**\n\n**Don't forget to give reps.**`)
          .setImage(imageURL)
          .setTimestamp();

        await userMention.send({ embeds: [embedDM], files: [fileName] });

        fs.unlinkSync(fileName);
      } else if (product.type === 'df') {
        const selectedVariations = [];
        for (let i = 0; i < quantity; i++) {
          const randomIndex = Math.floor(Math.random() * product.variations.length);
          selectedVariations.push(product.variations[randomIndex]);
        }

        product.variations = product.variations.filter((_, index) => !selectedVariations.includes(product.variations[index]));

        const combinedDetails = selectedVariations.join('\n\n\n');
        const fileName = `${product.name.replace(/ /g, '_')}_details.txt`;

        fs.writeFileSync(fileName, combinedDetails);

        product.stock -= quantity;

        await product.save();

        purchaseEmitter.emit('purchase');

        const embedDM = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Purchase Successful')
          .setDescription(`You have purchased **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n\n**Don't forget to give reps yak.**\n`)
          .setImage(imageURL)
          .setTimestamp();
        await message.author.send({ embeds: [embedDM], files: [fileName] });

        fs.unlinkSync(fileName);
      }

      const orderCount = await getOrderCount();

      await OrderCount.findOneAndUpdate({}, { count: orderCount + 1 }, { upsert: true });

      purchaseEmitter.emit('purchase');

      const role = message.guild.roles.cache.get(product.roleToAdd);
      if (role) {
        await message.guild.members.cache.get(userMention.id).roles.add(role);
      }

      const purchaseLogEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Order Number: **${orderCount + 1}**`)
        .setDescription(`${emoji1} Buyer: ${userMention}\n${emoji1} Sender: <@${message.author.id}>\n${emoji1} Product: **${product.name.replace(/"/g, '')}**\n${emoji1} Code: **${product.code}**\n${emoji1} Total Price: **${totalPrice}** ${wlEmoji}\n\n**Thanks For Purchasing Our Product(s)**`)
        .setTimestamp();

      const logChannel = message.guild.channels.cache.get(buylogChannelId);
      if (logChannel) {
        logChannel.send({ embeds: [purchaseLogEmbed] });
      }

      return message.reply(`Successfully sent ${quantity} **${product.name}** to ${userMention}.`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};