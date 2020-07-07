/* Imports */
require('dotenv').config();
const qs = require('qs');
const ytdl = require('ytdl-core');
const axios = require('axios');
var async = require("async");
const {play, queue} = require('./play');
const {API} = require('./youtube');
const { spotify } = require('./commands');
const youtube = API;

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

async function handleRequest(message, uri, serverQueue) {
    const voiceChannel = message.member.voice.channel;
    uri = uri[0];
    var playlist_Id = uri.substring(uri.lastIndexOf(':') + 1, uri.length);
    var songs = await getSpotifyPlaylist(message, playlist_Id, serverQueue);

    if(!serverQueue) {
      const newQueue = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: songs,
        volume: 5,
        playing: true,
        playingEmbed: null,
        queueEmbed: null
      };

      /* Set new queue */
      queue.set(message.guild.id, newQueue);

      /* Join Voice Channel */
      voiceChannel.join().then(connection => {
        newQueue.connection = connection;
        play(message.guild, newQueue.songs[0]);
        message.delete();
      });

    } else {
      for (song in songs) {
        serverQueue.songs.push(songs[song]);
      }
      //message.channel.send('Playlist adicionada com sucesso, caralho!');
      message.delete();
    }
}

/* Returns an array w/ all song names and urls in specified playlist */
async function getSpotifyPlaylist(message, playlist_Id, serverQueue) { 
    var url = 'https://api.spotify.com/v1/playlists/' + playlist_Id + '/tracks'
     
    return axios.get(url, {headers: {
              'Authorization': 'Bearer ' + spotifyToken,
              'Content-Type': 'application/json',
              'Content-Length': '0'
      }})
      .then(async response => {
        var data = response.data.items;
        var songs = serverQueue || [];
        var songNames = [];

        for (song in data) {
          songNames[song] = data[song].track.name + ", " + data[song].track.artists[0].name;
        }

        var searchQueue = async.queue((song, callback) => {
          //console.log("\nProcessing " + song.name + "...");
          youtube.search.list({part:'snippet', q: song.name, maxResults: 1, safeSearch:'none', type:'video', regionCode:'US', videoCategoryId:'10' })
            .then( (response) => {
              callback(song.name, response);
            });
        }, 1);

        for (song in songNames) {
          //console.log("Pushing " + songNames[song] + "...");
          searchQueue.push({name: songNames[song]}, (songName, response) => {
            var url = "https://www.youtube.com/watch?v=" + response.data.items[0].id.videoId;
            var song_info = {
              title: songName,
              url: url,          
            };
            //console.log("\nFinished processing " + songName + "...");
            songs.push(song_info);
          });
        }
        const isReady = async () => {
          if (searchQueue.length() < songNames.length) {
            //console.log("ready")
            return true;
          } else {
            //console.log("not ready");
            setTimeout(isReady, 100);
          }
        }
        return new Promise(async resolve => {
          await isReady();
          resolve(songs);
        });
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  module.exports.handler = handleRequest;
  module.exports.API = spotify;