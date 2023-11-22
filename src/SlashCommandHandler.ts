import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
import StatCommandHandler from "./Commands/StatCommandHandler.js";
enum SlashCommandName {
    PING = 'ping',
    STATS = 'stats',
}

const logger = log4js.getLogger('SlashCommandHandler.ts');
logger.level = 'debug';

class SlashCommandHandler {

    static async HandleSlashCommand(_interaction: any, _prismaClient: PrismaClient) {
        const interaction = _interaction as Discord.CommandInteraction;

        logger.debug(`Handling slash command ${interaction.commandName}`);
        switch (interaction.commandName) {
            case SlashCommandName.PING:
                await interaction.reply('Pong!');
                break;
            case SlashCommandName.STATS:
                await StatCommandHandler.handle(interaction, _prismaClient);
                break;
            default:
                await interaction.reply('Unknown command');
                logger.error(`Unknown slash command ${interaction.commandName}`);
                break;
        }
    }
}

export default SlashCommandHandler;