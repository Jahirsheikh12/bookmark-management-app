/**
 * Custom error types for better error handling
 */
export class AppError extends Error {
  public readonly type: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    type: string = "APP_ERROR",
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(field ? `${field}: ${message}` : message, "VALIDATION_ERROR", 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, "AUTHORIZATION_ERROR", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, "NOT_FOUND_ERROR", 404);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, "RATE_LIMIT_ERROR", 429);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Network error occurred") {
    super(message, "NETWORK_ERROR", 500);
  }
}

/**
 * Error handler configuration
 */
interface ErrorHandlerConfig {
  logErrors: boolean;
  notifyUser: boolean;
  fallbackMessage: string;
}

const defaultConfig: ErrorHandlerConfig = {
  logErrors: true,
  notifyUser: true,
  fallbackMessage: "An unexpected error occurred. Please try again.",
};

/**
 * Centralized error handler
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  handle(error: unknown): {
    message: string;
    type: string;
    statusCode: number;
    shouldNotify: boolean;
  } {
    if (this.config.logErrors) {
      console.error("Error caught by ErrorHandler:", error);
    }

    if (error instanceof AppError) {
      return {
        message: error.message,
        type: error.type,
        statusCode: error.statusCode,
        shouldNotify: this.config.notifyUser && error.isOperational,
      };
    }

    if (error instanceof Error) {
      // Handle specific error types
      if (
        error.name === "ValidationError" ||
        error.message.includes("validation")
      ) {
        return {
          message: error.message,
          type: "VALIDATION_ERROR",
          statusCode: 400,
          shouldNotify: this.config.notifyUser,
        };
      }

      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        return {
          message: "Network error. Please check your connection.",
          type: "NETWORK_ERROR",
          statusCode: 500,
          shouldNotify: this.config.notifyUser,
        };
      }

      if (
        error.message.includes("unauthorized") ||
        error.message.includes("authentication")
      ) {
        return {
          message: "Authentication required. Please sign in.",
          type: "AUTHENTICATION_ERROR",
          statusCode: 401,
          shouldNotify: this.config.notifyUser,
        };
      }
    }

    // Unknown error
    return {
      message: this.config.fallbackMessage,
      type: "UNKNOWN_ERROR",
      statusCode: 500,
      shouldNotify: this.config.notifyUser,
    };
  }
}

export const errorHandler = new ErrorHandler();

/**
 * Async error wrapper
 */
export function asyncErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return async function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    return fn.apply(this, args).catch((error) => {
      const handled = errorHandler.handle(error);
      throw new AppError(handled.message, handled.type, handled.statusCode);
    });
  } as T;
}

/**
 * React error boundary helper
 */
export function createErrorBoundaryConfig() {
  return {
    onError: (error: Error, errorInfo: { componentStack: string }) => {
      console.error("React Error Boundary caught an error:", error, errorInfo);
      // Here you could send error to logging service
    },
    fallback: ({
      error,
      resetError,
    }: {
      error: Error;
      resetError: () => void;
    }) => ({
      error,
      resetError,
      message: "Something went wrong. Please try refreshing the page.",
    }),
  };
}

/**
 * Form error helper
 */
export function extractFormErrors(error: unknown): Record<string, string> {
  if (error instanceof ValidationError) {
    // Parse field-specific errors
    const match = error.message.match(/^([^:]+): (.+)$/);
    if (match) {
      return { [match[1]]: match[2] };
    }
  }

  if (error instanceof Error && error.message.includes("validation")) {
    try {
      // Try to parse as JSON for detailed validation errors
      const parsed = JSON.parse(error.message);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    } catch {
      // Not JSON, return general error
    }
  }

  return { general: errorHandler.handle(error).message };
}

/**
 * API error helper
 */
export function createApiError(response: Response, data?: any): AppError {
  const status = response.status;
  const message = data?.message || data?.error || response.statusText;

  switch (status) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(message);
    case 429:
      return new RateLimitError(message);
    default:
      return new AppError(message, "API_ERROR", status);
  }
}

/**
 * Logger utility
 */
export class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  error(message: string, error?: unknown, context?: any): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    // In production, send to logging service
  }

  warn(message: string, context?: any): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  info(message: string, context?: any): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  debug(message: string, context?: any): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }
}

export const logger = new Logger();
