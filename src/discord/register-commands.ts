import { config } from 'dotenv'
config()
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

if (!process.env.DISCORD_TOKEN) throw Error('DISCORD_TOKEN is missing')
if (!process.env.DISCORD_CLIENT_ID) throw Error('DISCORD_CLIENT_ID is missing')
if (!process.env.DISCORD_GUILD_ID) throw Error('DISCORD_GUILD_ID is missing')


const commands = [
  {
    name: 'kudos',
    description: 'Issues kudos credential',
    options: [
      {
        type: 6,
        name: 'to',
        description: 'Who are you giving kudos to?',
        required: true
      },
      {
        type: 3,
        name: 'kudos',
        description: 'Ex: For being so awesome!',
        required: true,
        choices: undefined
      }
    ]
  },
  {
    name: 'Publish in Metaverse',
    type: 3
  }
];



  
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID as string,
        process.env.DISCORD_GUILD_ID as string),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();