import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";

const logger = log4js.getLogger('StatCommandHandler.ts');
logger.level = 'debug';

class UserDatabaseChecker {
    static async ensureUserExists(userid: string, prismaClient: PrismaClient) {
        const user = await prismaClient.user.findUnique({
            where: {
                id: parseInt(userid)
            }
        });
        if (user === null) {
            await prismaClient.user.create({
                data: {
                    id: parseInt(userid),
                }
            });
            logger.info(`Created user ${userid}`);
            return true;
        }
        return false;
    }
}

export default UserDatabaseChecker;