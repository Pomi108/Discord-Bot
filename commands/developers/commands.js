const prefix = process.env.PREFIX

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { warnUser } = require('../../helpers/warnUser')
const strings  = require('../../resources/strings')

const UIDA = (process.env.UIDA || '').split(',')

module.exports = {
	name: 'commands',
	description: strings.HELP_DESC_COMMANDS,
	guildOnly: true,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}commands [--global] [serverID] [--remove]`,
  example: `${prefix}commands --global\n${prefix}commands 123456789\n${prefix}commands 123456789 --remove`,
  /**
   * 
   * @param {import('discord.js').Client} client Incoming discord client
   * @param {import('discord.js').Message} message Message triggering the command
   * @param {String[]} args Command arguments
   * @returns 
   */
	async execute(client, message, args) {
		if (UIDA.includes(message.author.id)) {
      args = args.map(a => a.toLowerCase())
      const global = args.includes('--global')
      if(global) args.splice(args.indexOf('--global'), 1)
      const remove = args.includes('--remove')
      if(remove) args.splice(args.indexOf('--remove'), 1)

      let serverId
      if(!global) {
        if(args.length < 1) return warnUser(message, strings.COMMAND_TOO_MUCH_ARGS_GIVEN)
        try {
          parseInt(args[0])
          serverId = args[0]
        } catch (error) {
          return warnUser(message, strings.COMMANDS_NO_SERVER_ID_GIVEN)
        }
      }

      const rest = new REST({ version: 8 }).setToken(process.env.CLIENT_TOKEN)
      const slashCommands = [...client.commands.values()].filter(cmd => cmd.data !== undefined).map(cmd => cmd.data.toJSON())

      let apiRequest 
      
      // more infos at
      // https://discord.com/developers/docs/interactions/application-commands#updating-and-deleting-a-command
      // https://discordjs.guide/interactions/registering-slash-commands.html
      if(remove)
        apiRequest = rest.put(
          global ? Routes.applicationCommands(process.env.CLIENT_ID) : Routes.applicationGuildCommands(process.env.CLIENT_ID, serverId),
          { body: [] }
        )
      else
        apiRequest = rest.put(
          global ? Routes.applicationCommands(process.env.CLIENT_ID) : Routes.applicationGuildCommands(process.env.CLIENT_ID, serverId),
          { body: slashCommands },
        )

      const location = global ? 'application' : '`' + client.guilds.cache.get(serverId).name + '` server'
      const action = remove ? 'removed' : 'updated';
      return apiRequest.catch(err => {
        warnUser(message, 'Failed ' + action + ' ' + location + ' commands. Check console for more infos.')
        console.error(err)
        return Promise.reject(err)
      }).then(() => {
        let content = 'Successfully ' + action + ' ' + location + ' slash commands.'
        if(global) content += '\nThey will be updated in 1 hour.'
        return message.reply(content)
      })

		} else return Promise.resolve()
	}
};
