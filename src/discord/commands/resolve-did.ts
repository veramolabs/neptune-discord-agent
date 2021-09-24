import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import Debug from 'debug'

const debug = Debug('discord:resolve')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resolve')
    .setDescription('Resolve DID Document')
    .addStringOption((option) =>
      option.setName('did').setDescription('Ex: did:web:sun.veramo.io').setRequired(true),
    ),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    const { didDocument, didResolutionMetadata } = await agent.resolveDid({
      didUrl: interaction.options.getString('did') as string,
    })
    if (didResolutionMetadata.error) {
      await interaction.reply(didResolutionMetadata.error)
    } else {
      await interaction.reply('```\n' + JSON.stringify(didDocument, null, 2) + '\n```')
    }
  },
} as CommandHandler
