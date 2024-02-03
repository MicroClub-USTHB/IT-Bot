import { Event } from "../interfaces/event";
import { ActivityType } from "discord.js";

let event: Event = {
  name: "ready",
  async run(client) {
    console.log(`Logged in as ${client.user?.tag}!`);
    client.user?.setPresence({
      activities: [
        {
          name: "MC IT Bot",
          state: "waiting for commands!",
          type: ActivityType.Custom,
        },
      ],
      status: "dnd",
      afk: false,
    });
  },
};

export default event;
export { event };
