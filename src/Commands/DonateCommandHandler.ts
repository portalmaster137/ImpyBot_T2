import log4js from "log4js";
import * as Discord from "discord.js";
import { PrismaClient } from "@prisma/client";

const logger = log4js.getLogger('StatCommandHandler.ts');
logger.level = 'debug';

class DonateCommandHandler {
    static async handle(interaction: Discord.CommandInteraction, prismaClient: PrismaClient) {
        await interaction.reply({
            ephemeral: true,
            content: 'I Have sent you a DM with a link to donate to the bot\'s creator!'
        });
        await interaction.user.send('https://donate.stripe.com/cN28A31OY8jZbcI7sF');
    }
}

export default DonateCommandHandler;