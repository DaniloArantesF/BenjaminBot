const ytdl = require('ytdl-core');

module.exports = {
	salve: {
	name: 'salve',
	description: 'Salve',
	execute(message, args) {
		message.channel.send('Saaaalve parça\nÉ nois ou não é nois?');
    }},
    ytplay: {
        name: 'ytplay',
        execute(message, args) {

            const voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                return message.reply('Entra num canal de voz, né mongol.');
            }
    
            voiceChannel.join().then(connection => {
                const stream = ytdl(args[0], { filter: 'audioonly', 
                                                highWaterMark: 1<<25,           /* Stream was ending too soon. This seems to fix it :) https://bit.ly/2zXEZ4H */
            }); 
                const dispatcher = connection.play(stream);
                dispatcher.on('end', (reason) => _onTrackEnd(reason, message));
            });

        }
    },
};