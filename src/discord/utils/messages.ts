import { IMessage } from '@veramo/core'
import { MessageAttachment, MessageOptions } from 'discord.js'
import yaml from 'yaml'

export const transformDIDCommToDiscord = (message: IMessage): MessageOptions => {
  const file = Buffer.from(yaml.stringify(message))
  const attachment = new MessageAttachment(file, 'didcomm-message.yaml')

  return {
    content: 'You received a DIDComm message',
    files: [attachment],
  }
}
