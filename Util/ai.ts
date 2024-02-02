import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  InlineDataPart,
} from "@google/generative-ai";
import { Attachment } from "discord.js";
import axios from "axios";
class AI {
  protected ai: GoogleGenerativeAI | null;
  protected apiKeys: string[] = [];
  protected apiCall: number = 0;
  protected apiCallLimit: number = 1000;
  protected apiKeysIndex: number = 0;
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
      generationConfig: {},
    });
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

    if (attachment) {
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
    }
    this.apiCall++;
    const { response } = await model.generateContent(text).catch((e) => {
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
