import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
import UserDatabaseChecker from "../UserDatabaseChecker.js";
import { getLevelFromXPAmount, xpToNextLevel } from "../Utils.js";

const logger = log4js.getLogger('StatCommandHandler.ts');
logger.level = 'debug';

class StatCommandHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient) {
        let targetUser = interaction.options.getUser('user') ?? interaction.user;
        logger.debug(`Getting stats for ${targetUser.username}`);
        await UserDatabaseChecker.ensureUserExists(targetUser.id, prismaClient);
        const user = await prismaClient.user.findUnique({
            where: {
                id: parseInt(targetUser.id)
            }
        });
        if (user === null) {
            logger.error(`User ${targetUser.id} does not exist`);
            await interaction.reply('User does not exist');
            return;
        }
        //embed

        const embed = new Discord.EmbedBuilder()
        .setTitle(`${targetUser.username}'s stats`)
        .setImage(targetUser.avatarURL() ?? 'https://cdn.discordapp.com/attachments/1178370064509055007/1178385205334130748/Screenshot_2023-11-22_075217.png')
        .addFields({
            name: 'XP',
            value: user.xp.toString(),
        },
        {
            name: 'Level',
            value: getLevelFromXPAmount(user.xp).toString(),
        },
        {
            name: 'XP To Next Level',
            value: xpToNextLevel(user.xp).toString(),
        },
        {
            name: 'Opted-In',
            value: user.mode === 'OPTED_IN' ? 'Yes' : 'No',
        }
        ).setTimestamp()
        .setFooter({text: 'ImpyBot Made by Porta.'});

        await interaction.reply({embeds: [embed]});

       
    }
}

export default StatCommandHandler;