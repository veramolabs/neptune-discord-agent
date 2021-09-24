import { SlashCommandBuilder } from '@discordjs/builders'
import { Channel, CommandInteraction, Guild, MessageEmbed, TextChannel } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import Debug from 'debug'

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
    // console.dir(interaction, { depth: 10 })

    if (!interaction.inGuild()) return;

    const { user, client, channelId, guildId } = interaction
    const channel = await client.channels.fetch(channelId) as TextChannel
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
      provider: 'did:ethr',
      alias: user.id
    })

    const holder = await agent.didManagerGetOrCreate({
      provider: 'did:ethr',
      alias: recipient.id
    })

    const credentialSubject = {
      id: holder.did,
      channel: {
        id: channel.id,
        name: channel.name,
        nsfw: channel.nsfw,
      },
      guild: {
        id: guild.id,
        name: guild.name
      },
      kudos: kudos,
    }

    await agent.createVerifiableCredential({
      save: true,
      proofFormat: 'jwt',
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'Kudos'],
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        credentialSubject,
      },
    })

    const publicEmbed = new MessageEmbed()
      .setColor('#73C394')
      .setAuthor(user.username, user.displayAvatarURL())
      .setTitle('🏆 Kudos to ' + recipient.username)
      .setDescription(kudos)
      .setThumbnail(recipient.displayAvatarURL())

    // Sending this in a DM
    const privateEmbed = new MessageEmbed()
      .setColor('#73C394')
      .setAuthor(user.username, user.displayAvatarURL())
      .setTitle('🏆 Kudos to ' + recipient.username)
      .setDescription(kudos)
      .setThumbnail(recipient.displayAvatarURL())
      .setFooter(`${guild.name} #${channel?.name}`, guild.iconURL({format: 'png'}) || '')
      .setTimestamp()

    try {
      await recipient.send({
        content: 'You received kudos',
        embeds: [privateEmbed]
      })
    } catch (e) {
      //
    }

    await interaction.reply({
      embeds: [publicEmbed],
    })


  },
} as CommandHandler
