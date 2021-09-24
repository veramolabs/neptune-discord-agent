import { CommandInteraction } from 'discord.js'
import { TAgent, IDIDManager, IResolver} from '@veramo/core'

export type ConfiguredAgent = TAgent<IDIDManager & IResolver>

export interface CommandHandler {
  data: any
  execute: (interaction: CommandInteraction, agent: ConfiguredAgent) => Promise<any>
}
