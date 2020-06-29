const Discord = require('discord.js');
const spotify = require('./spotify');
const youtube = require('./youtube');
const {queue} = require('./play');

module.exports = {
    help: {
        name: 'help',
        description: 'Displays commands, syntax and important information',
        execute(message) {
            return message.channel.send();
        }
    },
    salve: {
        name: 'salve',
        description: 'A friendly greeting message :)',
        execute(message, args) {
            message.channel.send('Saaaalve parça\nÉ nois ou não é nois?');
        }
    },skip: {
        name: 'skip',
        description: '!skip - Skips the current song:',
        execute(message, serverQueue) {
            if (!serverQueue) {
              message.channel.send("A queue ta vazia, mongol");
            }  
            serverQueue.connection.dispatcher.end();
        }
    },queue: {
        name: 'queue',
        description: 'Displays current queue',
        execute(message, args, serverQueue) {
            if (!serverQueue || !serverQueue.songs) {
                return message.channel.send("A queue ta vazia, mongol");
            }
            
            var songs = serverQueue.songs;
            switch(args[0]) {
                case 'remove':
                    const indexToRemove = parseInt(args[1], 10);
                    if ( (indexToRemove === 0) || (indexToRemove > songs.size) ) {
                        return message.channel.send("Invalid index. (Hint: If you want to remove current song use !skip)");
                    } else {
                        console.log("Removing Song[" + indexToRemove + "] from Queue...")
                        songs.splice(indexToRemove, 1);
                    }
                default:
            }
            
            const queueEmbed = new Discord.MessageEmbed()
                .setColor('#b700ff')
                .setTitle('Server Queue')
                .addFields(
                    songs.map( (song) => {
                        return { name: songs.indexOf(song) + " -\t" + song.title, value: song.url, inline: true }
                    })
                );
            
            serverQueue.queueEmbed = queueEmbed;
            message.channel.send(queueEmbed);
            message.delete();
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
        description: 'Deletes last 50 messages on textChannel',
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
                message.channel.send("Você não tem permissão pra isso, arrombado");
            }
        }

    }, roulette: {
        name: 'roulette',
        description: 'Specify an user to kick. A random number will be drawn and if even the user will be kicked. Otherwise caller will be kicked.',
        execute(message) {
            if (!message.mentions.users.size) {
                return message.reply('No user specified to kick');
            }
            const callerUser = message.member;
            const taggedUser = message.mentions.members.first();

            if ((Math.random() * 100 ) % 2 == 0) {
                taggedUser.kick()
                .then((member) => {
                    message.channel.send(":wave: " + member.displayName + " chupa seu lixo");
                });
            } else {
                callerUser.kick()
                .then((member) => {
                    message.channel.send(":wave: " + member.displayName + " chupa seu lixo");
                });
            }


        }
    }  
};

const memes = ["https://www.youtube.com/watch?v=hjGZLnja1o8", "https://www.youtube.com/watch?v=cE0wfjsybIQ", "https://www.youtube.com/watch?v=oT3mCybbhf0", "https://www.youtube.com/watch?v=PHgc8Q6qTjc", "https://www.youtube.com/watch?v=uE-1RPDqJAY", "https://www.youtube.com/watch?v=ZZ5LpwO-An4", "https://www.youtube.com/watch?v=9oMXMj-8Sqg", "https://www.youtube.com/watch?v=609HhzQ6zfU", "https://www.youtube.com/watch?v=E8H-67ILaqc", "https://www.youtube.com/watch?v=4fWyzwo1xg0&feature=youtu.be", ]
