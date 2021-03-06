/* Imports */
require('dotenv').config();
const Discord = require('discord.js');
const { prefix } = require('./config.json');
const commands = require('./commands.js');
const {queue} = require('./play');

/* Set client connection and Create command collection */
const client = new Discord.Client();
client.commands = new Discord.Collection();

/* Set up Collection of Commands */
for (const command of Object.keys(commands)) {
	client.commands.set(commands[command].name, commands[command]);
}

client.once('ready', () => {
	console.log("Bot Started.");
});

/* Message Handler */
client.on('message', message => {

	/* Mandar o Paulo tomar no cu */
	if (message.content.toLowerCase().startsWith("é nois")) {
		if (message.author.username != "paulo cesar") {
			message.channel.send(`${message.author} é nois pra caralhooo`);
		} else {
			message.channel.send(`${message.author} vai tomar no cu`);
		}
	}

	/* Check if message is valid command */
	if ( (!message.content.startsWith(prefix)) || (message.author.bot) ) {
		return;
	}

	/* Parse Command */
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	const serverQueue = queue.get(message.guild.id);

	/* User did not pass argument */
	if (!args[0] && command === 'play') {
		return message.reply('Sorry, I can\'t read minds. :thinking:\nPlease specify a song');
	}

	/* Handle Command */
	if (command === 'salve') {
      client.commands.get('salve').execute(message, args);
  } else if (command === 'help') {
		client.commands.get('help').execute(message);
	} else if (command === 'play') {
      args[0].startsWith('spotify') ? client.commands.get('spotify').execute(message, args, serverQueue) : client.commands.get('youtube').execute(message, args, serverQueue)
 	} else if (command === 'skip') {
		client.commands.get('skip').execute(message, serverQueue);
	} else if (command === 'queue') {
		client.commands.get('queue').execute(message, args, serverQueue);
	} else if (command === 'stop') {
		client.commands.get('stop').execute(message, serverQueue);
	} else if (command === 'leave') {
		client.commands.get('leave').execute(message, serverQueue);
	} else if (command === 'purge') {
		client.commands.get('purge').execute(message, args);
	} else if (command === 'roulette') {
		//client.commands.get('roulette').execute(message);
	}
});

/* Websocket and Network Errors */
client.on('shardError', error => {
	console.error('A websocket connection encountered an error', error);
});

/* API Errors */
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

/* Bot LogIn */
client.login(process.env.DISCORD_TOKEN);
