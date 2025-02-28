import IMediatorUpdateParams from "../interfaces/params/IMediatorUpdateParams";
import TAgentReturnValue from "../interfaces/TAgentReturnValue";
import { AIAgent } from "./AIAgent";
import { ProgressTracker } from "./AIAgentChain";
import { Observer } from "./Observer";

class Mediator implements Observer<IMediatorUpdateParams>{
    #requiredNodesIds : string[] = []
    #observers : (AIAgent | ProgressTracker)[] = []
    #state : {[requiredNode : string] : unknown} = {}
    readonly #name : string

    constructor({requiredNodesIds} : {requiredNodesIds : string[]}){
        this.#requiredNodesIds = requiredNodesIds
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

    addSource(nodeId : string){
        if(!this.#requiredNodesIds.includes(nodeId)) this.#requiredNodesIds.push(nodeId)
    }

    async update({sourceNode, data} : IMediatorUpdateParams) : Promise<TAgentReturnValue | undefined | void> {
        if(this.#requiredNodesIds.includes(sourceNode)) this.#state = {...this.#state, [sourceNode] : data}
        // notify the observers only when the data from the last source node has been collected
        if(this.allNodesResultsReceived()) return await this.notifyObservers() 
    }

    addObserver(observer : AIAgent | ProgressTracker) {
        this.#observers.push(observer);
    }

    getObservers(){
        return this.#observers
    }

    async notifyObservers() : Promise<TAgentReturnValue | undefined | void> {
        for(const observer of this.#observers){
            if(observer instanceof AIAgent) return observer.update(JSON.stringify(this.#state))
        }
        return undefined
    }

    allNodesResultsReceived() : boolean {
        return this.#requiredNodesIds.every(id => id in this.#state)
    }
}

export default Mediator