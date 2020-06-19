/* Imports */
require('dotenv').config();
const qs = require('qs');
const ytdl = require('ytdl-core');
const axios = require('axios');
const {play, queue} = require('./play');
const {API} = require('./youtube');
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

        message.channel.send(`Playlist adicionada com sucesso, caralho!`);
        message.delete();
      }
}

/* Returns an array w/ all song names and urls in specified playlist */
async function getSpotifyPlaylist(message, playlist_Id, serverQueue) { 
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
        for (song in songs) {
          const request = await youtube.search.list({part:'snippet', q: songs[song], maxResults: 1, safeSearch:'none'});
          search_requests.push(request); 
        }

        var songNames = [...songs];
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
        return songs;
        
      })
      .catch(error => {
        console.log(error.message);
      })
  }