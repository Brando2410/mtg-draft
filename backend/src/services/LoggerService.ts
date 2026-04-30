import fs from 'fs';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogContext {
  roomId?: string;
  playerId?: string;
  socketId?: string;
  [key: string]: any;
}

export class LoggerService {
  private static perfLogPath: string | null = null;

  static setPerfLogPath(path: string) {
    this.perfLogPath = path;
  }

  private static logToFile(message: string) {
    if (!this.perfLogPath) return;
    try {
      fs.appendFileSync(this.perfLogPath, message + '\n', 'utf8');
    } catch (e) {
      // Fallback if file writing fails
      console.error('[LOGGER] Failed to write to log file', e);
    }
  }

  private static formatMessage(level: LogLevel, module: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const colorMap: Record<LogLevel, string> = {
      'INFO': '\x1b[32m',  // Green
      'WARN': '\x1b[33m',  // Yellow
      'ERROR': '\x1b[31m', // Red
      'DEBUG': '\x1b[36m'  // Cyan
    };
    const reset = '\x1b[0m';
    const color = colorMap[level] || reset;

    return `${color}[${timestamp}] [${level}] [${module}]${reset} - ${message}${contextStr}`;
  }

  static info(module: string, message: string, context?: LogContext) {
    console.log(this.formatMessage('INFO', module, message, context));
  }

  static warn(module: string, message: string, context?: LogContext) {
    console.warn(this.formatMessage('WARN', module, message, context));
  }

  static error(module: string, message: string, error?: any, context?: LogContext) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = error ? `${message} | Error: ${errMessage}` : message;
    console.error(this.formatMessage('ERROR', module, fullMessage, context));
    if (error instanceof Error && error.stack) {
      console.error(`\x1b[31m${error.stack}\x1b[0m`);
    }
  }

  static debug(module: string, message: string, context?: LogContext) {
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('DEBUG', module, message, context));
    }
  }

  static perf(label: string, duration: number) {
    const message = `[PERF] [${new Date().toISOString()}] ${label} took ${duration.toFixed(3)}ms`;
    
    // Always log to file for history
    this.logToFile(message);

    // Only log to console if in debug/dev mode
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      const color = '\x1b[36m'; // Cyan
      const reset = '\x1b[0m';
      console.log(`${color}${message}${reset}`);
    }
  }
}
