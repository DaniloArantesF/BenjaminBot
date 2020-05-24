/* Imports */
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const commands = require('./commands.js');
//const Queue = require('./queue.js');
const ytdl = require('ytdl-core');

/* Set client connection and Create command collection */
const client = new Discord.Client();
client.commands = new Discord.Collection();

/* Set up Collection of Commands */
console.log("Creating commands...")
for (const command of Object.keys(commands)) {
  	console.log(commands[command])
	client.commands.set(commands[command].name, commands[command]);
}

/* Create Queue Map for Songs */
const queue = new Map();

client.once('ready', () => {
	console.log('Bot Running');
});

/* Message Handler */
client.on('message', message => {

	/* Mandar o Paulo tomar no cu */
	if (message.content.startsWith("é nois")) {
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
  
	/* Handle Command */
	if (command === 'salve') {
    	client.commands.get('salve').execute(message, args);
	} else if (command === 'play') {
		execute(message, args, serverQueue)
	} else if (command === 'skip') {
		skip(message, serverQueue);
	} else if (command === 'stop') {
		stop(message, serverQueue);
	}
});

/* Youtube Request Handler */
async function execute(message, args, serverQueue) {
	const voiceChannel = message.member.voice.channel;

	/* User is not on voice channel */
	if (!voiceChannel) {
		return message.reply('Entra num canal de voz, né mongol.');
	}

	//var validate = ytdl.validateURL(args[0]);  //TODO: validate that this is a valid yt URL

	/* Get video information */
	const info = await ytdl.getInfo(args[0]);

	var song = {
		title: info.title,
		url: info.video_url,
	};

	console.log("Song Requested: " + song.url);

	/* Server Queue is empty */
	if (!serverQueue) {
		console.log("Server Queue is empty");
		console.log("Creating new Queue...");

		/* Define Queue Contract */ 
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		
		};
	
		/* Set new queue */
		queue.set(message.guild.id, queueContruct);
		queueContruct.songs.push(song);

		console.log("Server Queue:\n" + queueContruct.songs);

		/* Join Voice Channel */
		voiceChannel.join().then(connection => {
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		});

	} else { /* Queue is not empty */
		console.log("Adding song to queue")
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} foi adicionada à queue, seu merda!`);
	}
}


/* Play song */
function play(guild, song) {
    const serverQueue = queue.get(guild.id);

	/* No songs left on queue */
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
	}
	
	/* Create stream object from song url */
    const stream = ytdl(song.url, { filter: 'audioonly', 
                                                highWaterMark: 1<<25,           /* Stream was ending too soon. This seems to fix it :) https://bit.ly/2zXEZ4H */
                        });

    var dispatcher = serverQueue.connection.play(stream);
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Tocando: ${song.title}`);

    /* Current Song is Over */
    dispatcher.on('finish', () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
	});
	
	/* Error */
	dispatcher.on('error', error => console.log("Deu erro, caralho\n" + error));

}

/* Stop Execution */
function stop(message, serverQueue) {
  serverQueue.songs = [];
  message.channel.send("flw mens");
  serverQueue.connection.dispatcher.end();
 
}

/* Skip current song */
function skip(message, serverQueue) {
  if (!serverQueue) {
    message.channel.send("A queue ta vazia, mongol");
  }

  serverQueue.connection.dispatcher.end();
}



/* Bot LogIn */
client.login(token);
