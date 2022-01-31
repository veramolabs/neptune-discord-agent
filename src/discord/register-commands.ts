import { config } from 'dotenv'
config()
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import fs from 'fs'
import path from 'path'

if (!process.env.DISCORD_TOKEN) throw Error('DISCORD_TOKEN is missing')
if (!process.env.DISCORD_CLIENT_ID) throw Error('DISCORD_CLIENT_ID is missing')
if (!process.env.DISCORD_GUILD_ID) throw Error('DISCORD_GUILD_ID is missing')

const commands = []
const commandFiles = fs
  .readdirSync(path.resolve('./build/discord/commands'))
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(path.resolve(`./build/discord/commands/${file}`))
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)

;(async () => {
  try {
    await rest.put(
      // Routes.applicationCommands(
      //   process.env.DISCORD_CLIENT_ID as string
      // ),
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID as string,
        process.env.DISCORD_GUILD_ID as string,
      ),
      { body: commands },
    )

    console.log('Successfully registered application commands.')
  } catch (error) {
    console.error(error)
  }
})()
