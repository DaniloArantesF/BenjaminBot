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

module.exports.play = play;
module.exports.queue = queue;