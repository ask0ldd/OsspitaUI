import { ICompletionResponse } from "../responses/ICompletionResponse"

interface IAIAgentPartialParams{
    id? : string
    name : string
    type? : "system" | "user_created"
    favorite? : boolean
    onUpdate? : (state : string, systemPrompt? : string) => Promise<ICompletionResponse | string | undefined>
    targetFilesNames?: string[]
    webSearchEconomy? : boolean
}

export default IAIAgentPartialParams