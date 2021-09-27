import { MessageEmbed } from 'discord.js'
import { VerifiableCredential } from '@veramo/core'

export const getMessageEmbedFromVC = (vc: VerifiableCredential, details = false): MessageEmbed => {
  switch (vc.type.join(',')) {
    case 'VerifiableCredential,Kudos':
      return getKudosEmbedFromVC(vc, details)
    case 'VerifiableCredential,Attendance':
      return getAttendanceEmbedFromVC(vc, details)
    case 'VerifiableCredential,Award':
      return getAwardEmbedFromVC(vc, details)
    default:
      return new MessageEmbed().setTitle('Unknown VC type')
  }
}

export const getKudosEmbedFromVC = (vc: any, details = false): MessageEmbed => {
  const embed = new MessageEmbed()
    .setColor('#73C394')
    .setAuthor(vc.credentialSubject.author.name, vc.credentialSubject.author.avatar)
    .setTitle('🏆 Kudos to ' + vc.credentialSubject.name)
    .setDescription(vc.credentialSubject.kudos)
    .setThumbnail(vc.credentialSubject.avatar)

  if (details) {
    embed
      .setFooter(
        `${vc.credentialSubject.guild.name} #${vc.credentialSubject.channel.name}`,
        vc.credentialSubject.guild.avatar,
      )
      .setTimestamp(vc.issuanceDate)
  }

  return embed
}

export const getAttendanceEmbedFromVC = (vc: any, details = false): MessageEmbed => {
  const embed = new MessageEmbed()
    .setColor('#73C394')
    .setAuthor(vc.credentialSubject.author.name, vc.credentialSubject.author.avatar)
    .setTitle(vc.credentialSubject.event.name)
    .setDescription(vc.credentialSubject.name)
    .setThumbnail(vc.credentialSubject.avatar)
    .setImage(vc.credentialSubject.event.picture)

  if (details) {
    embed
      .setFooter(
        `${vc.credentialSubject.guild.name} #${vc.credentialSubject.channel.name}`,
        vc.credentialSubject.guild.avatar,
      )
      .setTimestamp(vc.issuanceDate)
  }

  return embed
}

export const getAwardEmbedFromVC = (vc: any, details = false): MessageEmbed => {
  const embed = new MessageEmbed()
    .setColor('#73C394')
    .setAuthor(vc.credentialSubject.author.name, vc.credentialSubject.author.avatar)
    .setTitle(`${vc.credentialSubject.emoji} ${vc.credentialSubject.award}`)
    .setDescription(vc.credentialSubject.name)
    .setThumbnail(vc.credentialSubject.avatar)

  if (details) {
    embed
      .setFooter(
        `${vc.credentialSubject.guild.name} #${vc.credentialSubject.channel.name}`,
        vc.credentialSubject.guild.avatar,
      )
      .setTimestamp(vc.issuanceDate)
  }

  return embed
}