import { SlashCommandBuilder } from '@discordjs/builders'
import { Channel, CommandInteraction, Guild, MessageEmbed, TextChannel } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import { getMessageEmbedFromVC } from '../utils/embeds'
import Debug from 'debug'

const debug = Debug('discord:resume')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('attendance')
    .setDescription('Issue Attendance credentials')
    .addChannelOption((option) =>
      option
        .setRequired(true)
        .setName('channel')
        .setDescription('Issue Attendance credentials to all members in this channel'),
    )
    .addStringOption((option) => option.setName('event').setDescription('Event name').setRequired(true))
    .addStringOption((option) => option.setName('picture').setDescription('Picture URL').setRequired(true)),

  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    if (!process.env.DISCORD_BOT_DID_ALIAS) throw Error('DISCORD_BOT_DID_ALIAS is missing')

    if (!interaction.inGuild()) return

    const { user, client, guildId } = interaction
    const guild = client.guilds.cache.get(guildId) as Guild

    const channel = interaction.options.getChannel('channel') as Channel
    const event = interaction.options.getString('event') as string
    const picture = interaction.options.getString('picture') as string

    if (!channel.isVoice()) {
      return interaction.reply({
        content: 'You can only issue attendance credentials to voice channels',
        ephemeral: true,
      })
    }

    const members = channel.members
    members.each(async (member) => {
      const issuer = await agent.didManagerGetOrCreate({
        alias: process.env.DISCORD_BOT_DID_ALIAS as string,
      })

      const holder = await agent.didManagerGetOrCreate({
        alias: process.env.DISCORD_BOT_DID_ALIAS + ':discord:' + member.user.id,
      })

      const credentialSubject = {
        id: holder.did,
        channel: {
          id: channel.id,
          name: channel.name,
        },
        guild: {
          id: guild.id,
          name: guild.name,
          avatar: guild.iconURL({ format: 'png' }) || '',
        },
        author: {
          name: user.username,
          avatar: user.avatarURL(),
        },
        event: {
          name: event,
          picture,
        },
        name: member.user.username,
        avatar: member.user.avatarURL({ format: 'png' }),
      }

      const vc = await agent.createVerifiableCredential({
        save: true,
        proofFormat: 'jwt',
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'Attendance'],
          issuer: { id: issuer.did },
          issuanceDate: new Date().toISOString(),
          credentialSubject,
        },
      })

      try {
        const privateEmbed = getMessageEmbedFromVC(vc, true)
        await member.send({
          content: 'You received attendance credential',
          embeds: [privateEmbed],
        })
      } catch (e) {
        //
      }
    })

    await interaction.reply({
      content: `Issued ${members.size} credentials`,
      ephemeral: true,
    })
  },
} as CommandHandler
