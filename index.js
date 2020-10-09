// Libs:
require('dotenv').config();
const Discord        = require("discord.js");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const axios          = require('axios').default;
const express        = require('express');
const fs             = require('fs');
const app            = express();
const port           = 3000;
var https            = require('https');
var sizeOf           = require('image-size');
const client         = new Discord.Client();
client.commands      = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

// External files
const speech = require('./messages');

// Secrets:
prefix = process.env.PREFIX;
token  = process.env.CLIENT_TOKEN;

// Channels ids defitions:
const IDsubmitR  = '747889024068485180'; // -> #submit-textures (Robert's testing discord)
const IDsubmitFD = '715236892945285181'; // -> #submit-textures (Faithful Dungeons discord)

// Various settings:
const BotImgURL   = 'https://i.imgur.com/ldI5hDM.png';
const EMBED_COLOR = '#E1631F';

// Bot status:
client.on("ready", () => {
	client.user.setActivity("https://faithful-dungeons.github.io/Website/", {type: "PLAYING"});
	console.log("JavaScript is pain, but i'm fine, i hope...");
});

//True if this url is a png image.
function attachIsImage(msgAttach) {
  var url = msgAttach.url;
  return url.indexOf("png", url.length - "png".length /*or 3*/) !== -1;
}
//Return Image size, need url.
function getMeta(imgUrl) {
	return new Promise(function(resolve, reject) {

		https.get(imgUrl, function (response) {
			var chunks = [];
			response.on('data', function (chunk) {
				chunks.push(chunk);
			}).on('end', function() {
				var buffer = Buffer.concat(chunks);
				resolve(sizeOf(buffer));
			});
		}).on('error', function(error) {
			reject(error);
		});

	});
}

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
	  command.execute(message, args);
  } catch (error) {
	  console.error(error);
	  message.reply('there was an error trying to execute that command!');
  }
});


// Run:
client.on("message", message => {
  // Bot messages aren't read:
  if (message.author.bot) return;

  /**********************************
          COMMANDS WITH PREFIX
   **********************************/

  // Clean command:
  /*if (message.content.startsWith( prefix + 'clear') ){
    if(message.member.roles.cache.some(r=>["God", "Helper", "Mod", "Server Creator"].includes(r.name)) ) {
      //console.trace('clear triggered');

      var argss   = message.content.split(' ').slice(1); // cut after '/clear'
      var amount = args.join(' ');

      if (!amount) return message.reply("You haven't given an amount of messages which should be deleted!");
      if (isNaN(amount)) return message.reply("The amount parameter isn't a number!");

      if (amount > 100) return message.reply("You can't delete more than 100 messages at once!");
      if (amount < 1) return message.reply("You have to delete at least 1 message :upside-down:");

      try {
        message.channel.messages.fetch({ limit: amount }).then(messages => {
          message.channel.bulkDelete(messages)
        });
      } catch(error) { // doesn't seems to work
        console.error(error);
        message.reply("The amount contains messages older than 14 days, can't delete them").then(msg => {
          msg.delete({timeout: 30000});
        });
      }
    } else {
      message.reply("You don't have the permission to do that!").then(msg => {
          msg.delete({timeout: 30000});
        });
    }
  }

	// TEXTURE REVIEW COMMANDS:
	if (message.content.startsWith( prefix + 'get') ){
		//console.trace('get triggered');

		var argss  = message.content.split(' ').slice(1); // cut after command
		var texture = args.join();
			  
		var imgURL = 'https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/' + texture + '.png';
		console.log(imgURL);

		axios.get(imgURL).then(function (response) {
			//console.log('well played');
			getMeta(imgURL).then(function (dimension) {
				var size = dimension.width + 'x' + dimension.height;

				var embed = new Discord.MessageEmbed()
				.setTitle(texture)
				.setColor(EMBED_COLOR)
				.setURL(imgURL)
				.setDescription('block texture')
				.setThumbnail(imgURL)
				.addFields(
					{ name: 'Author:', value: 'WIP', inline: true },
					{ name: 'Resolution:', value: size, inline: true }
				)
				.setFooter('Faithful Dungeons', BotImgURL);
			
				message.channel.send(embed);
			}).catch(function(error) {
				console.log(error);
			});
		}).catch(function(error) {
			console.log(error);
			message.reply(speech.BOT_TEXTURE_DOESNT_EXIST).then(msg => {
        msg.delete({timeout: 30000});
      });
		});
	}

  // HELP SETTINGS:
  // Help:
  if (message.content === prefix + 'help') {
    //console.trace('help triggered');

    var embed = new Discord.MessageEmbed()
      .setTitle('Help Menu:')
      .setColor(EMBED_COLOR)
      .addFields(
        { name: '`/help`', value: 'open this menu', inline: true },
        { name: '`/ping`', value: 'return user ping', inline: true },
        { name: '`/help submission`', value: 'get infos about textures submission', inline: true }
      )
      .setFooter('Faithful Dungeons', BotImgURL);

    message.channel.send(embed);
  }
  // Help submission:
  if (message.content === prefix + 'help submission') {
    //console.trace('help submission triggered');

    var embed = new Discord.MessageEmbed()
      .setTitle('Textures Submissions help')
      .setColor(EMBED_COLOR)
      .addFields(
        { name: 'How submit a texture for review?', value: 'Go to #submit-textures channel, send a message with the texture you made.', inline: false },
        { name: 'Message Requirements:', value: 'Texture need to be a .png file, you also have to add the texture name & path (ex: texture `(path/file/file/texture.png)`', inline: false}
      )
      .setFooter('Faithful Dungeons', BotImgURL);

    message.channel.send(embed);
  }

  // Special commands: (easter eggs)
  if (command === 'behave') {
    message.channel.send("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)");
  }
  if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
    message.reply('┬─┬ ノ( ゜-゜ノ) Take a coffee and calm down');
  }*/

  /**********************************
         COMMANDS WITHOUT PREFIX
   **********************************/

  // TEXTURES SUBMISSIONS:
  if (message.channel.id === (IDsubmitFD || IDsubmitR)) {
    if (message.attachments.size > 0) {
        if (message.attachments.every(attachIsImage)){

        if(!message.content.includes('(')) {
          message.reply("you need to add the texture path to your texture submission, follow this example: `**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`").then(msg => {
            msg.delete({timeout: 30000});
          });
        } else try {
          message.react('✅').then(() => {message.react('❌')});
        } catch (error) {
          console.error("ERROR | One of the emojis failed to react!");
        }

      } else {
        message.reply("you need to attach a png file!").then(msg => {
          msg.delete({timeout: 30000});
        });
      }
    } else {
      message.reply("your texture submission needs to have an image attached!").then(msg => {
        msg.delete({timeout: 30000});
      });
    }
  }

  // Check texture feature
  // All channel without #submit-texture
  /*if (message.channel.id !== '747889024068485180' ) {
    if(message.content.includes('#4393' )) {
      const exampleEmbed = new Discord.MessageEmbed()
        .setAuthor(message.member.user.tag)
        .setColor('#dd7735')
        .setTitle('dirt_highblockhalls.png')
        .setURL('https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png')
        .setDescription('block texture')
        .setThumbnail('https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png')
        .addFields(
          { name: 'Author:', value: 'Some guy', inline: true },
          { name: 'Resolution:', value: '32 x 32', inline: true }
      )
      .setFooter('Faithful Dungeons', BotImgURL);
      message.channel.send(exampleEmbed);
    }
  }*/
});

client.login(token);
