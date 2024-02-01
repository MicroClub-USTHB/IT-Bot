import { Event } from "../interfaces/event";
import { BaseInteraction, ChannelType, InteractionType } from "discord.js";

let event: Event = {
  name: "interactionCreate",
  async run(client, interaction: BaseInteraction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return;
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.channel || interaction.channel.type == ChannelType.DM)
      return;
    /*
    if (interaction.channel.parentId !== client.config.itCategoryId) {
      await interaction.reply({
        content: "This command can only be used in the IT channels!",
        ephemeral: true,
      });
      return;
    }
*/
    let command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        content: "The command you are trying to execute does not exist!",
        ephemeral: true,
      });
      return;
    }
    if (command.defer) {
      await interaction.deferReply({ ephemeral: command.ephemeral });
    }
    try {
      await command.run(client, interaction);
    } catch (error) {
      console.log(error);
      interaction[interaction.deferred ? "editReply" : "reply"]({
        content: "There was an error while executing this command!",
      });
    }
  },
};

export default event;
export { event };
