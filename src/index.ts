import log4js from "log4js";
const logger = log4js.getLogger('index.ts');
logger.level = 'debug';

import dotenv from "dotenv";
dotenv.config();
if (!process.env.BOT_TOKEN) {
    logger.error("No token provided");
    process.exit(1);
}