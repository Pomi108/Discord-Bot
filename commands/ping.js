const Discord  = require('discord.js');
const settings = require('../settings.js');

module.exports = {
	name: 'ping',
	description: 'Pong!',
	uses: 'Anyone',
	syntax: `${prefix}ping`,
	async execute(client, message, args) {
    const m = new Discord.MessageEmbed().setTitle('Ping?')

    message.channel.send(m).then(async m => {
    const embed = new Discord.MessageEmbed()
      .setTitle('Pong!')
      .setDescription(`Latency: ${m.createdTimestamp - message.createdTimestamp}ms \nAPI Latency: ${Math.round(client.ws.ping)}ms`)
      .setFooter('CompliBot', settings.BOT_IMG);
    await m.edit(embed);
    await m.react('🗑️');
    const filter = (reaction, user) => {
			return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
	  };
        	
    m.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '🗑️') {
				  await m.delete();
          await message.delete();
				}
			})
      .catch(async collected => {
		    await m.reactions.cache.get('🗑️').remove();
	    });
    })
	}
};