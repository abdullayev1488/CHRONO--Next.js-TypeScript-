export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message: string, details?: Record<string, unknown>) {
    return new ApiError(409, message, details);
  }

  static tooManyRequests(message: string) {
    return new ApiError(429, message);
  }
}
