const Product = require('../models/product');
const User = require('../models/user');
const purchaseEmitter = require('../events/purchaseEmitter');
const fs = require('fs');
const mongoose = require('mongoose');
const { imageURL, wlEmoji, emoji1, emoji2, roleToadd } = require('../config.json');
const { buylogChannelId } = require('../config.json');
const OrderCount = require('../models/orderCount');
const { EmbedBuilder } = require('discord.js');

let orderCount = 0;

const getOrderCount = async () => {
  const orderCountDoc = await OrderCount.findOne();
  if (orderCountDoc) {
    return orderCountDoc.count;
  }
  return 0;
};

module.exports = {
  name: 'buy',
  description: 'Buy a random product',
  async execute(message, args) {
    if (!message.guild) {
      return message.reply('This command can only be used in a guild.');
    }

    if (!message.channel.name.startsWith('ticket-')) {
      return message.reply('This command can only be used in a ticket channel.');
    }

    if (args.length < 2) {
      return message.reply('Please provide both the code of the product and the quantity you want to buy.');
    }

    const productCode = args[0];
    const quantity = parseInt(args[1]);
    const discordId = message.author.id;

    const logChannel = message.guild.channels.cache.get(buylogChannelId);

    if (isNaN(quantity) || quantity <= 0) {
      return message.reply('Please provide a valid quantity greater than 0.');
    }
    try {
      let purchasedAccounts = [];
      const user = await User.findOne({ discordId });

      if (!user) {
        return message.reply('You need to set your GrowID using the `.set` command first.');
      }

      const product = await Product.findOne({ code: productCode });

      if (!product) {
        return message.reply('This product does not exist.');
      }

      if (!product.variations || product.variations.length === 0) {
        return message.reply('There are no product details available for this product.');
      }

      if (product.stock < quantity) {
        return message.reply(`There is not enough stock to purchase ${quantity} of this product.`);
      }

      const totalPrice = product.price * quantity;

      if (user.balance < totalPrice) {
        return message.reply('You do not have enough balance to purchase this quantity of the product.');
      }

      switch (product.type) {
        case 'yes':
          await handleYesType(user, message, product, quantity);
          break;

        case 'no':
          if (product.variations.length < quantity) {
            return message.reply(`There are only **${product.variations.length} ${product.name}** available for purchase.`);
          }
          purchasedAccounts = [];
          const randomIndexes = [];

          for (let i = 0; i < quantity; i++) {
            let randomIndex;
            do {
              randomIndex = Math.floor(Math.random() * product.variations.length);
            } while (randomIndexes.includes(randomIndex));

            randomIndexes.push(randomIndex);

            const selectedVariation = product.variations[randomIndex];
            purchasedAccounts.push(selectedVariation);
          }
          product.variations = product.variations.filter((_, index) => !purchasedAccounts.includes(product.variations[index]));

          product.stock -= quantity;

          await product.save();

          purchaseEmitter.emit('purchase');

          const detailsMessage = purchasedAccounts.join('\n');
          const fileName = `${user.growId}.txt`;

          fs.writeFileSync(fileName, detailsMessage);

          const embedDM = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Purchase Successful')
            .setDescription(`You have purchased **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
            .setImage(imageURL)
            .setTimestamp();
          await message.author.send({ embeds: [embedDM], files: [fileName] });

          fs.unlinkSync(fileName);
          break;

        case 'df':
          if (product.variations.length < quantity) {
            return message.reply(`There are only **${product.variations.length} ${product.name}** available for purchase.`);
          }
          purchasedAccounts = [];
          const randomIndexess = [];

          for (let i = 0; i < quantity; i++) {
            let randomIndex;
            do {
              randomIndex = Math.floor(Math.random() * product.variations.length);
            } while (randomIndexess.includes(randomIndex));

            randomIndexess.push(randomIndex);

            const selectedVariation = product.variations[randomIndex];
            purchasedAccounts.push(selectedVariation);
          }
          product.variations = product.variations.filter((_, index) => !purchasedAccounts.includes(product.variations[index]));

          product.stock -= quantity;

          await product.save();

          purchaseEmitter.emit('purchase');

          const detailssMessage = purchasedAccounts.join('\n\n\n');
          const fileNames = `${user.growId}.txt`;

          fs.writeFileSync(fileNames, detailssMessage);

          const embedDMs = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Purchase Successful')
            .setDescription(`You have purchased **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
            .setImage(imageURL)
            .setTimestamp();
          await message.author.send({ embeds: [embedDMs], files: [fileNames] });

          fs.unlinkSync(fileNames);
          break;
        case 'autosend':

          await autosendFunction(user, message, product, quantity);
          break;
        default:
          return message.reply('This product type is not supported.');
      }

      await product.save();

      user.balance -= totalPrice;
      await user.save();

      orderCount = await getOrderCount();

      orderCount++;

      await OrderCount.findOneAndUpdate({}, { count: orderCount }, { upsert: true });

      purchaseEmitter.emit('purchase');

      const roleToAdd = message.guild.roles.cache.get(product.roleToadd);

      if (roleToAdd) {
        await message.member.roles.add(roleToAdd);
      }

      const purchaseLogEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Order Number: **${orderCount}**`)
        .setDescription(`${emoji1} Buyer: <@${message.author.id}>
${emoji1} Product: **${product.name.replace(/"/g, '')}**
${emoji1} Code: **${product.code}**
${emoji1} Total Price: **${totalPrice}** ${wlEmoji}\n\n**Thanks For Purchasing Our Product(s)**`)
        .setImage(imageURL)
        .setTimestamp();

      if (logChannel) {
        logChannel.send({ embeds: [purchaseLogEmbed] });
      }

      const purchaseConfirmationEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Purchase Successful')
        .setDescription(`You have successfully purchased **${quantity} ${product.name}.** Please Check your DM!`)
        .setTimestamp();

      message.reply({ embeds: [purchaseConfirmationEmbed] })
        .then(() => {
          const delayBeforeDeletion = 10000;
          setTimeout(() => {
            if (message.channel) {
              message.channel.send(`This channel will be deleted in **${delayBeforeDeletion / 1000}** seconds. Please check your DM!`)
                .then(() => {
                  setTimeout(() => {
                    if (message.channel) {
                      message.channel.delete()
                        .catch(console.error);
                    }
                  }, delayBeforeDeletion);
                });
            }
          }, 1000);
        });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};


async function autosendFunction(user, message, product, quantity) {
}

async function handleYesType(user, message, product, quantity) {
  const totalPrice = product.price * quantity;

  const randomDetails = [];
  for (let i = 0; i < quantity; i++) {
    const randomIndex = Math.floor(Math.random() * product.variations.length);
    randomDetails.push(product.variations[randomIndex]);
  }



  product.stock -= quantity;

  await product.save();

  purchaseEmitter.emit('purchase');

  const detailsMessages = randomDetails.join('\n');
  const fileNames = `${user.growId}.txt`;

  fs.writeFileSync(fileNames, detailsMessages);

  const embedDMs = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Purchase Successful')
    .setDescription(`You have purchased **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
    .setImage(imageURL)
    .setTimestamp();
  await message.author.send({ embeds: [embedDMs], files: [fileNames] });

  fs.unlinkSync(fileNames);
}