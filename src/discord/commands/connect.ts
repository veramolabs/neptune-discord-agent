import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import Debug from 'debug'
import Canvas from 'canvas'
import QRCode from '@propps/qrcode'
import WalletConnect from '@walletconnect/client'


const debug = Debug('discord:connect')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect')
    .setDescription('Connect your self sovereign DID')
    .addStringOption((option) =>
      option.setName('did').setDescription('did:ens:vitalik.eth').setRequired(false),
    ),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    const connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
      clientMeta: {
        description: 'Neptune discord bot',
        url: 'https://neptune.eu.ngrok.io',
        icons: ['https://cdn.discordapp.com/avatars/890198780182417428/e3d08ba122ed13d2c3e59bba6817f91f.png?size=240'],
        name: 'Neptune',
      },
    })

    if (!connector.connected) {
      // create new session
      await connector.createSession()
    }

    // Subscribe to connection events
    connector.on('connect', (error, payload) => {
      if (error) {
        throw error
      }

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0]

      const embed = new MessageEmbed()
      .setColor('#73C394')
      .setTitle(`Success!`)
      .setDescription(`did:ethr:0x${chainId}:${accounts[0]}`)
  
      interaction.editReply({
        embeds: [embed]
      })
    })

    const embed = new MessageEmbed()
    .setColor('#e3e5e8')
    .setTitle('Scan this QR code with your wallet')
    .setImage('https://neptune.eu.ngrok.io/qrcode/' + encodeURIComponent(connector.uri))

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    })
  },
} as CommandHandler
