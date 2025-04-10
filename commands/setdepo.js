const Depo = require('../models/depo');
const { ownerid } = require('../config.json')

module.exports = {
  name: 'setdepo',
  description: 'Set the depo world and bot name',
  async execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length !== 3) {
      return message.reply('Usage: .setdepo <world> <owner> <botname>');
    }

    const depoWorld = args[0];
    const worldOwner = args[1];
    const botName = args[2];
    try {
      await Depo.findOneAndUpdate({}, { depoWorld, botName, worldOwner }, { upsert: true });

      return message.reply('Depo information has been set.');
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
