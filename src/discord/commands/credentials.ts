import { SlashCommandBuilder } from '@discordjs/builders'
import { Channel, CommandInteraction, Guild, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import { getMessageEmbedFromVC } from '../utils/embeds'
import Debug from 'debug'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('credentials')
    .setDescription("Show members credentials")
    .addUserOption((option) =>
      option.setName('member').setDescription('Credential subject').setRequired(false),
    ),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    const { user, client } = interaction

    const recipient = interaction.options.getUser('member')
    const memberId = recipient ? recipient.id : user.id

    const holder = await agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS + ':discord:' + memberId,
    })

    const credentials = await agent.dataStoreORMGetVerifiableCredentials({
      where: [{ column: 'subject', value: [holder.did] }],
      order: [ { column: 'issuanceDate', direction: 'DESC' }]
    })

    const embeds = credentials.slice(0,5).map(({ verifiableCredential }) =>
      getMessageEmbedFromVC(verifiableCredential, true),
    )

    const components = []
    if (credentials.length > 5) {
      //TODO handle this button
      components.push(
        new MessageActionRow()
			    .addComponents(
          new MessageButton()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle('PRIMARY')
        ))
    }

    if (embeds.length > 0) {
      await interaction.reply({
        content: holder.did,
        embeds,
        ephemeral: true,
        components
      })
    } else {
      await interaction.reply({
        content: holder.did + "\n\nYou don't have any credentials issued to you",
        ephemeral: true,
      })
    }
  },
} as CommandHandler
