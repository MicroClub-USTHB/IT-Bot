import Canvas from "@napi-rs/canvas";
import { writeFileSync } from "fs";

class Util {
  static smartSplit(str: string, limit: number): string[] {
    let words = str.split(" ");
    let lines: string[] = [];
    let line = "";
    for (let word of words) {
      if (line.length + word.length > limit) {
        lines.push(line);
        line = "";
      }
      line += word + " ";
    }
    lines.push(line);
    return lines;
  }
}

export default Util;
export { Util };

