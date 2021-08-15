/* eslint-disable no-unused-vars */
/* eslint-env node */

/**
 * COMPLIBOT MAIN FILE:
 * Developped by and for the Compliance Community.
 */

// Libs:
const fs           = require('fs')
const Discord      = require('discord.js')
const { REST }     = require('@discordjs/rest')
const { Routes }   = require('discord-api-types/v9')
const { walkSync } = require('./helpers/walkSync')
require('dotenv').config()

const { Client, Intents, Permissions } = require('discord.js');
const client = new Client({
	allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
	restTimeOffset: 0,
	partials: Object.values(Discord.Constants.PartialTypes),
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] 
})

module.exports.Client = client

const DEBUG   = (process.env.DEBUG.toLowerCase() == 'true')
const DEV     = (process.env.DEV.toLowerCase() == 'true')
const LOG_DEV = ((process.env.LOG_DEV || 'false').toLowerCase() == 'true')

// Resources:
const colors  = require('./resources/colors')

// Import settings & commands handler:
const commandFiles = walkSync('./commands').filter(f => f.endsWith('.js'))

/**
 * OLD COMMANDS HANDLER
 * - Automated: /commands & below
 * - Easter Eggs & others: below
 */
client.commandsOld = new Discord.Collection()
for (const file of commandFiles) {
	const command = require(file)

	if ('name' in command && typeof(command.name) === 'string') {
		client.commandsOld.set(command.name, command)
	}
}

/**
 * SlASHS COMMANDS HANDLER
 */
client.commands = new Discord.Collection()
const commands = []
const slashCommandFiles = walkSync('./slash_commands').filter(f => f.endsWith('.js'))

const clientId = process.env.CLIENT_ID
const guildId = "873658926279819274" // slash commands server test

for (const file of slashCommandFiles) {
	const command = require(file)
	client.commands.set(command.data.name, command)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(process.env.CLIENT_TOKEN);

(async () => {
	try {
		if (DEV) {
			console.log('Started refreshing application (/) commands.');

			await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);

			console.log('Successfully reloaded application (/) commands.');
		}
		else {
			await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);
		}
	} catch (error) {
		console.error(error);
	}
})();

/**
 * EVENT HANDLER
 */
const eventsFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'))

for (const file of eventsFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// eslint-disable-next-line no-unused-vars
process.on('unhandledRejection', (reason, promise) => {
	if (DEV) return console.trace(reason.stack || reason)

	const errorChannelId = LOG_DEV ? '875301873316413440' : '853547435782701076'
	const errorChannel = client.channels.cache.get(errorChannelId)
	const errorEmbed = new Discord.MessageEmbed()
		.setTitle('Unhandled Rejection:')
		.setDescription("```fix\n" + (reason.stack || JSON.stringify(reason)) +"```")
		.setColor(colors.RED)
		.setTimestamp()

	errorChannel.send({embeds: [errorEmbed]})
})

// Login the bot
client.login(process.env.CLIENT_TOKEN).catch(console.error)