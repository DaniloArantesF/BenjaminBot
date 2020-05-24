const ytdl = require('ytdl-core');
//const Queue = require('./queue.js');

module.exports = {
    salve: {
	name: 'salve',
	description: 'Salve',
	execute(message, args) {
		message.channel.send('Saaaalve parça\nÉ nois ou não é nois?');
    }}
    ,kick: {
        name: 'kick',
        execute(message) {
            if (!message.mentions.users.size) {
                return message.reply('No user specified to kick');
            }
            const taggedUser = message.mentions.users.first();
        }
    },  
};

const memes = ["https://www.youtube.com/watch?v=hjGZLnja1o8", "https://www.youtube.com/watch?v=cE0wfjsybIQ", "https://www.youtube.com/watch?v=oT3mCybbhf0", "https://www.youtube.com/watch?v=PHgc8Q6qTjc", "https://www.youtube.com/watch?v=uE-1RPDqJAY", "https://www.youtube.com/watch?v=ZZ5LpwO-An4", "https://www.youtube.com/watch?v=9oMXMj-8Sqg", "https://www.youtube.com/watch?v=609HhzQ6zfU", "https://www.youtube.com/watch?v=E8H-67ILaqc", "https://www.youtube.com/watch?v=4fWyzwo1xg0&feature=youtu.be", ]
