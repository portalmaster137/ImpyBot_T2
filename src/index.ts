import log4js from "log4js";
import dotenv from "dotenv";
import * as Discord from "discord.js";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import SlashCommandHandler from "./SlashCommandHandler.js";
import MessageHandler from "./MessageHandler.js";
const logger = log4js.getLogger('index.ts');
logger.level = 'debug';

dotenv.config();
if (!process.env.BOT_TOKEN) {
    logger.error("No token provided");
    process.exit(1);
}
if (!process.env.GUILD_ID) {
    logger.error("No guild ID provided");
    process.exit(1);
}

const discordClient = new Discord.Client({intents: [
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildPresences,
    "Guilds"
]});

const prismaClient = new PrismaClient();

discordClient.on(Discord.Events.ClientReady, () => {
    logger.info(`Logged in as ${discordClient.user?.tag}!`);
})

discordClient.on(Discord.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;
    await SlashCommandHandler.HandleSlashCommand(interaction, prismaClient);
});

discordClient.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    await MessageHandler.handleMessage(message, prismaClient);
});


discordClient.login(process.env.BOT_TOKEN);