import { IInferenceStats } from "../interfaces/IConversation"
import { ICompletionResponse } from "../interfaces/responses/OllamaResponseTypes"

class InferenceStatsFormatingService{
    static extractStats(response : ICompletionResponse){
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