import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private currentLogLevel: LogLevel = environment.production ? LogLevel.Error : LogLevel.Debug;

  constructor() {}

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.Debug, message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.Info, message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.Warn, message, args);
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    this.log(LogLevel.Error, message, [error, ...args]);
  }

  private log(level: LogLevel, message: string, args: unknown[]): void {
    if (level < this.currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const prefix = `[${timestamp}] [${levelName}]`;

    switch (level) {
      case LogLevel.Debug:
        if (!environment.production) {
          console.debug(prefix, message, ...args);
        }
        break;
      case LogLevel.Info:
        console.info(prefix, message, ...args);
        break;
      case LogLevel.Warn:
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.Error:
        console.error(prefix, message, ...args);
        break;
    }
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }
}
