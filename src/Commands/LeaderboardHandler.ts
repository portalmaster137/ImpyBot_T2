import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
import UserDatabaseChecker from "../UserDatabaseChecker.js";
const logger = log4js.getLogger('DrainHandler.ts');
logger.level = 'debug';

class LeaderboardHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient) {
        //get the top 5 users by total xp
        const topUsers = await prismaClient.user.findMany({
            orderBy: {
                xp: 'desc'
            },
            take: 5
        });

        //we need to get the usernames of the users, but all we have is their id

        const users = await Promise.all(topUsers.map(async (user) => {
            const nickname = await interaction.client.users.cache.get(user.id.toString())?.username;
            return {
                username: nickname ?? 'Unknown',
                xp: user.xp
            }
        }));

        //make a pretty embed

        const embed = new Discord.EmbedBuilder()
            .setTitle('Top 5 Users')
            .setDescription('The top 5 users by total XP')
            .setColor(0x00FF00)
            .setFields({
                name: '1st',
                value: `${users[0].username} - ${users[0].xp} XP`
            },
            {
                name: '2nd',
                value: `${users[1].username} - ${users[1].xp} XP`
            },
            {
                name: '3rd',
                value: `${users[2].username} - ${users[2].xp} XP`
            },
            {
                name: '4th',
                value: `${users[3].username} - ${users[3].xp} XP`
            },
            {
                name: '5th',
                value: `${users[4].username} - ${users[4].xp} XP`
            
            })
            .setTimestamp()
            .setFooter({
                text: 'ImpyBot Made by Porta.'
            });

        await interaction.reply({
            embeds: [embed]
        })
    }
}

export default LeaderboardHandler;