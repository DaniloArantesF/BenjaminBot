const spotify = require('./spotify');
const youtube = require('./youtube');
const {queue} = require('./play');

module.exports = {
    salve: {
        name: 'salve',
        description: 'A friendly greeting message :)',
        execute(message, args) {
            message.channel.send('Saaaalve parça\nÉ nois ou não é nois?');
        }
    },kick: {
        name: 'kick',
        description: '',
        execute(message) {
            if (!message.mentions.users.size) {
                return message.reply('No user specified to kick');
            }
            const taggedUser = message.mentions.users.first();
        }
    },skip: {
        name: 'skip',
        description: 'Skips the current song',
        execute(message, serverQueue) {
            if (!serverQueue) {
              message.channel.send("A queue ta vazia, mongol");
            }  
            serverQueue.connection.dispatcher.end();
        }
    },stop: {
        name: 'stop',
        description: 'Clears out song queue',
        execute(message, serverQueue) {
            serverQueue.songs = [];
            message.channel.send("flw mens");
            serverQueue.connection.dispatcher.end();
        }
    },leave: {
        name: 'leave',
        description: 'Makes bot leave the channel',
        execute(message, serverQueue) {
            if (serverQueue.songs) {
                serverQueue.songs = [];
            }
            message.channel.send("flw mens");
            serverQueue.connection.dispatcher.end();
            serverQueue.voiceChannel.leave();
        }
    },youtube: {
        name: 'youtube',
        description: 'Searches and Plays songs from youtube',
        execute(message, args, serverQueue) {
            youtube.handler(message, args, serverQueue);
        }
    },spotify: {
        name: 'spotify',
        description: 'Gets a playlist from spotify and plays the songs using Youtube',
        execute(message, serverQueue) {

        }
    },purge: {
        name: 'purge',
        description: 'Deletes all messages on textChannel',
        execute(message) {
            if (message.member.hasPermission("Administrator")) {
                    message.channel.messages.fetch()
                    .then(messages => {
                        message.channel.bulkDelete(messages, true)
                        .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
                        .catch(console.error);
                    })
                    .catch(console.error);
            } else {
                return message.channel.send("Você não tem permissão pra isso, arrombado");
            }
        }

    }  
};

const memes = ["https://www.youtube.com/watch?v=hjGZLnja1o8", "https://www.youtube.com/watch?v=cE0wfjsybIQ", "https://www.youtube.com/watch?v=oT3mCybbhf0", "https://www.youtube.com/watch?v=PHgc8Q6qTjc", "https://www.youtube.com/watch?v=uE-1RPDqJAY", "https://www.youtube.com/watch?v=ZZ5LpwO-An4", "https://www.youtube.com/watch?v=9oMXMj-8Sqg", "https://www.youtube.com/watch?v=609HhzQ6zfU", "https://www.youtube.com/watch?v=E8H-67ILaqc", "https://www.youtube.com/watch?v=4fWyzwo1xg0&feature=youtu.be", ]
