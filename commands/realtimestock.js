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
          console.log('save id pesan kedalam database:', previousMessageId);
        } catch (error) {
          console.error('gagal save id pesan ke dalam database:', error);
        }
      } else {
        console.log('produk tidak di temukan di database');
      }
    } catch (error) {
      console.error('gagal mengirim stok:', error);
    }

    purchaseEmitter.on('purchase', () => {
      try {
        sendStockMessage(message).then(async sentMessage => {
          if (sentMessage) {
            previousMessageId = sentMessage.id;

            try {
              await PreviousMessageId.findOneAndUpdate({}, { messageId: previousMessageId }, { upsert: true });
              console.log('save id pesan baru kedalam database:', previousMessageId);
            } catch (error) {
              console.error('gagal save id pesan baru ke dalam database:', error);
            }
          } else {
            console.log('produk tidak ditemukan di database.');
          }
        });
      } catch (error) {
        console.error('gagal mengirim pesan stok:', error);
      }
    });
  },
};
