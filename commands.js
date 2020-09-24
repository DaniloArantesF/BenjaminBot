const Discord = require('discord.js');
const spotify = require('./spotify');
const youtube = require('./youtube');
const {queue} = require('./play');

module.exports = {
    play: {
        name: 'play',
        description: '!play <Youtube/Spotify> - Play song specified by query, url or playlist URI\nYoutube: URL/Search String\nSpotify: playlistURI (https://prnt.sc/t8fxxt)'
    },help: {
        name: 'help',
        description: '!help - Displays commands, syntax and important information',
        hide: 0,
        execute(message) {
            var commands = []
            for(const command of Object.keys(module.exports)) {
                if (!module.exports[command].hide) {
                    commands.push({
                        name: module.exports[command].name,
                        description: module.exports[command].description
                    });
                }
            }
            const helpEmbed = new Discord.MessageEmbed()
                .setColor('#b700ff')
                .setTitle('Bot Commands :scroll: ')
                .addFields(
                    commands.map( (command) => {
                        return { name: '#' + command.name +'\n', value: command.description}
                    })
                );
            return message.channel.send(helpEmbed)
        }
    },
    salve: {
        name: 'salve',
        description: '!salve - A friendly greeting message :)',
        hide: 0,
        execute(message, args) {
            message.channel.send('Saaaalve parça\nÉ nois ou não é nois?');
        }
    },skip: {
        name: 'skip',
        description: '!skip\tSkips the current song:',
        hide: 0,
        execute(message, serverQueue) {
            if (!serverQueue) {
              message.channel.send("A queue ta vazia, mongol");
            }
            serverQueue.connection.dispatcher.end();
        }
    },queue: {
        name: 'queue',
        description: '!queue <remove/repeat> <index> - Displays current queue.\n(Optional) Using remove/repeat w/ an index removes or duplicates a song from the queue',
        hide: 0,
        execute(message, args, serverQueue) {
            if (!serverQueue || !serverQueue.songs) {
                return message.channel.send("The queue is empty :cry:");
            }

            /* Delete any previous queue cmd output */
            if (serverQueue.queueEmbed !== null) {
                serverQueue.queueEmbed.delete();
            }

            var songs = serverQueue.songs;
            switch(args[0]) {
                case 'remove':
                    const indexToRemove = parseInt(args[1], 10);
                    if ( (indexToRemove === 0) || (indexToRemove > songs.length)  || (!indexToRemove)) {
                        return message.channel.send("Invalid index. (Hint: If you want to remove current song use !skip)");
                    } else {
                        console.log("Removing Song[" + indexToRemove + "] from Queue...");
                        songs.splice(indexToRemove, 1);
                    }
                    break;
                case 'repeat':
                    const indexToDup = parseInt(args[1], 10);
                    if ( (indexToDup < 0) || (indexToDup > songs.length) || (args.length !== 2) ) {
                        return message.channel.send("Invalid index. Use !help");
                    } else {
                        const dupe = {title: songs[indexToDup].title, url: songs[indexToDup].url};
                        songs.splice(indexToDup, 0, dupe);
                    }
                    break;
                case 'next':
                default:
            }
            const queueEmbed = new Discord.MessageEmbed()
                .setColor('#b700ff')
                .setTitle('Server Queue :headphones:')
                .addFields(
                    songs.map( (song) => {
                        return { name: songs.indexOf(song) + " -\t" + song.title, value: song.url, inline: true }
                    })
                );
            message.channel.send(queueEmbed).then( message => {
                serverQueue.queueEmbed = message;
            });
        }
    },stop: {
        name: 'stop',
        description: '!stop - Stop playing current song and clear out song queue',
        hide: 0,
        execute(message, serverQueue) {
            serverQueue.songs = [];
            message.delete();
            message.channel.send("flw mens");
            serverQueue.connection.dispatcher.end();
        }
    },leave: {
        name: 'leave',
        description: '!leave - Bot disconnects from the current channel and clears queue',
        hide: 0,
        execute(message, serverQueue) {
            if (serverQueue.songs) {
                serverQueue.songs = [];
            }
            message.delete();
            message.channel.send("flw mens");
            serverQueue.connection.dispatcher.end();
            serverQueue.voiceChannel.leave();
        }
    },youtube: {
        name: 'youtube',
        description: 'Searches and Plays songs from youtube',
        hide: 1,
        execute(message, args, serverQueue) {
            youtube.handler(message, args, serverQueue);
        }
    },spotify: {
        name: 'spotify',
        description: 'Gets a playlist from spotify and plays the songs using Youtube',
        hide: 1,
        execute(message, args, serverQueue) {
            spotify.handler(message, args, serverQueue);
        }
    },purge: {
        name: 'purge',
        description: '!purge <n> - Deletes last <n> messages on textChannel(n defaults to 100)',
        hide: 0,
        execute(message, args) {
            if (!(/^\d+$/.test(args[0]))) {
                return message.channel.send("Tá me tirando, caralho? :rage:");
            }
            const numToDelete = args.length > 0 ? parseInt(args[0], 10) : 99;
            if (numToDelete < 1 || numToDelete > 100) {
                return message.channel.send("Value should be between 1 and 100.");
            }
            if (message.member.hasPermission("Administrator")) {
                message.channel.messages.fetch({ limit: numToDelete + 1 }) /* +1 accounts for actual purge command */
                .then(messages => {
                    message.channel.bulkDelete(messages, true)
                    .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
                    .catch(console.error);
                })
                .catch(console.error);
            } else {
                return message.channel.send("You are too peasant to use this command.");
            }
        }
    },roulette: {
        name: 'roulette',
        description: '!roulette <userToKick> - Specify an user to kick. A random number will be drawn and if even the user will be kicked. Otherwise caller will be kicked.',
        hide: 1,
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