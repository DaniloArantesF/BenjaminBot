/* Imports */
require('dotenv').config();
const {google} = require('googleapis');
const ytdl = require('ytdl-core');
const axios = require('axios');
const {play, queue} = require('./play');

// initialize the Youtube API library
const youtube = google.youtube({version: 'v3', auth: process.env.APIKEY});

/* Youtube Request Handler */
async function handleRequest(message, args, serverQueue) {
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
  	    var search = await youtube.search.list({part:'snippet', q: query, maxResults: 1, safeSearch:'none'});
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
	/* Server Queue is empty */
	if (!serverQueue) {
		const newQueue = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		
		};
		/* Set new queue */
		queue.set(message.guild.id, newQueue);
		newQueue.songs.push(song);

		/* Join Voice Channel */
		voiceChannel.join().then(connection => {
			newQueue.connection = connection;
			play(message.guild, newQueue.songs[0]);
		});

	} else { /* Queue is not empty */
		serverQueue.songs.push(song);
		return message.channel.send(`${song.title} foi adicionada à queue, seu merda!`);
	}
}

module.exports.handler = handleRequest;