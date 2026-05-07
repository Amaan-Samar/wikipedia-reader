type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    if (this.isDevelopment) {
      const consoleMethod = console[level] || console.log;
      consoleMethod(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
    }

    // Store in localStorage for debugging
    const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
    logs.push(logEntry);
    if (logs.length > 100) logs.shift(); // Keep last 100 logs
    localStorage.setItem('app_logs', JSON.stringify(logs));
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export const logger = Logger.getInstance();