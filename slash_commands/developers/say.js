const { SlashCommandBuilder } = require('@discordjs/builders')

const strings = require('../../resources/strings')
const UIDA = [
  process.env.UIDR,
  process.env.UIDD,
  process.env.UIDT,
  process.env.UIDJ
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription(strings.HELP_DESC_SAY)
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to send using the bot! use URL to attach files!')
        .setRequired(true)
    ),
  execute: async function(interaction) {

    if (UIDA.includes(interaction.user.id)) {
      await interaction.channel.send({ content: interaction.options.getString('text') })
      await interaction.reply({ content: '.' }) // close the interaction by replying to it
      await interaction.deleteReply() // delete the interaction to hide the interaction author
    }

  }
}