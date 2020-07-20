const Discord = require('discord.js');
const ytdl = require('ytdl-core');

/* Bot Queue Map */
queue = new Map();

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
                                                highWaterMark: 1<<25,   /* Stream was ending too soon. This seems to fix it :) https://bit.ly/2zXEZ4H */
                        });
    var dispatcher = serverQueue.connection.play(stream);
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    const playingEmbed = new Discord.MessageEmbed()
        .setColor('#b700ff')
        .setTitle(song.title)
        .setURL(song.url)
        .setDescription(serverQueue.songs.length > 1 ? "Next song: " + serverQueue.songs[1].title : "")
        .setThumbnail('https://media1.tenor.com/images/75f1a082d67bcd34cc4960131e905bed/tenor.gif?itemid=5505046');

    serverQueue.textChannel.send(playingEmbed)
        .then( message => {
            serverQueue.playingEmbed = message;
    });

    /* Current Song is Over */
    dispatcher.on('finish', () => {
        serverQueue.playingEmbed.delete()
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
	});
	
	/* Error */
	dispatcher.on('error', error => console.log("Deu erro, caralho\n" + error));
}

module.exports.play = play;
module.exports.queue = queue;