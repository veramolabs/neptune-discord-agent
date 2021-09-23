import { CommandInteraction } from 'discord.js'

export interface CustomCommandHandler {
  data: any
  execute: (interaction: CommandInteraction, agent: any) => Promise<any>
}
