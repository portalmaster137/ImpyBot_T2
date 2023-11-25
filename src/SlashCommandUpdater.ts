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

    new SlashCommandBuilder().setName('donate')
    .setDescription('Get a link to donate to the bot\'s creator uwu. helps pays the bills as well'),

    new SlashCommandBuilder().setName('optstatus')
    .setDescription('Opt in or out of the main bot\'s draining function. Leave blank to get your current status.')
    .addBooleanOption(option => option.setName('opt').setDescription('Whether to opt in or out. False is Opt-Out. True is Opt-In').setRequired(true)),

    new SlashCommandBuilder().setName('drain')
    .setDescription('Draaaain a poor user of their precious xp~')
    .addUserOption(option => option.setName('user').setDescription('The user to drain.').setRequired(true)),

    new SlashCommandBuilder().setName('version')
    .setDescription('Get the current version of the bot.'),

].map(command => command.toJSON());

const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        logger.info('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID as string),
            {body: []},
        );

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string),
            {body: commands},
        );


        logger.info(`Successfully reloaded ${commands.length} application (/) commands.`);
    } catch (error) {
        logger.error(error);
    }
})();