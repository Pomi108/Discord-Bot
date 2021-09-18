const { SlashCommandBuilder } = require('@discordjs/builders')

const strings  = require('../../resources/strings')
const settings = require('../../resources/settings')
const colors   = require('../../resources/colors')
const Discord  = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(strings.HELP_DESC_PING),
  /** @param {Discord.Interaction} interaction Discord interaction in /cmd */
  execute: async function(interaction) {

    const m = new Discord.MessageEmbed().setTitle('Ping?')
    await interaction.reply({ embeds: [m] })

    const message = await interaction.fetchReply()

    const embed = new Discord.MessageEmbed()
      .setTitle('Pong!')
      .setColor(colors.BLUE)
      .setDescription(`Latency: ${message.createdTimestamp - interaction.createdTimestamp}ms \nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`)
      .setFooter(interaction.client.user.username, settings.BOT_IMG)

    await interaction.editReply({ embeds: [embed] })
  },
}