import { Command } from "../interfaces/command";
import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { Image } from "../Util/canvas";
import { writeFileSync } from "fs";
let command: Command = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("profile command")
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName("user").setDescription("user").setRequired(false)
    ),
  defer: true,
  run: async (client, interaction) => {
    let user = interaction.options.get("user")?.user || interaction.user;
    let member = await interaction.guild?.members
      .fetch({
        user,
        withPresences: true,
      })
      .catch(() => null);
    if (!member) {
      interaction.editReply({ content: "User not found!" });
      return false;
    }

    let profile = await Image.getProfile(member);
    let attachment = new AttachmentBuilder(profile, {
      name: `profile-${member.id}.png`,
    });

    await interaction.editReply({ files: [attachment] });

    return true;
  },
};

export default command;
export { command };
