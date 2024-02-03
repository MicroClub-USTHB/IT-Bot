import { GatewayIntentBits, Partials } from "discord.js";
import { Client } from "./Base/client";
import { config } from "dotenv";
import Logger from "./Util/logger";
config();
let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
  ],
});

client.start({
  token: `${process.env.token}`,
  aiToken: `${process.env.apiKey}`,
  eventsDir: "events",
  commandsDir: "commands",
  debug: true,
});
process.on("unhandledRejection", (error: Error) => {
  Logger.logError(error);
});

process.on("uncaughtExceptionMonitor", (error: Error) => {
  Logger.logError(error);
});

process.on("unhandledRejection", (error: Error) => {
  Logger.logError(error);
});
