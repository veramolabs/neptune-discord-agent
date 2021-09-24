import { MessageEmbed } from 'discord.js'

export const getMessageEmbedFromVC = (vc: any, details = false): MessageEmbed => {
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
