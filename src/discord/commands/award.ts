import { SlashCommandBuilder } from '@discordjs/builders'
import { Channel, CommandInteraction, Guild, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, TextChannel } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import { getMessageEmbedFromVC } from '../utils/embeds'
import Debug from 'debug'
import yaml from 'yaml'

const debug = Debug('discord:award')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('award')
    .setDescription('Give out an award')
    .addUserOption((option) =>
      option.setName('to').setDescription('Who are you giving out award to?').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('award').setDescription('Ex: Member of the week!').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('emoji').setDescription(':trophy:').setRequired(true),
    ),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    //console.dir(interaction, { depth: 10 })

    if (!interaction.inGuild()) return

    const { user, client, channelId, guildId } = interaction
    const channel = (await client.channels.fetch(channelId)) as TextChannel
    const guild = client.guilds.cache.get(guildId) as Guild
    const recipient = interaction.options.getUser('to')
    const award = interaction.options.getString('award')
    const emoji = interaction.options.getString('emoji')

    if (!recipient) {
      return await interaction.reply('Who are you giving out award to?')
    }

    if (!award) {
      return await interaction.reply('What award are you giving out?')
    }

    if (!emoji) {
      return await interaction.reply('What emoji symbolizes the award?')
    }

    const issuer = await agent.didManagerGetOrCreate({
      provider: 'did:ethr',
      alias: user.id,
    })

    const holder = await agent.didManagerGetOrCreate({
      provider: 'did:ethr',
      alias: recipient.id,
    })

    const credentialSubject = {
      award,
      emoji,
      name: recipient.username,
      author: {
        name: user.username,
        avatar: user.avatarURL({ format: 'png' }) || '',
      },
      channel: {
        name: channel.name,
        id: channel.id,
        nsfw: channel.nsfw,
      },
      guild: {
        name: guild.name,
        id: guild.id,
        avatar: guild.iconURL({ format: 'png' }) || '',
      },
      id: holder.did,
      avatar: recipient.avatarURL({ format: 'png' }) || '',
    }

    const vc = await agent.createVerifiableCredential({
      save: true,
      proofFormat: 'jwt',
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'Award'],
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        credentialSubject,
      },
    })

    const publicEmbed = getMessageEmbedFromVC(vc, false)

    // Sending this in a DM
    const privateEmbed = getMessageEmbedFromVC(vc, true)

    try {
      const file = Buffer.from(yaml.stringify(vc))
      const attachment = new MessageAttachment(file, 'verifiable-credential.yaml')

      const row = new MessageActionRow()
			.addComponents(
        new MessageButton()
          .setCustomId('sobol')
          .setLabel('Send to Sobol')
          .setStyle('PRIMARY'),
				// new MessageButton()
				// 	.setCustomId(`export`)
				// 	.setLabel('Export')
				// 	.setStyle('SECONDARY'),

			);

      await recipient.send({
        content: 'You received kudos',
        embeds: [privateEmbed],
        files: [attachment],
        components: [row]
      })

    } catch (e) {
      //
    }

    await interaction.reply({
      embeds: [publicEmbed],
    })
  },
} as CommandHandler
