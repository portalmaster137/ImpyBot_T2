import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
const logger = log4js.getLogger('DrainHandler.ts');
logger.level = 'debug';

const MAJOR_VERSION = 1;
const MINOR_VERSION = 1;
const PATCH_VERSION = 1;

class VersionHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient) {

        const ghash = await import('child_process').then((childProcess) => {
            return childProcess.execSync('git rev-parse HEAD').toString().trim();
        });

        await interaction.reply({
            ephemeral: true,
            content: `Version ${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}\nGit hash: ${ghash}`
        });
    }
}

export default VersionHandler;