import type { APIError,APIErrorResponse } from "@/types/auth";

export class ApiError extends Error {
  status?: number;
  errorCode?: string;
  errorType?: string;
  traceId?: string;
  timestamp?: string;
  originalError?: any;
  errors?: APIError[]; // Support for array of errors from API

  constructor(
    message: string,
    details: {
      status?: number;
      errorCode?: string;
      errorType?: string;
      traceId?: string;
      timestamp?: string;
      originalError?: any;
      errors?: APIError[];
    } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = details.status;
    this.errorCode = details.errorCode;
    this.errorType = details.errorType;
    this.traceId = details.traceId;
    this.timestamp = details.timestamp;
    this.originalError = details.originalError;
    this.errors = details.errors;
  }

  /**
   * Create an ApiError from a SharedKernelCFErrorResponse
   * @param errorResponse - The structured error response from the API
   * @param status - HTTP status code
   * @returns ApiError instance with properly extracted error information
   */
  static fromAPIErrorResponse(
    errorResponse: APIErrorResponse, 
    status?: number
  ): ApiError {
    // Extract the first error for the main message, or use a fallback
    const firstError = errorResponse.errors?.[0];
    const message = firstError?.message || 'API Error';
    
    return new ApiError(message, {
      status,
      errorCode: firstError?.code,
      errorType: firstError?.type?.toString(),
      traceId: errorResponse.traceId,
      timestamp: errorResponse.timestamp,
      originalError: errorResponse,
      errors: errorResponse.errors
    });
  }

  /**
   * Get all error messages from the errors array
   * @returns Array of error messages
   */
  getAllErrorMessages(): string[] {
    if (!this.errors || this.errors.length === 0) {
      return [this.message];
    }
    
    return this.errors
      .map(error => error.message)
      .filter((message): message is string => Boolean(message));
  }

  /**
   * Get all error codes from the errors array
   * @returns Array of error codes
   */
  getAllErrorCodes(): string[] {
    if (!this.errors || this.errors.length === 0) {
      return this.errorCode ? [this.errorCode] : [];
    }
    
    return this.errors
      .map(error => error.code)
      .filter((code): code is string => Boolean(code));
  }
}