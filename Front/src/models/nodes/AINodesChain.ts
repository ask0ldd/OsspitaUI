/* eslint-disable no-unused-private-class-members */
import { ICompletionResponse } from "../../interfaces/responses/OllamaResponseTypes"
import TAgentReturnValue from "../../interfaces/TAgentReturnValue"
import TObserver from "../../interfaces/TObservers"
import { isCompletionResponse } from "../../utils/typeguards"

class AINodesChain {
    #startNode : TObserver
    #endNode : TObserver
    #lastCompletionResponse : ICompletionResponse | null = null

    constructor({startNode, endNode} : {startNode : TObserver, endNode : TObserver}){
        this.#startNode = startNode
        this.#endNode = endNode
    }

    async process(initialData: string): Promise<TAgentReturnValue | void> {
        let currentNode = this.#startNode
        let currentData : string = initialData
        try{
            while (true) {
                if(currentData != null) {
                    currentData = await this.processNode(currentNode, currentData)
                }
                const observers = currentNode.getObservers()
                if(observers.length == 0 || this.isEndNode(currentNode)) return currentData
                currentNode = observers[0]
            }
        }catch(error){
            console.error("error within the chain process : ", error)
            throw error
        }
    }

    async processNode(node : TObserver, currentData : string){
        try{
            const response = await node.update(currentData)
            if(response == null) throw new Error("node failed to generate a response.")
            if(isCompletionResponse(response)) {
                this.setLastCompletionResponse(response)
                return response.response
            }else{
                if(typeof response == "string") return response
            }
            throw new Error("Invalid node response.")
        }catch(error){
            console.error(`error when processing the node ${node.getName()} : `, error)
            throw error
        }
    }

    setLastCompletionResponse(response : ICompletionResponse){
        this.#lastCompletionResponse = response
    }

    isEndNode(node : TObserver) : boolean{
        return node.getName() == this.#endNode.getName()
    }

    getLastCompletionResponse(): ICompletionResponse | null {
        return this.#lastCompletionResponse
    }
}

export default AINodesChain