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
    const formatted = this.formatMessage('INFO', module, message, context);
    console.log(formatted);
    if (module === 'PROFILER') {
      this.logToFile(`[INFO] [${new Date().toISOString()}] [${module}] ${message}`);
    }
  }

  static warn(module: string, message: string, context?: LogContext) {
    const formatted = this.formatMessage('WARN', module, message, context);
    console.warn(formatted);
    if (module === 'PROFILER') {
      this.logToFile(`[WARN] [${new Date().toISOString()}] [${module}] ${message}`);
    }
  }

  static error(module: string, message: string, error?: any, context?: LogContext) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = error ? `${message} | Error: ${errMessage}` : message;
    const formatted = this.formatMessage('ERROR', module, fullMessage, context);
    console.error(formatted);
    if (error instanceof Error && error.stack) {
      console.error(`\x1b[31m${error.stack}\x1b[0m`);
    }
    if (module === 'PROFILER') {
      this.logToFile(`[ERROR] [${new Date().toISOString()}] [${module}] ${fullMessage}`);
    }
  }

  static debug(module: string, message: string, context?: LogContext) {
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('DEBUG', module, message, context);
      console.log(formatted);
      if (module === 'PROFILER') {
        this.logToFile(`[DEBUG] [${new Date().toISOString()}] [${module}] ${message}`);
      }
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
