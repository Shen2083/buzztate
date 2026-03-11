/**
 * User-friendly error messages mapped from HTTP status codes.
 * Never show raw technical errors to the user.
 */

const STATUS_MESSAGES: Record<number, string> = {
  400: "Something went wrong with your request. Please try again.",
  401: "Your session has expired. Please log in again.",
  403: "This feature requires a Plus plan.",
  429: "You're sending requests too quickly. Please wait a moment before trying again.",
  500: "Something went wrong on our end. Please try again in a few minutes.",
  502: "Our localization service is temporarily unavailable. Please try again shortly.",
  503: "Our localization service is temporarily unavailable. Please try again shortly.",
};

export interface ApiError {
  /** User-friendly message to display */
  message: string;
  /** HTTP status code, or 0 for network errors */
  status: number;
  /** Whether the user should be prompted to upgrade */
  upgrade?: boolean;
  /** Seconds to wait before retrying (for 429) */
  retryAfter?: number;
  /** Whether this was a network error (offline/unreachable) */
  isNetworkError?: boolean;
}

/**
 * Parse an API response into a user-friendly error, or return null if OK.
 */
export function parseApiError(response: Response, data?: any): ApiError | null {
  if (response.ok) return null;

  const serverMessage = data?.error;
  const status = response.status;

  // Use server message for 403/429 as they include specific plan/rate info
  const message =
    (status === 403 || status === 429) && serverMessage
      ? serverMessage
      : STATUS_MESSAGES[status] || "Something went wrong. Please try again.";

  return {
    message,
    status,
    upgrade: data?.upgrade || status === 403,
    retryAfter: data?.retryAfter,
  };
}

/**
 * Create an ApiError from a network/fetch exception.
 */
export function networkError(): ApiError {
  return {
    message: "Connection lost. Please check your internet connection and try again.",
    status: 0,
    isNetworkError: true,
  };
}

/**
 * Fetch wrapper with retry logic for network errors.
 * Retries up to 3 times with exponential backoff (2s, 4s, 8s).
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
