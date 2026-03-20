type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogContext {
  [key: string]: any;
}

class ClientLogger {
  private isEnabled: boolean = (import.meta as any).env?.MODE === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): any[] {
    const timestamp = new Date().toLocaleTimeString();
    const colorMap: Record<LogLevel, string> = {
      'INFO': 'color: #10b981; font-weight: bold;',
      'WARN': 'color: #f59e0b; font-weight: bold;',
      'ERROR': 'color: #ef4444; font-weight: bold;',
      'DEBUG': 'color: #6366f1; font-weight: bold;'
    };

    const parts = [
      `%c[${timestamp}] [${level}]`,
      colorMap[level],
      message
    ];

    if (context) parts.push(context as any);
    return parts;
  }

  info(message: string, context?: LogContext) {
    if (!this.isEnabled) return;
    console.log(...this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(...this.formatMessage('WARN', message, context));
  }

  error(message: string, error?: any, context?: LogContext) {
    console.error(...this.formatMessage('ERROR', message, context), error);
  }

  debug(message: string, context?: LogContext) {
    if (!this.isEnabled) return;
    console.debug(...this.formatMessage('DEBUG', message, context));
  }
}

export const logger = new ClientLogger();
