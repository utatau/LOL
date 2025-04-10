const { sendStockMessage } = require('../models/shared');
const purchaseEmitter = require('../events/purchaseEmitter');
const config = require('../config.json');
const mongoose = require('mongoose');

const PreviousMessageIdSchema = new mongoose.Schema({
  messageId: String,
});

const PreviousMessageId = mongoose.model('PreviousMessageId', PreviousMessageIdSchema);

module.exports = {
  name: 'realtime',
  description: 'Display real-time product stock information',
  async execute(message, args) {
    if (message.author.id !== config.ownerid && message.author.id !== config.yourBotId) {
      return message.reply('You do not have permission to use this command.');
    }

    let previousMessageId = null;
    try {
      const record = await PreviousMessageId.findOne();
      if (record) {
        previousMessageId = record.messageId;
        await message.channel.messages.fetch(previousMessageId).then(msg => {
          msg.delete();
          console.log('Previous stock message deleted.');
        });
      }
    } catch (error) {
      console.error('Error deleting previous message:', error);
    }

    try {
      const sentMessage = await sendStockMessage(message);
      if (sentMessage) {
        previousMessageId = sentMessage.id;

        try {
          await PreviousMessageId.findOneAndUpdate({}, { messageId: previousMessageId }, { upsert: true });
          console.log('Saved new message ID to database:', previousMessageId);
        } catch (error) {
          console.error('Error saving new message ID to database:', error);
        }
      } else {
        console.log('No products found in the database.');
      }
    } catch (error) {
      console.error('Error sending stock message:', error);
    }

    purchaseEmitter.on('purchase', () => {
      try {
        sendStockMessage(message).then(async sentMessage => {
          if (sentMessage) {
            previousMessageId = sentMessage.id;

            try {
              await PreviousMessageId.findOneAndUpdate({}, { messageId: previousMessageId }, { upsert: true });
              console.log('Saved new message ID to database:', previousMessageId);
            } catch (error) {
              console.error('Error saving new message ID to database:', error);
            }
          } else {
            console.log('No products found in the database.');
          }
        });
      } catch (error) {
        console.error('Error sending stock message:', error);
      }
    });
  },
};
