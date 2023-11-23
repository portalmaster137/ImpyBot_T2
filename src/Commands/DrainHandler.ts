import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
import UserDatabaseChecker from "../UserDatabaseChecker.js";
const logger = log4js.getLogger('OptStatusHandler.ts');
logger.level = 'debug';

class DrainHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient) {
        const executingUser = interaction.user;
        const targetUser = interaction.options.getUser('user');
        if (targetUser === null) {
            await interaction.reply({
                ephemeral: true,
                content: 'You must specify a user to drain'
            });
            return;
        }
        await UserDatabaseChecker.ensureUserExists(executingUser.id, prismaClient);
        await UserDatabaseChecker.ensureUserExists(targetUser.id, prismaClient);
        const executingUserPrisma = await prismaClient.user.findUnique({
            where: {
                id: parseInt(executingUser.id)
            }
        });
        const targetUserPrisma = await prismaClient.user.findUnique({
            where: {
                id: parseInt(targetUser.id)
            }
        });
        if (
            executingUserPrisma === null ||
            targetUserPrisma === null
        ) {
            logger.error(`User ${executingUser.id} or ${targetUser.id} does not exist`);
            await interaction.reply({
                ephemeral: true,
                content: 'User does not exist'
            });
            return;
        }
        if (executingUserPrisma.mode === 'OPTED_OUT') {
            await interaction.reply({
                ephemeral: true,
                content: 'You are opted out, dummy~'
            });
            return;
        }
        if (targetUserPrisma.mode === 'OPTED_OUT') {
            await interaction.reply({
                ephemeral: true,
                content: 'You cannot drain an opted out user.'
            });
            return;
        }

        //if executing user is also the target user, don't allow it
        if (executingUser.id === targetUser.id) {
            await interaction.reply({
                ephemeral: true,
                content: 'You cannot drain yourself, dummy~'
            });
            return;
        }

        //if the target user last message is more then 60 seconds ago, don't allow it
        const lastMessage = new Date(targetUserPrisma.lastMessage);
        const now = new Date();
        const diff = now.getTime() - lastMessage.getTime();
        const seconds = diff / 1000;
        if (seconds > 60) {
            await interaction.reply({
                ephemeral: true,
                content: 'You cannot drain a user who has not sent a message in the last 60 seconds.'
            });
            return;
        }

        const ResistButton = new Discord.ButtonBuilder()
        .setCustomId('resist')
        .setLabel('Resist!')
        .setStyle(Discord.ButtonStyle.Primary);

        const GiveInButton = new Discord.ButtonBuilder()
        .setCustomId('givein')
        .setLabel('Give In...~')
        .setStyle(Discord.ButtonStyle.Danger);

        const row = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
        .addComponents(ResistButton, GiveInButton);

        logger.info(`Drain attempt from ${executingUser.id} to ${targetUser.id}`);

        const drainMessage = await interaction.reply({
            content: `${executingUser.username} is attempting to drain <@${targetUser.id}> of their precious xp~!`,
            components: [row]
        });
        const filter = (i: { user: { id: string; }; }) => i.user.id === targetUser.id;
        try {
            const confirmation = await drainMessage.awaitMessageComponent({filter: filter, time: 60_000});
            if (confirmation.customId === 'resist') {

                //drain doesn't go through, update the message
                await confirmation.update({
                    content: `${executingUser.username} attempted to drain <@${targetUser.id}> of their precious xp, But they resisted for now~!`,
                    components: []
                });

            } else if (confirmation.customId === 'givein') {
                //drain the user of 1/3 of their xp
                const xpToDrain = Math.floor(parseInt(targetUserPrisma.xp.toString()) / 3);
                await prismaClient.user.update({
                    where: {
                        id: parseInt(targetUser.id)
                    },
                    data: {
                        xp: parseInt(targetUserPrisma.xp.toString()) - xpToDrain
                    }
                });
                //add the xp to the executing user
                await prismaClient.user.update({
                    where: {
                        id: parseInt(executingUser.id)
                    },
                    data: {
                        xp: parseInt(executingUserPrisma.xp.toString()) + xpToDrain
                    }
                });

                //update the message
                await confirmation.update({
                    content: `${executingUser.username} has drained <@${targetUser.id}> of ${xpToDrain} xp~!`,
                    components: []
                });

            }
        } catch (e) {
            //if the user doesn't respond in 60 seconds, the drain goes through~
            //drain the user of 1/5 of their xp though, since they didn't give in
            const xpToDrain = Math.floor(parseInt(targetUserPrisma.xp.toString()) / 5);
            await prismaClient.user.update({
                where: {
                    id: parseInt(targetUser.id)
                },
                data: {
                    xp: parseInt(targetUserPrisma.xp.toString()) - xpToDrain
                }
            });
            //add the xp to the executing user
            await prismaClient.user.update({
                where: {
                    id: parseInt(executingUser.id)
                },
                data: {
                    xp: parseInt(executingUserPrisma.xp.toString()) + xpToDrain
                }
            });

            //we cant update the message because the user didn't respond, so send a new one instead
            await interaction.followUp({
                content: `${executingUser.username} has drained <@${targetUser.id}> of ${xpToDrain} xp~!`,
                components: []
            });
        }

    }
}

export default DrainHandler;