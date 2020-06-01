/* Imports */
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const axios = require('axios');
const { prefix, token } = require('./config.json');
const commands = require('./commands.js');
const querystring = require('querystring');
const ytdl = require('ytdl-core');
const {google} = require('googleapis');
const qs = require('qs');

// initialize the Youtube API library
const youtube = google.youtube({version: 'v3', auth: process.env.APIKEY});


/* Following Client Authentication Flow, the credentials must be base64 encoded. 
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow
 * Using url-encoded http requests: https://github.com/axios/axios#using-applicationx-www-form-urlencoded-format
 */

var encoded_credentials = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_SECRET).toString('base64');
var spotifyToken = '';

axios({ method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: qs.stringify({ grant_type: 'client_credentials' }),
        headers: {
        'Authorization': 'Basic ' + encoded_credentials,
        'Content-Type':'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        spotifyToken = response.data.access_token;
    }).catch(function (error) {
        console.log(error.message);
    });

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
	if (message.content.toLowerCase().startsWith("é nois")) {
		if (message.author.username != "paulo cesar") {
			message.channel.send(`${message.author} é nois pra caralhooo`);
		} else {
			message.channel.send(`${message.author} vai tomar no cu`);
		}
	}

	if (message.content.startsWith("-play")) {
		message.channel.send(`${message.author} Tomara que morra no inferno, judas do caralho.`);
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
    if (args[0].startsWith('spotify')) {
      playSpotify(message, args, serverQueue);
    } else {
		  execute(message, args, serverQueue)
    }
 	} else if (command === 'skip') {
		skip(message, serverQueue);
	} else if (command === 'stop') {
		stop(message, serverQueue);
	} else if (command === 'leave') {
		leave(message, serverQueue);
	}
});

/* Youtube Request Handler */
async function execute(message, args, serverQueue) {
	const voiceChannel = message.member.voice.channel;

	/* User is not on voice channel */
	if (!voiceChannel) {
		return message.reply('Entra num canal de voz, né mongol.');
	}

	/* User did not pass argument */
	if (!args[0]) {
		return message.reply('tô com cara de mãe dináh, seu merda?');
	}


	/* TODO: Validate input for malicious and non-related urls */
	var validate = ytdl.validateURL(args[0]);

	if (!validate) {
		var query = args.toString().replace(/,/g, " ");

  	var search = await youtube.search.list({part:'snippet', q: query, maxResults: 1});
  	var url = "https://www.youtube.com/watch?v=" + search.data.items[0].id.videoId;

	}else {
		var url = args[0];
	}

	/* Get video information */
	const info = await ytdl.getInfo(url);

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
		
      		//serverQueue.voiceChannel.leave();
      		queue.delete(guild.id);
      		return;
	}
	
	/* Create stream object from song url */
    const stream = ytdl(song.url, { filter: 'audioonly', 
                                                highWaterMark: 1<<25,           /* Stream was ending too soon. This seems to fix it :) https://bit.ly/2zXEZ4H */
                        });

    var dispatcher = serverQueue.connection.play(stream);
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`${song.title}`);

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

/* Leave Channel */
function leave(message, serverQueue) {
  serverQueue.songs = [];
  message.channel.send("flw mens");
  serverQueue.connection.dispatcher.end();
  serverQueue.voiceChannel.leave();

}

async function playSpotify(message, uri, serverQueue) {
  uri = uri[0];
  var playlist_Id = uri.substring(uri.lastIndexOf(':') + 1, uri.length);

  //var songs = [];
  songs = await getSpotifyPlaylist(message, playlist_Id, serverQueue);
  //console.log(songs);

}

async function getSpotifyPlaylist(message, playlist_Id, serverQueue) { 
  
  const voiceChannel = message.member.voice.channel;
  var url = 'https://api.spotify.com/v1/playlists/' + playlist_Id + '/tracks'
   
  axios.get(url, {headers: {
            'Authorization': 'Bearer ' + spotifyToken,
            'Content-Type': 'application/json',
            'Content-Length': '0'
    }})
    .then(async response => {
      var output = '';
      var data = response.data.items;
      var songs = [];
      
      for (song in data) {
        songs[song] = data[song].track.artists[0].name + " " + data[song].track.name;
      }

      var search_requests = [];
      var info_requests = [];

      for (song in songs) {
        const request = await youtube.search.list({part:'snippet', q: songs[song], maxResults: 1});
        search_requests.push(request); 
      }

      var songNames = [...songs];
      console.log(songNames);

      songs = [];

      Promise.all(search_requests).then( responses => {
          
          for (response in responses) {
            var url = "https://www.youtube.com/watch?v=" + responses[response].data.items[0].id.videoId;
            var song_info = {
              title: songNames[response],
              url: url,          
            };

            console.log(song_info.title + " " + song_info.url);
            songs.push(song);
          }

      });
/*
      for (song in songs) {
        
        var search = await youtube.search.list({part:'snippet', q: songs[song], maxResults: 1});
        var url = "https://www.youtube.com/watch?v=" + search.data.items[0].id.videoId;
        console.log(url);

        const info = await ytdl.getInfo(url);
        console.log(info);
     
        var song_info = {
          title: info.title,
          url: info.video_url,
        };

        console.log(song_info.url);

        songs[song] = song_info;
      }
  */  
      if(!serverQueue) {
        /* Define Queue Contract */ 
        const queueContruct = {
          textChannel: message.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: songs,
          volume: 5,
          playing: true
        };
  
        /* Set new queue */
        queue.set(message.guild.id, queueContruct);

        /* Join Voice Channel */
        voiceChannel.join().then(connection => {
          queueContruct.connection = connection;
          play(message.guild, queueContruct.songs[0]);
        });

      } else {

        for (song in songs) {
          serverQueue.songs.push(songs[song]);
        }
  
        return message.channel.send(`Playlist adicionada com sucesso, caralho!`);
      }

    })
    .catch(error => {
      console.log(error.message);
    })
}

/* Bot LogIn */
client.login(token);
