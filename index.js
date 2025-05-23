const { Client, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');
const { keep_alive } = require("./keep_alive");
const fs = require('fs');
const { prefix, token, stockChannelId, yourBotId, mongoURI, ownerid } = require('./config.json');
const Discord = require('discord.js');
const { isMaintenanceModeEnabled } = require('./commands/setmt');

var http = require('http');
http.createServer(function (req, res) {
  res.write("I'm alive");
  res.end();
}).listen(8080);


mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB.');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({ activities: [{ name: `${prefix}help for help` }], status: 'online' });

  const stockChannel = client.channels.cache.get(stockChannelId);
  if (stockChannel) {
    stockChannel.send(`${prefix}realtime`)
      .then(() => {
        console.log('Initial stock message sent.');
      })
      .catch(error => {
        console.error('Error sending initial stock message:', error);
      });
  } else {
    console.error('Stock channel not found.');
  }
});

client.on('messageCreate', async (message) => {
  if (!message.guild) {
    return;
  }
  if (message.author.bot && message.author.id !== yourBotId) {
    return;
  }

  if (!message.content.startsWith(prefix)) return;
  if (client.commands.has('setmaintenance') || !isMaintenanceModeEnabled()) {



    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      command.execute(message, args, client);
    } catch (error) {
      console.error('Error jing:', error);
      message.reply('There was an error executing the command.');
    }

    if (message.author.id === yourBotId && message.content.startsWith(`${prefix}realtime bos`)) {
      message.delete().catch(console.error);
    }
  } else {
    message.reply('Sorry, the bot is currently in maintenance mode and cannot be used.');
  }
});


client.login(token);
