import { Command } from "../interfaces/command";
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  CacheType,
  Colors,
} from "discord.js";
type t = ChatInputCommandInteraction<CacheType>;
import { Search } from "../Util/searching";
let command: Command = {
  data: new SlashCommandBuilder()
    .setName("package")
    .setDescription("searches for a package on npm/pypi")
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("registry")
        .setDescription("registry")
        .setRequired(true)
        .addChoices(
          ...[
            {
              name: "npm (js)",
              value: "npm",
            },
            {
              name: "pypi (python)",
              value: "pypi",
            },
            {
              name: "cargo (rust)",
              value: "cargo",
            },
          ]
        )
    )
    .addStringOption((option) =>
      option
        .setName("package")
        .setDescription("package name")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  defer: true,
  run: async (client, interaction) => {
    let packageName = interaction.options.get("package")?.value as string;
    let registry = interaction.options.get("registry")?.value as string;

    let packageInfo = null;
    if (registry == "npm") packageInfo = await Search.npm(packageName);
    else if (registry == "pypi") packageInfo = await Search.pypi(packageName);
    else if (registry == "cargo") packageInfo = await Search.cargo(packageName);

    if (!packageInfo) {
      interaction.editReply({ content: "No package found with that name!" });
      return false;
    }
    let keywords = packageInfo.keywords.map((k) => `\`${k}\``).join(", ");
    let color = null;
    if (registry == "npm") color = Colors.Red;
    else if (registry == "pypi") color = Colors.Blue;
    else if (registry == "cargo") color = Colors.Yellow;

    let embed = new EmbedBuilder()
      .setThumbnail(packageInfo.icon)
      .setTitle(packageInfo.name)
      .setURL(packageInfo.url)
      .setColor(color)
      .setDescription(packageInfo.description)
      .addFields({
        name: "Latest Version",
        value: packageInfo.version,
        inline: false,
      });
    if (keywords.length > 0)
      embed.addFields({
        name: "Keywords",
        value: packageInfo.keywords.map((k) => `\`${k}\``).join(", "),
        inline: false,
      });

    await interaction.editReply({ embeds: [embed] });

    return true;
  },
};

export default command;
export { command };
