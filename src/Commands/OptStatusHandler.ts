import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
import UserDatabaseChecker from "../UserDatabaseChecker.js";
const logger = log4js.getLogger('OptStatusHandler.ts');
logger.level = 'debug';


class OptStatusHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient)
    {
        const user = interaction.user;
        const optStatus = interaction.options.get('opt') as Discord.CommandInteractionOption; // boolean
        await UserDatabaseChecker.ensureUserExists(user.id, prismaClient);
        //if optStatus is null, then the user is requesting their current opt status
        if (optStatus === null)
        {
            logger.debug(`User ${user.id} is requesting their current Opted-In status`);
            await interaction.reply({
                ephemeral: true,
                content: `Your current Opted-In status is ${await this.getOptStatus(user.id, prismaClient)}`
            });
            return;
        } else {
            await prismaClient.user.update({
                where: {
                    id: parseInt(user.id)
                },
                data: {
                    mode: optStatus.value ? 'OPTED_IN' : 'OPTED_OUT'
                }
            });
            await interaction.reply({
                ephemeral: true,
                content: `Your Opted-In status has been set to ${optStatus.value ? 'OPTED_IN' : 'OPTED_OUT'}`
            });
            logger.info(`User ${user.id} has set their Opted-In status to ${optStatus.value ? 'OPTED_IN' : 'OPTED_OUT'}`);
            return;
        }
        
    }

    static async getOptStatus(userId: string, prismaClient: PrismaClient): Promise<boolean>
    {
        const user = await prismaClient.user.findUnique({
            where: {
                id: parseInt(userId)
            }
        });
        if (user === null) {
            logger.error(`User ${userId} does not exist`);
            return false;
        }
        return user.mode === 'OPTED_IN';
    }
}

export default OptStatusHandler;