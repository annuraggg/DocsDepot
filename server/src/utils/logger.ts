import fs from 'fs';

class Logger {
  private logFile = 'server.log';

  private writeToFile(logMessage: string) {
    fs.appendFile(this.logFile, logMessage + '\n', (err) => {
      if (err) {
        console.error(`Failed to write to log file: ${err.message}`);
      }
    });
  }

  private formatMessage(level: string, message: string): string {
    const date = new Date().toISOString();
    return `[${date}] ${level}: ${message}`;
  }

  info(message: string) {
    const formattedMessage = this.formatMessage('INFO', message);
    console.log(`\x1b[37m[${new Date().toISOString()}] \x1b[32mINFO: \x1b[34m${message} \x1b[37m`);
    this.writeToFile(formattedMessage);
  }

  error(message: string) {
    const formattedMessage = this.formatMessage('ERROR', message);
    console.error(`\x1b[37m[${new Date().toISOString()}] \x1b[31mERROR: \x1b[31m${message} \x1b[37m`);
    console.trace();
    this.writeToFile(formattedMessage);
  }

  warn(message: string) {
    const formattedMessage = this.formatMessage('WARN', message);
    console.warn(`\x1b[37m[${new Date().toISOString()}] \x1b[33mWARN: \x1b[33m${message} \x1b[37m`);
    this.writeToFile(formattedMessage);
  }
}

export default new Logger();
