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
          type: ActivityType.Playing,
        },
      ],
      status: "dnd",
    });
  },
};

export default event;
export { event };
