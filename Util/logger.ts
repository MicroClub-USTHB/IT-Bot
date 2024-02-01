import chalk from "chalk";

import { Event } from "../interfaces/event";

import Command from "../interfaces/command";

class Logger {
  public static logEventRegistered(event: Event): void {
    console.log(
      `${chalk.blue.underline.bold("Event:")} ${chalk.red.bold(
        event.name
      )} has been registered`
    );
  }
  public static logCommandRegistered(command: Command): void {
    console.log(
      `${chalk.green.underline.bold("Command:")} ${chalk.red.bold(
        command.data.name
      )} has been registered`
    );
  }
}
export default Logger;
export { Logger };
