import { SlashCommandBuilder } from '@discordjs/builders'
import { Channel, CommandInteraction, Guild, MessageEmbed, TextChannel, Message, MessageAttachment, MessageActionRow, MessageButton, GuildMemberRoleManager } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import { getMessageEmbedFromVC } from '../utils/embeds'
import Debug from 'debug'
import yaml from 'yaml'

const debug = Debug('discord:kudos')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export-roles')
    .setDescription('Issues role credentials'),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    //console.dir(interaction, { depth: 10 })

    if (!interaction.inGuild()) return

    const { client, member, user } = interaction

    const issuer = await agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS as string,
    })

    const holder = await agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS + ':discord:' + member.user.id,
    })

    const roles = member.roles as GuildMemberRoleManager

    roles.cache.filter(role => role.name !== '@everyone').each(async (role) => {
      const guild = role.guild

      const credentialSubject = {
        name: role.name,
        color: role.color,
        guild: {
          id: guild.id,
          name: guild.name,
          avatar: guild.iconURL({ format: 'png' }) || '',
        },
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
          type: ['VerifiableCredential', 'Role'],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
        },
      })

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

        await user.send({
          content: 'You received Role credential',
          embeds: [privateEmbed],
          files: [attachment],
          components: [row]
        })
      } catch (e) {
        //
      }

    })

    await interaction.reply({content: 'Check your DMs', ephemeral: true})
  },
} as CommandHandler
