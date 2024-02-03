import Canvas from "@napi-rs/canvas";
import { GuildMember } from "discord.js";

interface ArcOptions {
  x: number;
  y: number;
  radius: number;
  image?: Canvas.Image;
  outLine: number;
  outLineColor?: string;
}

interface TextOptions {
  x: number;
  y: number;
  text: string;
  fonts: string[];
  fontSize: number;
  maxWidth: number;
  color: string;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
  stroke?: boolean;
}

Canvas.GlobalFonts.registerFromPath("./assets/fonts/roboto-bold.ttf", "Roboto");
Canvas.GlobalFonts.registerFromPath("./assets/fonts/rubik-bold.ttf", "Rubik");
class Image {
  protected static drawArc(ctx: Canvas.SKRSContext2D, arcOptions: ArcOptions) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      arcOptions.x,
      arcOptions.y,
      arcOptions.radius,
      0,
      Math.PI * 2,
      true
    );
    ctx.clip();
    ctx.fillStyle = arcOptions.outLineColor || "#202225";

    ctx.fillRect(0, 0, 500, 500);

    ctx.closePath();
    ctx.restore();
    ctx.save();
    if (!arcOptions.image) return;
    ctx.beginPath();
    ctx.arc(
      arcOptions.x,
      arcOptions.y,
      arcOptions.radius - arcOptions.outLine,
      0,
      Math.PI * 2,
      true
    );
    ctx.clip();
    ctx.strokeStyle = "black";

    ctx.drawImage(
      arcOptions.image,
      arcOptions.x - arcOptions.radius + arcOptions.outLine,
      arcOptions.y - arcOptions.radius + arcOptions.outLine,
      arcOptions.radius * 2 - arcOptions.outLine * 2,
      arcOptions.radius * 2 - arcOptions.outLine * 2
    );
    ctx.closePath();
    ctx.restore();
  }

  protected static writeText(
    ctx: Canvas.SKRSContext2D,
    textOptions: TextOptions
  ) {
    do {
      ctx.font = `${textOptions.fontSize}px ${textOptions.fonts.join(", ")}`;

      /*textOptions.fonts
        .map((f) => `${f} ${textOptions.fontSize}px`)
        .join(", ");*/
    } while (
      ctx.measureText(textOptions.text).width > textOptions.maxWidth &&
      textOptions.fontSize--
    );
    ctx.fillStyle = textOptions.color;
    ctx.textAlign = textOptions.align;
    ctx.textBaseline = textOptions.baseline;
    ctx.fillText(textOptions.text, textOptions.x, textOptions.y);
    if (!textOptions.stroke) return;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(textOptions.text, textOptions.x, textOptions.y);
  }

  static async getProfile(member: GuildMember) {
    let width = 500;
    let height = 500;

    let highestRoleColor = member?.displayHexColor || "#202225";
    let statusColor =
      member?.presence?.status === "online"
        ? "#43b581"
        : member?.presence?.status === "dnd"
        ? "#f04747"
        : member?.presence?.status === "idle"
        ? "#faa61a"
        : "#747f8d";

    let canvas = Canvas.createCanvas(width, width);
    let ctx = canvas.getContext("2d");

    ctx.fillStyle = "#202225";

    ctx.fillRect(0, 0, width, height);

    let avatar = await Canvas.loadImage(
      member.displayAvatarURL({ extension: "png", size: 4096 }),
      {
        alt: "avatar",
      }
    );
    let icon = member.guild.icon
      ? await Canvas.loadImage(
          member.guild.iconURL({ extension: "png", size: 4096 }) || "",
          {
            alt: "icon",
          }
        )
      : null;

    let arc = {
      x: width / 7 + 10,
      y: height / 6,
      radius: width / 7,
    };

    this.drawArc(ctx, {
      ...arc,
      image: avatar,
      outLine: 5,
      outLineColor: statusColor,
    });

    let gap = arc.x + arc.radius;
    let x = width / 2 + gap / 2; //- w / 2;
    let name = member.user.displayName || member.user.username;

    this.writeText(ctx, {
      x,
      y: arc.y,
      text: name,
      fonts: ["Roboto", "Noto Sans Arabic"],
      fontSize: arc.radius,
      maxWidth: width - gap - 10,
      color: highestRoleColor,
      align: "center",
      baseline: "middle",
      stroke: true,
    });

    if (icon)
      this.drawArc(ctx, {
        x: width / 2,
        y: height - width / 12 - 5,
        radius: width / 12,
        outLine: 1,
        outLineColor: "black",
        image: icon,
      });

    let buffer = canvas.toBuffer("image/png");
    return buffer;
  }
}
export default Image;
export { Image };
