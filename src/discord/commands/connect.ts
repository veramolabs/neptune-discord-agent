import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js'
import { CommandHandler, ConfiguredAgent } from '../types'
import Debug from 'debug'
import Canvas from 'canvas'
import QRCode from '@propps/qrcode'

const debug = Debug('discord:connect')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect')
    .setDescription('Connect your self sovereign DID')
    .addStringOption((option) =>
      option.setName('did').setDescription('did:ens:vitalik.eth').setRequired(false),
    ),
  async execute(interaction: CommandInteraction, agent: ConfiguredAgent) {
    
    const dataUrl = await QRCode.toDataURL('wc:bf8b26aa-98ee-4d55-8fdc-dfa37fdbab1a@1?bridge=https%3A%2F%2Fc.bridge.walletconnect.org&key=162156420b87f84688d14d560b35cd298765f263cb7b9f16f77f490f60d87bc7')
    const qrCodeImage = await Canvas.loadImage(dataUrl);

    const canvas = Canvas.createCanvas(500, 500);
		const context = canvas.getContext('2d');
    context.drawImage(qrCodeImage, 0, 0, canvas.width, canvas.height);

    const attachment = new MessageAttachment(canvas.toBuffer(), 'wallet-connect.png');

    await interaction.reply({
      content: '**Scan this QR code with your wallet**',
      files: [attachment],
      ephemeral: true,
    })
  },
} as CommandHandler
