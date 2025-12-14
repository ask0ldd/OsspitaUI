import { IInferenceStats } from "../../interfaces/IConversation";
import { ICompletionResponse } from "../../interfaces/responses/ICompletionResponse";

/**
 * Service for formatting inference statistics from a completion response.
 */
export interface IInferenceStatsFormattingService{
  /**
   * Extracts inference statistics from a completion response.
   * @param {ICompletionResponse} response - The response object containing inference data.
   * @returns {IInferenceStats} The extracted inference statistics.
   */
  extractStats(response : ICompletionResponse): IInferenceStats
}