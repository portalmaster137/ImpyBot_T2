import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
const logger = log4js.getLogger('DrainHandler.ts');
logger.level = 'debug';

const MAJOR_VERSION = 1;
const MINOR_VERSION = 0;
const PATCH_VERSION = 0;

class VersionHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient) {
        await interaction.channel?.send({
            content: `Version ${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}`
        });
    }
}

export default VersionHandler;