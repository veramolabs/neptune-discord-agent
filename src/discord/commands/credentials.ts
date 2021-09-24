import { SlashCommandBuilder } from '@discordjs/builders'
import { Channel, CommandInteraction, Guild, MessageEmbed, TextChannel } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import { getMessageEmbedFromVC } from '../utils/kudos'
import Debug from 'debug'

const debug = Debug('discord:kudos')

module.exports = {
  data: new SlashCommandBuilder().setName('credentials').setDescription('List my verifiable credentials'),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    const { user, client } = interaction

    const holder = await agent.didManagerGetOrCreate({
      provider: 'did:ethr',
      alias: user.id,
    })

    const credentials = await agent.dataStoreORMGetVerifiableCredentials({
      where: [{ column: 'subject', value: [holder.did] }],
    })

    const embeds = credentials.map(({ verifiableCredential }) =>
      getMessageEmbedFromVC(verifiableCredential, true),
    )

    await interaction.reply({
      embeds,
      ephemeral: true,
    })
  },
} as CommandHandler
