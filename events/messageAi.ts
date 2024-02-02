import { Event } from "../interfaces/event";
import { Attachment, BaseInteraction, ChannelType, Message } from "discord.js";

let event: Event = {
  name: "messageCreate",

  async run(client, message: Message) {
    if (message.channel.type === ChannelType.DM) return;
    if (message.channel.id !== client.config.aiChannelId) return;
    if (message.author.bot) return;
    await message.channel.sendTyping();
    let attachment: Attachment | null =
      [
        ...message.attachments
          .filter((a: Attachment) => a.contentType?.startsWith("image"))
          .values(),
      ][0] || null;

    let response = await client.ai.generateText(message.content, attachment);

    if (!response) {
      await message.react("❌");
      return;
    }
    await message.reply(response);
  },
};

export default event;
export { event };
