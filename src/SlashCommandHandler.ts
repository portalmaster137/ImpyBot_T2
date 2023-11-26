import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
import StatCommandHandler from "./Commands/StatCommandHandler.js";
import DonateCommandHandler from "./Commands/DonateCommandHandler.js";
import OptStatusHandler from "./Commands/OptStatusHandler.js";
import DrainHandler from "./Commands/DrainHandler.js";
import VersionHandler from "./Commands/VersionHandler.js";
import UserDatabaseChecker from "./UserDatabaseChecker.js";
import LockHandler from "./Commands/LockHandler.js";
enum SlashCommandName {
    PING = 'ping',
    STATS = 'stats',
    DONATE = 'donate',
    OPTSTATUS = 'optstatus',
    DRAIN = 'drain',
    VERSION = 'version',
    LOCK = 'lock_user'
}

const logger = log4js.getLogger('SlashCommandHandler.ts');
logger.level = 'debug';

class SlashCommandHandler {

    static async HandleSlashCommand(_interaction: any, _prismaClient: PrismaClient) {
        const interaction = _interaction as Discord.CommandInteraction;
        
        await UserDatabaseChecker.ensureUserExists(interaction.user.id, _prismaClient);
        let user = await _prismaClient.user.findUnique({
            where: {
                id: parseInt(interaction.user.id)
            }
        })
        const isUserAdmin = interaction.member?.permissions as Readonly<Discord.PermissionsBitField>;
        if (user?.locked === true && !isUserAdmin.has(Discord.PermissionFlagsBits.Administrator)) {
            logger.debug(`User ${interaction.user.id} is locked, not handling slash command ${interaction.commandName}`);
            await interaction.reply('You are locked out of using ImpyBot. Please contact an admin to get this resolved.');
            return;
        }


        logger.debug(`Handling slash command ${interaction.commandName}`);
        switch (interaction.commandName) {
            case SlashCommandName.PING:
                await interaction.reply('Pong!');
                break;
            case SlashCommandName.STATS:
                await StatCommandHandler.handle(interaction, _prismaClient);
                break;
            case SlashCommandName.DONATE:
                await DonateCommandHandler.handle(interaction, _prismaClient);
                break;
            case SlashCommandName.OPTSTATUS:
                await OptStatusHandler.handle(interaction, _prismaClient);
                break;
            case SlashCommandName.DRAIN:
                await DrainHandler.handle(interaction, _prismaClient);
                break;
            case SlashCommandName.VERSION:
                await VersionHandler.handle(interaction, _prismaClient);
                break;
            case SlashCommandName.LOCK:
                await LockHandler.handle(interaction, _prismaClient);
                break;

            default:
                await interaction.reply('Unknown command');
                logger.error(`Unknown slash command ${interaction.commandName}`);
                break;
        }
    }
}

export default SlashCommandHandler;