import { SlashCommandBuilder } from '@discordjs/builders'
import { Channel, CommandInteraction, Guild, MessageEmbed, TextChannel, Message, MessageAttachment, MessageActionRow, MessageButton } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import { getMessageEmbedFromVC } from '../utils/embeds'
import Debug from 'debug'
import yaml from 'yaml'

const debug = Debug('discord:kudos')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kudos')
    .setDescription('Issues kudos credential')
    .addUserOption((option) =>
      option.setName('to').setDescription('Who are you giving kudos to?').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('kudos').setDescription('Ex: For being so awesome!').setRequired(true),
    ),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    //console.dir(interaction, { depth: 10 })

    if (!interaction.inGuild()) return

    const { user, client, channelId, guildId } = interaction
    const channel = (await client.channels.fetch(channelId)) as TextChannel
    const guild = client.guilds.cache.get(guildId) as Guild
    const recipient = interaction.options.getUser('to')
    const kudos = interaction.options.getString('kudos')

    if (!recipient) {
      return await interaction.reply('Who are you thanking?')
    }

    if (!kudos) {
      return await interaction.reply('Why are you thanking?')
    }

    const issuer = await agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS + ':discord:' + user.id,
    })

    const holder = await agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS + ':discord:' + recipient.id,
    })

    const credentialSubject = {
      name: recipient.username,
      kudos: kudos,
      author: {
        name: user.username,
        avatar: user.avatarURL({ format: 'png' }) || '',
      },
      channel: {
        id: channel.id,
        name: channel.name,
        nsfw: channel.nsfw,
      },
      guild: {
        id: guild.id,
        name: guild.name,
        avatar: guild.iconURL({ format: 'png' }) || '',
      },
      avatar: recipient.avatarURL({ format: 'png' }) || '',
      id: holder.did,
    }


    const vc = await agent.createVerifiableCredential({
      save: true,
      proofFormat: 'jwt',
      credential: {
        id: interaction.id,
        credentialSubject,
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        type: ['VerifiableCredential', 'Kudos'],
        '@context': ['https://www.w3.org/2018/credentials/v1'],
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
