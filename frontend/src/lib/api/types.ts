/**
 * Shared types for the HokieExchange API layer.
 */

/** Error thrown when the backend responds with a non-2xx status. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
