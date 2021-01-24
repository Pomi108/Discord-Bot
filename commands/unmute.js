const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const strings = require('../res/strings');
const colors = require('../res/colors');
const settings = require('../settings.js');

const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'unmute',
	aliases: ['pardon'],
	description: 'Remove Muted roles to someone',
	uses: 'Moderators',
	syntax: `${prefix}unmute <@user> <reason>`,
	async execute(client, message, args) {

		if (message.member.hasPermission('BAN_MEMBERS')) {
			if (args != '') {
				var role = message.guild.roles.cache.find(role => role.name === 'Muted');
				const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const reason = args.slice(1).join(' ') || 'Not Specified';

        if (!member.roles.cache.find(r => r.name === "Muted")) return await message.reply('this user was never muted!');
				else {
          await member.roles.remove(role);
          var embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
				    .setDescription(`Unmuted ${member} \nReason: ${reason}`)
            .setColor(colors.BLUE)
				    .setTimestamp();
			    const embedMessage = await message.channel.send(embed);
          await embedMessage.react('🗑️');
          const filter = (reaction, user) => {
			      return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
	    	  };

          embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			      .then(async collected => {
				      const reaction = collected.first();
				      if (reaction.emoji.name === '🗑️') {
				      	await embedMessage.delete();
                await message.delete();
				      }
			      })
            .catch(async () => {
		          await embedMessage.reactions.cache.get('🗑️').remove();
	          });

          var logchannel = undefined;
          if (message.guild.id == settings.C32_ID) logchannel = client.channels.cache.get(settings.C32_MOD_LOGS);
		      var embed = new Discord.MessageEmbed()
			      .setAuthor(`${message.author.tag} unmuted someone`)
			      .setColor(colors.YELLOW)
			      .setThumbnail(message.author.displayAvatarURL())
			      .setDescription(`[Jump to message](${message.url})\n\n**Channel**: <#${message.channel.id}>\n**Unmuted user**: ${member}\n**Reason**: \`${reason}\`\n**Date**: \`${message.createdAt}\``)
			      .setTimestamp()

		      await logchannel.send(embed);
        }
			} else return warnUser(message,strings.COMMAND_PROVIDE_VALID_TAG);
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
