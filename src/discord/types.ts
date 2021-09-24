import { CommandInteraction } from 'discord.js'
import { TAgent, IDIDManager, IResolver } from '@veramo/core'
import { ICredentialIssuer } from '@veramo/credential-w3c'
import { IDataStoreORM } from '@veramo/data-store'

export type ConfiguredAgent = TAgent<IDIDManager & IResolver & ICredentialIssuer & IDataStoreORM>

export interface CommandHandler {
  data: any
  execute: (interaction: CommandInteraction, agent: ConfiguredAgent) => Promise<any>
}
