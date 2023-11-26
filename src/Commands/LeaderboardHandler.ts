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

        let users: { name: string, value: string }[] = [];

        topUsers.forEach(async (user) => {
            let username = await interaction.client.users.cache.filter(u => u.id === user.id.toString()).first()?.username;
            if (username === undefined) {
                username = 'Unknown';
            }
            users.push({
                name: username,
                value: user.xp.toString()
            })
        })

        const embed = new Discord.EmbedBuilder()
            .setTitle('Top 5 Users')
            .setDescription('The top 5 users by total XP')
            .setColor(0x00FF00)
            .setFields(
                {
                    name: 'First Place',
                    value: users[0].name + ' - ' + users[0].value
                },
                {
                    name: 'Second Place',
                    value: users[1].name + ' - ' + users[1].value
                },
                {
                    name: 'Third Place',
                    value: users[2].name + ' - ' + users[2].value
                },
                {
                    name: 'Fourth Place',
                    value: users[3].name + ' - ' + users[3].value
                },
                {
                    name: 'Fifth Place',
                    value: users[4].name + ' - ' + users[4].value
                }
            )
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