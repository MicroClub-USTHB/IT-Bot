import { Command } from "../interfaces/command";
import { SlashCommandBuilder } from "discord.js";
let command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .setDMPermission(false),
  defer: true,
  run: async (client, interaction) => {
    interaction.user;
    await interaction.editReply({
      embeds: [
        client.embed
          .make({
            description: `Pong! ${client.ws.ping}ms`,
          })
          .author(interaction.user)
          .color("Gold"),
      ],
    });
    return true;
  },
};
export default command;
export { command };
