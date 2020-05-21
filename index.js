const Discord = require("discord.js");
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

client.once("ready", () => {
  console.log("Client Connected");
});


client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

});

client.login(token);



