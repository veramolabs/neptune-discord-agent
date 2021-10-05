import { IAgentPlugin, IMessage } from '@veramo/core'
import { client } from './client'
import { ConfiguredAgent } from './types'
import { transformDIDCommToDiscord } from './utils/messages'
interface IRequiredContext {
  agent: ConfiguredAgent
}

export class DiscordMessageMediator implements IAgentPlugin {
  readonly eventTypes = ['validatedMessage']

  public async onEvent({ data }: { data: IMessage }, context: IRequiredContext) {
    if (data.to?.startsWith('did:web:' + process.env.DISCORD_BOT_DID_ALIAS + ':discord:')) {
      const discordId = data.to.split(':').pop()
      if (discordId) {
        const recipient = await client.users.fetch(discordId)
        recipient?.send(transformDIDCommToDiscord(data))
      }
    }
  }
}
