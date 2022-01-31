import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import { getEmbedFromMessage } from '../utils/embeds'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inbox')
    .setDescription("Show my inbox"),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    const { user, client } = interaction

    const holder = await agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS + ':discord:' + user.id,
    })

    const messages = await agent.dataStoreORMGetMessages({
      where: [{ column: 'to', value: [holder.did] }],
      order: [ { column: 'createdAt', direction: 'DESC' }]
    })

    const embeds = messages.slice(0,5).map( message  =>
      getEmbedFromMessage(message),
    )

    const components = []
    if (messages.length > 5) {
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
