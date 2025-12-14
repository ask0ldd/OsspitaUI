import { IInferenceStats } from "../interfaces/IConversation"
import { ICompletionResponse } from "../interfaces/responses/OllamaResponseTypes"

/**
 * Service for formatting inference statistics from a completion response.
 */
class InferenceStatsFormatingService{
  /**
   * Extracts inference statistics from a completion response.
   * @param {ICompletionResponse} response - The response object containing inference data.
   * @returns {IInferenceStats} The extracted inference statistics.
   */
  extractStats(response : ICompletionResponse): IInferenceStats{
      const stats : IInferenceStats = {
        promptEvalDuration : response.prompt_eval_duration || 0,
        promptTokensEval : response.prompt_eval_duration || 0,
        inferenceDuration : response.eval_duration || 0,
        modelLoadingDuration : response.load_duration || 0,
        wholeProcessDuration : response.total_duration || 0,
        tokensGenerated : response.eval_count || 0,
      }
      return stats
  }
}

export default InferenceStatsFormatingService