/**
 * Presentation Layer Interceptors for Logging, Metrics, and Response Transformation.
 */

export interface CallHandler<T = any> {
  handle(): Promise<T>;
}

export class TimingInterceptor {
  async intercept<T>(actionName: string, next: CallHandler<T>): Promise<{ result: T; durationMs: number }> {
    const start = performance.now();
    const result = await next.handle();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    return { result, durationMs };
  }
}

export class LoggingInterceptor {
  async intercept<T>(endpoint: string, next: CallHandler<T>): Promise<T> {
    const timestamp = new Date().toISOString();
    try {
      const res = await next.handle();
      return res;
    } catch (err: any) {
      console.error(`[${timestamp}] [API_ERROR] ${endpoint}: ${err?.message}`);
      throw err;
    }
  }
}
