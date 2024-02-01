import { Command } from "../interfaces/command";
import { SlashCommandBuilder } from "discord.js";
let command: Command = {
  data: new SlashCommandBuilder()
    .setName("w3schools")
    .setDescription("Searches w3schools for a query")
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName("query").setDescription("search query").setRequired(true)
    ),
  defer: true,
  run: async (client, interaction) => {
    return true;
  },
};
export default command;
export { command };
