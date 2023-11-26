import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
import UserDatabaseChecker from "../UserDatabaseChecker.js";
const logger = log4js.getLogger('DrainHandler.ts');
logger.level = 'debug';

class LockHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient) {
        //get the user to lock
        const targetUser = interaction.options.get('user')?.user as Discord.User;
        const bool = interaction.options.get('lock')?.value as boolean;

        await UserDatabaseChecker.ensureUserExists(targetUser.id, prismaClient);

        await prismaClient.user.update({
            where: {
                id: parseInt(targetUser.id)
            },
            data: {
                locked: bool
            }
        })

        await interaction.reply({
            ephemeral: true,
            content: `User ${targetUser.id} has been ${bool ? 'locked' : 'unlocked'}`
        });

    }
}

export default LockHandler;