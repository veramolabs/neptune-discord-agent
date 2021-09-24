import { SlashCommandBuilder } from '@discordjs/builders'
import { Channel, CommandInteraction, Guild, MessageEmbed, TextChannel } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import { getMessageEmbedFromVC } from '../utils/embeds'
import Debug from 'debug'

const debug = Debug('discord:resume')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription("Show members's resume")
    .addUserOption((option) =>
      option.setName('member').setDescription('Credential subject').setRequired(false),
    ),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    const { user, client } = interaction

    const recipient = interaction.options.getUser('member')
    const memberId = recipient ? recipient.id : user.id

    const holder = await agent.didManagerGetOrCreate({
      provider: 'did:ethr',
      alias: memberId,
    })

    const credentials = await agent.dataStoreORMGetVerifiableCredentials({
      where: [{ column: 'subject', value: [holder.did] }],
    })

    const embeds = credentials.map(({ verifiableCredential }) =>
      getMessageEmbedFromVC(verifiableCredential, true),
    )

    if (embeds.length > 0) {
      await interaction.reply({
        embeds,
        ephemeral: true,
      })
    } else {
      await interaction.reply({
        content: "You don't have any credentials issued to you",
        ephemeral: true,
      })
    }
  },
} as CommandHandler
