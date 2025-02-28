import { AIAgent } from "../AIAgent";

const AIKeepBestNode = new AIAgent({name : "name", modelName : "llama3.2:3b", systemPrompt : "extract the best item among the following ones : "})
    .onUpdate(async function (this : AIAgent, state) {
        const choices = JSON.parse(state) as string []
        return this.ask(choices.reduce((prevValue , currentChoice) => prevValue + `- ${currentChoice}\n`, ""))
    })

export default AIKeepBestNode