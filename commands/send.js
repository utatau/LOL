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
      return message.reply('pake: .send <user mention> <kode> <jumlah>');
    }

    const userMention = message.mentions.users.first();
    const productCode = args[1];
    const quantity = parseInt(args[2]);

    if (!userMention) {
      return message.reply('tag user yang valid');
    }

    if (isNaN(quantity) || quantity <= 0) {
      return message.reply('masukan angka valid (lebih besar dari 0)');
    }

    try {
      const product = await Product.findOne({ code: productCode });

      if (!product) {
        return message.reply('produk tidak di temukan');
      }

      if (!product.variations || product.variations.length === 0) {
        return message.reply('Tidak ada rincian akun yang tersedia untuk produk ini.');
      }

      if (product.stock < quantity) {
        return message.reply(`Stok tidak cukup untuk dikirim ${quantity} dari produk ini`);
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
          .setTitle('pembelian sukses')
          .setDescription(`anda menerima **${quantity} ${product.name.replace(/"/g, '')}** sejumlah **${totalPrice} ${wlEmoji}** dari **${message.author.tag}**\n\n**JANGAN LUPA REPS YAK**\n`)
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
          .setTitle('pembelian sukses')
          .setDescription(`anda menerima **${quantity} ${product.name.replace(/"/g, '')}** sebesar **${totalPrice} ${wlEmoji}** dari **${message.author.tag}**\n\n**JANGAN LUPA REPS YAK**`)
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
          .setTitle('pembelian sukses')
          .setDescription(`anda telah membeli **${quantity} ${product.name.replace(/"/g, '')}** sebesar **${totalPrice}${wlEmoji}**\n\n**JANGAN LUPA REPS YAK**\n`)
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
        .setTitle(`nomor orderan: **${orderCount + 1}**`)
        .setDescription(`${emoji1} pembeli: ${userMention}\n${emoji1} pengirim: <@${message.author.id}>\n${emoji1} produk: **${product.name.replace(/"/g, '')}**\n${emoji1} kode: **${product.code}**\n${emoji1} total harga: **${totalPrice}** ${wlEmoji}\n\n**TERIMAKASIH TELAH MEMBELI PRODUK KAMI**`)
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