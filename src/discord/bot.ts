import { config } from 'dotenv'
config()
import fs from 'fs'
import path from 'path'
import Debug from 'debug'
import { Collection } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from './types'
import { client } from './client'

const debug = Debug('discord')

interface Options {
  agent: ConfiguredAgent
}

export async function init(options: Options) {
  if (!process.env.DISCORD_TOKEN) throw Error('DISCORD_TOKEN is missing')
  if (!options.agent) throw Error('[init] Agent is required')

  const commands = new Collection<string, CommandHandler>()
  const commandFiles = fs
    .readdirSync(path.resolve('./build/discord/commands'))
    .filter((file) => file.endsWith('.js'))

  for (const file of commandFiles) {
    const command = require(path.resolve(`./build/discord/commands/${file}`))
    commands.set(command.data.name, command)
  }

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return

    const command = commands.get(interaction.commandName)

    if (!command) return

    try {
      await command.execute(interaction, options.agent)
    } catch (error) {
      console.error(error)
      return interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
    }
  })

  // client.on('interactionCreate', interaction => {
  //   if (!interaction.isButton()) return;
  //   console.dir(interaction, {depth: 10});
  //   if (interaction.customId === 'export') {
  //     const file = Buffer.from('key: value')
  //     const attachment = new MessageAttachment(file, 'verifiable-credential.yaml')
  //     interaction.update({files: [attachment]})
  //   }
  // });

  client.once('ready', async () => {
    if (!process.env.DISCORD_BOT_DID_ALIAS) throw Error('DISCORD_BOT_DID_ALIAS is missing')

    const bot = await options.agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS,
      provider: 'did:web',
    })

    debug(bot.did, client?.user?.tag, 'is ready')
  })

  client.login(process.env.DISCORD_TOKEN)
}
