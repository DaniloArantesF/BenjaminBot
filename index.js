const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const commands = require('./commands.js');


const client = new Discord.Client();
client.commands = new Discord.Collection();


for (const command of Object.keys(commands)) {
  console.log(commands[command])
	client.commands.set(commands[command].name, commands[command]);
}

client.once('ready', () => {
	console.log('Bot Running');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  
  console.log("Command: " + command);
  console.log("Args: " + args);

	if (command === 'salve') {
    client.commands.get('salve').execute(message, args);
    
	} else if (command === 'ytplay') {
    client.commands.get('ytplay').execute(message, args);
    
	}
});

client.login(token);


