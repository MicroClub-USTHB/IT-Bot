import { Client } from "../Base/client";

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";

interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandSubcommandGroupBuilder
    | Omit<
        SlashCommandSubcommandGroupBuilder,
        "addSubcommand" | "addSubcommandGroup"
      >;
  defer?: boolean;
  ephemeral?: boolean;
  run: (
    client: Client,
    interaction: ChatInputCommandInteraction,
    ...args: any[]
  ) => Promise<boolean>;
}

export default Command;
export { Command };
