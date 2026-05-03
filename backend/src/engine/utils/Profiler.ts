import { performance } from 'perf_hooks';
import { LoggerService } from '../../services/LoggerService';

export class Profiler {
  private static marks: Map<string, number> = new Map();
  private static counters: Map<string, number> = new Map();
  
  // Payload tracking
  private static payloadTotalSize: number = 0;
  private static payloadCount: number = 0;
  private static lagMonitorTimer: NodeJS.Timeout | null = null;

  /**
   * Starts a timer for a specific label.
   */
  static start(label: string) {
    this.marks.set(label, performance.now());
  }

  /**
   * Ends the timer for a specific label and logs the duration if it exceeds 0.5ms.
   * @returns the duration in milliseconds.
   */
  static end(label: string): number | undefined {
    return this.endWithThreshold(label, 0.5);
  }

  /**
   * Ends the timer for a specific label and logs the duration ONLY if it exceeds the threshold.
   * Prevents log spam for operations that are usually fast but occasionally spike.
   */
  static endWithThreshold(label: string, thresholdMs: number): number | undefined {
    const startTime = this.marks.get(label);
    if (startTime === undefined) return undefined;
    
    const duration = performance.now() - startTime;
    
    if (duration > thresholdMs) { 
       LoggerService.perf(label, duration);
    }
    
    this.marks.delete(label);
    return duration;
  }

  /**
   * Increment a generic counter (e.g. for cache hits/misses).
   */
  static increment(label: string, amount: number = 1) {
    const current = this.counters.get(label) || 0;
    this.counters.set(label, current + amount);
  }

  /**
   * Track the size of a payload (e.g. state mutation size).
   */
  static trackPayload(sizeBytes: number) {
    this.payloadTotalSize += sizeBytes;
    this.payloadCount += 1;
    
    // Log a warning if a single payload is suspiciously large (e.g. > 100KB)
    if (sizeBytes > 102400) {
       LoggerService.warn('PROFILER', `Large payload detected: ${(sizeBytes / 1024).toFixed(2)} KB`);
    }
  }

  /**
   * Initializes a background timer to detect Event Loop lag.
   * Deep recursion or heavy sync operations will delay this timer.
   */
  static initLagMonitor(intervalMs: number = 100, thresholdMs: number = 50) {
    if (this.lagMonitorTimer) clearInterval(this.lagMonitorTimer);
    
    let lastTick = performance.now();
    this.lagMonitorTimer = setInterval(() => {
      const now = performance.now();
      const lag = now - lastTick - intervalMs;
      
      if (lag > thresholdMs) {
        LoggerService.warn('PROFILER', `Event loop lag spike detected: ${lag.toFixed(2)}ms`);
      }
      lastTick = now;
    }, intervalMs);
    
    LoggerService.info('PROFILER', `Event loop lag monitor initialized (Threshold: ${thresholdMs}ms)`);
  }

  /**
   * Dumps current metrics to the perf logger.
   */
  static logReport() {
    LoggerService.info('PROFILER', '--- Performance Report ---');
    this.counters.forEach((value, key) => {
      LoggerService.info('PROFILER', `${key}: ${value}`);
    });
    if (this.payloadCount > 0) {
      const avg = this.payloadTotalSize / this.payloadCount;
      LoggerService.info('PROFILER', `Avg Payload Size: ${(avg / 1024).toFixed(2)} KB (over ${this.payloadCount} broadcasts)`);
    }
    LoggerService.info('PROFILER', '--------------------------');
  }

  /**
   * Wraps a function with profiling.
   */
  static wrap<T>(label: string, fn: () => T, thresholdMs: number = 0.5): T {
    this.start(label);
    try {
      return fn();
    } finally {
      this.endWithThreshold(label, thresholdMs);
    }
  }

  /**
   * Wraps an async function with profiling.
   */
  static async wrapAsync<T>(label: string, fn: () => Promise<T>, thresholdMs: number = 0.5): Promise<T> {
    this.start(label);
    try {
      return await fn();
    } finally {
      this.endWithThreshold(label, thresholdMs);
    }
  }
}
