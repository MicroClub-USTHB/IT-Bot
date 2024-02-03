import { Event } from "../interfaces/event";
import { Attachment, ChannelType, Message } from "discord.js";
import { Util } from "../Util/util";
import Logger from "../Util/logger";

let event: Event = {
  name: "messageCreate",

  async run(client, message: Message) {
    try {
      if (
        message.channel.type !== ChannelType.GuildText &&
        message.channel.type !== ChannelType.PublicThread
      )
        return;
      if (
        message.channel.id !== client.config.aiChannelId &&
        message.channel.type !== ChannelType.PublicThread
      )
        return;
      if (message.author.bot) return;

      let mention = new RegExp(`<@!?${client.user?.id}>`);
      let repliedMessage = message.channel.messages.cache.get(
        message.reference?.messageId || ""
      );
      if (
        !mention.test(message.content) &&
        repliedMessage?.author.id !== client.user?.id
      )
        return;

      await message.channel.sendTyping();
      let attachment: Attachment | null =
        [
          ...message.attachments
            .filter((a: Attachment) => a.contentType?.startsWith("image"))
            .values(),
        ][0] || null;
      let prompt = message.content.replace(mention, "").trim();
      if (prompt === "session") {
        if (message.channel.type !== ChannelType.GuildText) return;

        let session = await client.ai.getSession();
        if (!session) {
          await message.react("❌");
          return;
        }

        let thread = await message.channel.threads.create({
          name: `${message.author.displayName} session`,
          autoArchiveDuration: 60,
          type: ChannelType.PublicThread,
        });
        client.ai.sessions.set(thread.id, session);
        await thread.send(
          `**Session started by ${message.author} <t:${Math.floor(
            Date.now() / 1000
          )}>**`
        );
        return;
      }

      let session = client.ai.sessions.get(message.channel.id) || null;

      if (message.channel.type === ChannelType.PublicThread) {
        let owner = message.channel.ownerId;
        if (!session && owner === client.user?.id) {
          await message.channel.send("Session not found!");
          await message.channel.setArchived(true);
          //await message.channel.delete();
          return;
        }
      }

      client.ai.setSession(session);
      let response = await client.ai.generateText(prompt, attachment);

      if (!response) {
        await message.react("❌");
        return;
      }

      let texts = Util.smartSplit(response, 2000);
      let msg = await message.reply(texts[0]).catch(() => null);
      if (!msg) return;

      texts.shift();
      for (let text of texts) {
        msg = await msg.reply(text);
      }
    } catch (e: any) {
      Logger.logError(e);
    }
  },
};

export default event;
export { event };
