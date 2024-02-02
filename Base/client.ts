import {
  Client as DiscordClient,
  ClientOptions,
  Collection,
  REST,
  Routes,
} from "discord.js";
import fs from "fs/promises";
import { cwd } from "process";
import { Event } from "../interfaces/event";
import { Command } from "../interfaces/command";
import Logger from "../Util/logger";
import EmbedMaker from "../Util/embed";
import config from "../config";
import AI from "../Util/ai";

interface StartOptions {
  token: string;
  aiToken: string;
  eventsDir: string;
  commandsDir: string;
  debug: boolean;
}

class Client extends DiscordClient {
  public path: string;
  public commands: Collection<string, Command> = new Collection();
  public embed: EmbedMaker = new EmbedMaker();
  public ai: AI = new AI();
  public config: typeof config = config;
  constructor(options: ClientOptions) {
    super(options);
    this.path = cwd();
  }

  protected async readDir<T>(dir: string): Promise<T[]> {
    try {
      let path = `${this.path}\\${dir}\\`;
      let files = await fs.readdir(path);
      let data: T[] = [];
      for (let file of files) {
        let stat = await fs.lstat(`${path}\\${file}`);
        if (stat.isDirectory()) {
          let insideFiles = (await this.readDir(`${dir}\\${file}`)) as T[];
          data.push(...insideFiles);
          continue;
        }

        if (file.endsWith(".ts")) {
          let { default: d } = (await import(`${path}\\${file}`)) as {
            default: T;
          };
          data.push(d);
        }
      }
      return data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  protected async registerEvents(dir: string, debug = false): Promise<boolean> {
    try {
      let events = await this.readDir<Event>(dir);
      for (let event of events) {
        this[event.once ? "once" : "on"](
          event.name,
          event.run.bind(null, this)
        );
        if (debug) Logger.logEventRegistered(event);
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  private async waitUntilReady(): Promise<void> {
    return new Promise((resolve) => {
      this.once("ready", () => {
        resolve();
      });
    });
  }

  protected async registerCommands(
    dir: string,
    debug = false
  ): Promise<boolean> {
    try {
      let commands = await this.readDir<Command>(dir);
      for (let command of commands) {
        this.commands.set(command.data.name, command);
        if (debug) Logger.logCommandRegistered(command);
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  protected async sendSlashCommands(debug = false): Promise<boolean> {
    await this.waitUntilReady();
    try {
      let rest = new REST({ version: "9" }).setToken(`${this.token}`);
      let commands = this.commands.map((cmd) => cmd.data.toJSON());
      await rest.put(Routes.applicationCommands(`${this.user?.id}`), {
        body: commands,
      });
      if (debug) console.log("Successfully registered application commands.");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  async start(options: StartOptions): Promise<boolean> {
    try {
      await this.registerEvents(options.eventsDir, options.debug);
      await this.registerCommands(options.commandsDir, options.debug);
      await this.login(options.token);
      //await this.sendSlashCommands(options.debug);
      this.ai.setApiKey(options.aiToken);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default Client;
export { Client };
