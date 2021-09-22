import { config } from 'dotenv'
config()
import Debug from 'debug'
import { IDIDManager, TAgent } from '@veramo/core'
import { Client, Intents, MessageEmbed} from 'discord.js'

const debug = Debug('discord-agent')

interface Options {
  agent: TAgent<IDIDManager>
}

export async function init(options: Options) {
  if (!process.env.DISCORD_TOKEN) throw Error('DISCORD_TOKEN is missing')
  if (!options.agent) throw Error('[init] Agent is required')

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'REACTION'],
  })
  
  client.on('messageReactionAdd', async (reaction, user) => {
    console.log(reaction)
    if (reaction.partial) {
      try {
        await reaction.fetch()
      } catch (error) {
        console.error('Something went wrong when fetching the message: ', error)
        return
      }
    }

    debug(reaction)
  
  })

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
  
    if (interaction.commandName === 'kudos') {
      debug(interaction)

      const from = interaction.member?.user

      console.dir(from, {depth: 10})

      let fromName = ''
      let fromAvatar = ''
      let toName = ''
      let toAvatar = ''
      if (from) {
        fromAvatar = client.users.cache.get(from.id)?.displayAvatarURL() || ''
        fromName = client.users.cache.get(from.id)?.username || ''
      }
      
      const to = interaction.options.getUser('to')
      if (to) {
        toAvatar = to.displayAvatarURL()
        toName = to.username
      }
      debug(interaction.options.getUser('to'))
      debug(interaction.options.getString('kudos'))
      const exampleEmbed = new MessageEmbed()
        .setColor('#73C394')
        .setTitle('🏆 Kudos to ' + toName )
        // .setURL('https://discord.js.org/')
        .setDescription(interaction.options.getString('kudos') as string)
        .setThumbnail(toAvatar)
        .setTimestamp()
        .setFooter(fromName, fromAvatar)


        try {
          
        }catch (e) {
          console.dir(e, { depth: 10})
        }
        await interaction.reply({
        embeds: [exampleEmbed] 
      })
    }
  });
  
  client.on('interactionCreate', async interaction => {
    if (!interaction.isContextMenu()) return;
  
    if (interaction.commandName === 'Publish in Metaverse') {
      debug(interaction)
      const exampleEmbed = new MessageEmbed()
        .setColor('#73C394')
        .setTitle('Some title')
        .setURL('https://discord.js.org/')
        .setAuthor('Some name', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
        .setDescription('Some description here')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .addFields(
          { name: 'Regular field title', value: 'Some value here' },
          { name: '\u200B', value: '\u200B' },
          { name: 'Inline field title', value: 'Some value here', inline: true },
          { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addField('Inline field title', 'Some value here', true)
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png')

        await interaction.reply({
        embeds: [exampleEmbed] 
      })
    }
  });

  client.once('ready', async () => {
    if (!process.env.DISCORD_BOT_DID_ALIAS) throw Error('DISCORD_BOT_DID_ALIAS is missing')

    const bot = await options.agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS,
      provider: 'did:ethr',
    })
  
    debug(bot.did, client?.user?.tag, 'is ready')
  })

  client.login(process.env.DISCORD_TOKEN)
}
