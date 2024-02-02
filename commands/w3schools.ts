import { Command } from "../interfaces/command";
import { Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Search } from "../Util/searching";
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
    let query = interaction.options.get("query")?.value as string;
    let data = await Search.w3schools(query);
    if (!data) {
      await interaction.editReply(`No results found for ${query}`);

      return true;
    }
    let embed = new EmbedBuilder()
      .setTitle(data.title)
      .setURL(data.url)
      .setDescription(data.description)
      .setColor(Colors.Green)
      .setThumbnail(
        "https://www.w3schools.com/images/w3schools_logo_436_2.png"
      );

    if (data.snippet)
      embed.setDescription(
        `${data.description}\n\n\`\`\`${data.highlight || ""}\n${
          data.snippet
        }\`\`\``
      );

    await interaction.editReply({ embeds: [embed] });

    return true;
  },
};
export default command;
export { command };
