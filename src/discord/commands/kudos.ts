import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { CustomCommandHandler } from '../types'
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
  async execute(interaction: CommandInteraction, agent: any) {
    const from = interaction.member?.user

    console.dir(from, { depth: 10 })

    let fromName = ''
    let fromAvatar = ''
    let toName = ''
    let toAvatar = ''
    if (from) {
      fromAvatar = interaction.client.users.cache.get(from.id)?.displayAvatarURL() || ''
      fromName = interaction.client.users.cache.get(from.id)?.username || ''
    }

    const to = interaction.options.getUser('to')
    if (to) {
      toAvatar = to.displayAvatarURL()
      toName = to.username
    }
    debug(interaction.options.getUser('to'))
    debug(interaction.options.getString('kudos'))
    const exampleEmbed = new MessageEmbed()
      .setColor('#73C394')
      .setTitle('🏆 Kudos to ' + toName)
      // .setURL('https://discord.js.org/')
      .setDescription(interaction.options.getString('kudos') as string)
      .setThumbnail(toAvatar)
      .setTimestamp()
      .setFooter(fromName, fromAvatar)

    try {
    } catch (e) {
      console.dir(e, { depth: 10 })
    }
    await interaction.reply({
      embeds: [exampleEmbed],
    })
  },
} as CustomCommandHandler
