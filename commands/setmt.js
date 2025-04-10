const { ownerid } = require('../config.json');

let maintenanceMode = false;

module.exports = {
  name: 'setmt',
  description: 'Toggle maintenance mode for the bot.',
  execute(message, args) {
    if (message.author.id !== ownerid) {
      return message.reply('You do not have permission to use this command.');
    }
    maintenanceMode = !maintenanceMode;
    message.channel.send(`Maintenance mode is now ${maintenanceMode ? 'enabled' : 'disabled'}.`);
  },
  isMaintenanceModeEnabled: () => maintenanceMode,
};