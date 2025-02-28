/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICompletionResponse } from "../interfaces/responses/OllamaResponseTypes";
import TAgentReturnValue from "../interfaces/TAgentReturnValue";
import AgentService from "../services/API/AgentService";
import { isCompletionResponse } from "../utils/typeguards";
import { AIAgent } from "./AIAgent";
import { Observer } from "./Observer";

export class ProgressTracker implements Observer<TAgentReturnValue> {
    #results : (ICompletionResponse | string)[] = []
    readonly #name : string

    constructor(){
        this.#name = this.generateUniqueName()
    }

    generateUniqueName(): string {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2);
        return `${timestamp}${randomPart}`;
    }

    getName() : string{
        return this.#name
    }
  
    update(response : TAgentReturnValue): void {
      this.#results.push(response)
      console.log("progressTrackerState : \n\n" + (typeof response === 'object' && 'response' in response ? response.response : response))
    }

    reset(){
        this.#results = []
    }
}

// chain of responsability design pattern
export default class AIAgentChain{

    static #agents: AIAgent[] = []

    static progressTracker = new ProgressTracker()

    /*static deleteAgent(index  : number){
        this.agents = [...this.agents.slice(0, index), ...this.agents.slice(index + 1)]
    }*/

    static updateAgentsList(agents : AIAgent[]){
        this.#agents = agents;
    }

    static async refreshAgents(){
        const retrievedAgentsList = await new AgentService().getAll()
        if(retrievedAgentsList == null) return this.#agents = []
        const newAgents = this.#agents.map(agent => {
            let updatedAgentJSON = retrievedAgentsList.find(retrievedAgent => retrievedAgent.name == agent.getName())
            if(updatedAgentJSON == null) updatedAgentJSON = retrievedAgentsList[0]
            return new AIAgent({...updatedAgentJSON, modelName : updatedAgentJSON.model})
        })
        this.#agents = [...newAgents.filter(agent => agent != null)]
    }

    static getAgentsList() : AIAgent[]{
        return this.#agents;
    }

    static getLastAgent() : AIAgent{
        return this.#agents[this.#agents.length - 1]
    }

    static empty(){
        this.#agents = []
    }

    static isEmpty(){
        return this.#agents.length === 0
    }

    static async process(query : string) : Promise<ICompletionResponse | void>{ // !!! should be able to pass a callback that would deal with the result
        try{
            this.progressTracker.reset()
            console.log("Starting chain process...")
            const firstAgent = this.buildAgentsLinks(this.progressTracker)
            if(firstAgent == null) throw new Error("No agents available.")
            const result = await firstAgent.update(query)
            if(isCompletionResponse(result)) return result
            throw new Error("Invalid chain response format.")
        }catch(error){
            console.error(error)
            throw error
        }
    }

    // build the relationship between the chained agents
    static buildAgentsLinks(progressTracker ?: ProgressTracker) : AIAgent | undefined{
        if(this.#agents.length == 0) return undefined
        this.#agents.forEach((agent, index)=>{
            if (index < this.#agents.length -1){
                agent.addObserver(this.#agents[index + 1])
                // add a progress tracker registering each step result
                if(progressTracker != null) agent.addObserver(this.progressTracker)
            }  
        })
        return this.#agents[0]
    }

    static abortProcess() : void {
        this.#agents.forEach(agent => agent.abortLastRequest())
    }
}