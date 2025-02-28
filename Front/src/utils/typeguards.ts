import { ICompletionResponse } from "../interfaces/responses/OllamaResponseTypes";

// typeGuard
export function isCompletionResponse(data: unknown): data is ICompletionResponse {
    return typeof data === "object" && data !== null && "response" in data && "done" in data && "model" in data;
}

export function isAbortError(error: unknown): error is Error {
    return (
      error instanceof Error &&
      (error.name === "AbortError" ||
      error.name.toLowerCase().includes("abort") ||
      error.message.toLowerCase().includes("signal"))
    )
}