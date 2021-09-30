import { IAgentPlugin, IMessage } from '@veramo/core'
import { client } from './client'
import { ConfiguredAgent } from './types'
import yaml from 'yaml'
import { MessageAttachment } from 'discord.js'

interface IRequiredContext {
  agent: ConfiguredAgent
}

export class DiscordMessageMediator implements IAgentPlugin {

  readonly eventTypes = ['validatedMessage']

  public async onEvent(event: { type: string; data: any }, context: IRequiredContext) {

    if (event.type === 'validatedMessage') {
      const message: IMessage = event.data
      if (message.to?.startsWith('did:web:' + process.env.DISCORD_BOT_DID_ALIAS + ':discord:')) {
        const discordId = message.to.split(':').pop()
        if (discordId) {
          const recepient = await client.users.fetch(discordId)
          const file = Buffer.from(yaml.stringify(message))
          const attachment = new MessageAttachment(file, 'didcomm-message.yaml')
    
          recepient?.send({
            content: 'You received a DIDComm message',
            files: [attachment]
          })
        }
      }
    }
  }

}