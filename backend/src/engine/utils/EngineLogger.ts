import { GameState } from "@shared/engine_types";

export enum LogCategory {
  SYSTEM = 'SYSTEM',
  COMBAT = 'COMBAT',
  TURN = 'TURN',
  MANA = 'MANA',
  STACK = 'STACK',
  TRIGGER = 'TRIGGER',
  TARGETING = 'TARGETING',
  ACTION = 'ACTION',
  EFFECT = 'EFFECT',
  STATE = 'STATE',
  DEBUG = 'DEBUG'
}

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

/**
 * CENTRALIZED ENGINE LOGGER
 * Standardizes log output across the engine, ensuring consistent formatting,
 * categorization, and routing to both server console and UI stream.
 */
export class EngineLogger {

  public static log(state: GameState, category: LogCategory, message: string, level: LogLevel = LogLevel.INFO) {
    const timestamp = new Date().toISOString();
    const prefix = `[${category}]${level !== LogLevel.INFO ? ` [${level}]` : ''}`;
    const formattedMessage = `${prefix} ${message}`;

    // 1. Server-side terminal output (with colors in mind for future)
    console.log(`${timestamp} ${formattedMessage}`);

    // 2. UI-side stream (pushed to state.logs for the frontend)
    if (state) {
      if (!state.logs) state.logs = [];

      // We prepend "> " for the UI console's styling
      const uiMessage = `> ${formattedMessage}`;
      state.logs.push(uiMessage);

      // Maintain a buffer limit to prevent state bloat
      if (state.logs.length > 50) {
        state.logs.shift();
      }
    }
  }

  // Convenience methods
  public static info(state: GameState, category: LogCategory, message: string) {
    this.log(state, category, message, LogLevel.INFO);
  }

  public static warn(state: GameState, category: LogCategory, message: string) {
    this.log(state, category, message, LogLevel.WARN);
  }

  public static error(state: GameState, category: LogCategory, message: string) {
    this.log(state, category, message, LogLevel.ERROR);
  }

  public static debug(state: GameState, category: LogCategory, message: string) {
    // Only log debug to console in development, don't flood the UI unless specifically needed
    const timestamp = new Date().toISOString();
    console.debug(`${timestamp} [${category}] [DEBUG] ${message}`);
  }

  /**
   * Specifically for UI-only messages that don't need heavy categorization
   */
  public static system(state: GameState, message: string) {
    this.log(state, LogCategory.SYSTEM, message);
  }
}
