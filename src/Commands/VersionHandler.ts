import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
const logger = log4js.getLogger('DrainHandler.ts');
logger.level = 'debug';
import * as ChildProcess from "child_process";

const MAJOR_VERSION = 1;
const MINOR_VERSION = 2;
const PATCH_VERSION = 0;

class VersionHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient) {

        const ghash = ChildProcess.execSync('git rev-parse HEAD').toString().trim();
        const ccount = ChildProcess.execSync('git rev-list --count HEAD').toString().trim();

        await interaction.reply({
            ephemeral: true,
            content: `Version ${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}\nGit hash: ${ghash}\nCommit Count: ${ccount}`
        });
    }
}

export default VersionHandler;