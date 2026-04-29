import { performance } from 'perf_hooks';
import { LoggerService } from '../../services/LoggerService';

export class Profiler {
  private static marks: Map<string, number> = new Map();

  /**
   * Starts a timer for a specific label.
   */
  static start(label: string) {
    this.marks.set(label, performance.now());
  }

  /**
   * Ends the timer for a specific label and logs the duration.
   * @returns the duration in milliseconds.
   */
  static end(label: string): number | undefined {
    const startTime = this.marks.get(label);
    if (startTime === undefined) return undefined;
    
    const duration = performance.now() - startTime;
    
    // We log it at DEBUG level so it doesn't clutter production logs
    // unless development mode or debug is enabled.
    if (duration > 0.5) { 
       LoggerService.perf(label, duration);
    }
    
    this.marks.delete(label);
    return duration;
  }

  /**
   * Wraps a function with profiling.
   */
  static wrap<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      return fn();
    } finally {
      this.end(label);
    }
  }

  /**
   * Wraps an async function with profiling.
   */
  static async wrapAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      return await fn();
    } finally {
      this.end(label);
    }
  }
}
