import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";
import UserDatabaseChecker from "./UserDatabaseChecker.js";

const logger = log4js.getLogger('MessageHandler.ts');
logger.level = 'debug';


class MessageHandler {
    public static async handleMessage(_message: any, prismaClient: PrismaClient) {
        //For every 3-5 characters in message, add 1 xp.
        //we know the author is not a bot, so we can safely cast it to a user
        const message = _message as Discord.Message;
        const user = message.author as Discord.User;

        if (user.bot) return;

        await UserDatabaseChecker.ensureUserExists(user.id, prismaClient);

        let prismaUser = await prismaClient.user.findUnique({
            where: {
                id: parseInt(user.id)
            }
        });
        if (prismaUser?.mode === 'OPTED_OUT' || prismaUser?.locked === true) {
            //logger.debug(`User ${user.id} is opted out, not giving xp`);
            return;
        };
        
        await prismaClient.user.update({
            where: {
                id: parseInt(user.id)
            },
            data: {
                lastMessage: new Date()
            }
        })

        //logger.debug(`Handling message from ${user.id}`);
        const content = message.content;
        
        //we need to check if the message is spam
        //if the message is spam, we do not want to give xp
        //if the message contains %60 caps or more
        if (content.length > 450) {
            const caps = content.match(/[A-Z]/g);
            if (caps !== null) {
                const capsPercentage = caps.length / content.length;
                if (capsPercentage >= 0.6) {
                    logger.debug(`User ${user.id} sent a spam message`);
                    return;
                }
            }
        }
        //if it's more then 1500 characters, it's likely spam
        if (content.length > 1200) {
            logger.debug(`User ${user.id} sent a spam message`);
            return;
        }


        //every 4 characters is 1 xp
        let xp = Math.floor(content.length / 4);

        //cap xp to 200 per message
        if (xp > 200) {
            logger.debug(`User ${user.id} sent a message that would give more then 200 xp`);
            xp = 200;
        }

        //if message has an image or other attachment, add 50 xp
        if (message.attachments.size > 0) {
            xp += 50;
        }

        //logger.debug(`User ${user.id} gained ${xp} xp`);
        try {
            await prismaClient.user.update({
                where: {
                    id: parseInt(user.id)
                },
                data: {
                    xp: {
                        increment: xp
                    }
                }
            });
        } catch (err) {
            logger.error(`Failed to update user ${user.id}`);
            logger.error(err);
        }
        
    }
}

export default MessageHandler;