export const LLMParameters = {
    temperature : {min : 0.01, max : 2, step : 0.01, default : 0.8},
    maxContextLength : {min : 512, max : 256000, step : 128, default : 2048},
    maxTokensPerReply : {min : 1024, max : 128000, step : 1024, default : 1024},
    topP : {min : 0, max : 1, step : 0.01, default : 0.9},
    topK : {min : 1, max : 200, step : 1, default : 40},
    repeatPenalty : {min : -2, max : 2, step : 0.01, default : 1.1},
    seed : {min : 0, max : 512, step : 1, default : 0},
    repeatLastN : {min : -1, max : 512, step : 1, default : 64},
    tfsZ : {min : 0, max : 1, step : 0.1, default : 1},
}