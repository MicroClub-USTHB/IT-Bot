import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  InlineDataPart,
  ChatSession,
} from "@google/generative-ai";
import { Attachment, Collection } from "discord.js";
import axios from "axios";
import config from "../config";
class AI {
  protected ai: GoogleGenerativeAI | null;
  protected apiKeys: string[] = [];
  protected apiCall: number = 0;
  protected apiCallLimit: number = 1000;
  protected apiKeysIndex: number = 0;
  protected currentSession: ChatSession | null = null;
  public sessions = new Collection<string, ChatSession>();

  constructor(apiKeys: string[] = []) {
    this.ai = apiKeys
      ? new GoogleGenerativeAI(apiKeys[this.apiKeysIndex])
      : null;
    this.apiKeys = apiKeys;
  }

  public setApiKey(...apiKeys: string[]): void {
    this.apiKeys = apiKeys;
    this.ai = new GoogleGenerativeAI(apiKeys[this.apiKeysIndex]);
  }
  public async setSession(session: ChatSession | null): Promise<void> {
    this.currentSession = session;
  }

  private getModel(model: string) {
    if (!this.ai) return null;
    return this.ai.getGenerativeModel({
      model /*
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],*/,

      generationConfig: {
        maxOutputTokens: 3 * 100,
      },
    });
  }

  public async getSession(): Promise<ChatSession | null> {
    let model = this.getModel("gemini-pro");
    if (!model) return null;
    let session = await model.startChat();

    return session;
  }

  public async generateText(
    text: string,
    attachment?: Attachment
  ): Promise<string | null> {
    if (!this.ai) return null;
    const model = this.getModel(
      attachment ? "gemini-pro-vision" : "gemini-pro"
    );
    if (!model) return null;

    if (this.apiCall >= this.apiCallLimit) {
      this.apiKeysIndex++;
      if (this.apiKeysIndex >= this.apiKeys.length) this.apiKeysIndex = 0;

      this.ai = new GoogleGenerativeAI(this.apiKeys[this.apiKeysIndex]);
      this.apiCall = 0;
    }

    /*let note = `respond in short paragraph (10 sentences max),also if the prompt subject is not related with IT or programming, respond with "I'm sorry, I can't help with that,I respond only to IT and programming related questions"`;
    let note2 = `if the prompt has a question that means "who is the best programmer/devloper/coder" respond with "Of course, it is <@${config.owners[0]}>!"`;
    text += `\n${note}\n${note2}`;*/

    /*if (attachment) {
      let image = await AI.toImagePart(attachment);
      if (!image) return null;
      this.apiCall++;
      const { response } = await model
        .generateContent([text, image])
        .catch((e) => {
          console.log(e);
          return { response: null };
        });

      return response?.text() || null;
    }*/
    this.apiCall++;

    const { response } = this.currentSession
      ? await this.currentSession.sendMessage(text).catch((e) => {
          return { response: null };
        })
      : await model.generateContent(text).catch((e) => {
          return { response: null };
        });

    return response?.text() || null;
  }

  static async toImagePart(
    attachment: Attachment
  ): Promise<InlineDataPart | null> {
    if (!attachment.contentType?.startsWith("image")) return null;

    let { data: buffer } = (await axios
      .get(attachment.url, { responseType: "arraybuffer" })
      .catch(() => {
        return { data: null };
      })) as { data: Buffer };

    if (!buffer) return null;
    let supported = ["png", "jpeg", "webp", "heic", "heif"];
    return {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType: supported.includes(attachment.contentType.split("/")[1])
          ? attachment.contentType
          : "image/png",
      },
    };
  }
}

export default AI;
export { AI };
