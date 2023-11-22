import {REST, Routes, SlashCommandBuilder} from "discord.js";
import log4js from "log4js";
import dotenv from "dotenv";

dotenv.config();

const logger = log4js.getLogger('index.ts');
logger.level = 'debug';

if (!process.env.BOT_TOKEN) {
    logger.error("No token provided");
    process.exit(1);
}
if (!process.env.GUILD_ID) {
    logger.error("No guild ID provided");
    process.exit(1);
}
if (!process.env.CLIENT_ID) {
    logger.error("No client ID provided");
    process.exit(1);
}

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),

    new SlashCommandBuilder().setName('stats').setDescription('Gets your or another user\'s stats')
    .addUserOption(option => option.setName('user').setDescription('The user to get stats for, defaults to you.').setRequired(false)),

].map(command => command.toJSON());

const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        logger.info('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string),
            {body: commands},
        );

        logger.info(`Successfully reloaded ${commands.length} application (/) commands.`);
    } catch (error) {
        logger.error(error);
    }
})();