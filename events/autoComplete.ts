import { Event } from "../interfaces/event";
import { BaseInteraction, ChannelType, InteractionType } from "discord.js";
import Search from "../Util/searching";
let event: Event = {
  name: "interactionCreate",
  async run(client, interaction: BaseInteraction) {
    if (!interaction.isAutocomplete()) return;
    if (interaction.commandName !== "package") return;
    let registry = interaction.options.get("registry")?.value as string;

    if (!registry) return;

    let query = interaction.options.get("package")?.value as string;
    if (!query) query = "a";
    let packagesNames = null;

    if (registry == "npm") packagesNames = await Search.npmAutoComplete(query);
    else if (registry == "pypi")
      packagesNames = await Search.pypiAutoComplete(query);
    else if (registry == "cargo")
      packagesNames = await Search.cargoAutoComplete(query);

    if (!packagesNames) return;
    let choices = packagesNames.map((p) => ({
      name: `${p} (${registry})`,
      value: p,
    }));
    await interaction.respond(choices);
  },
};

export default event;
export { event };
