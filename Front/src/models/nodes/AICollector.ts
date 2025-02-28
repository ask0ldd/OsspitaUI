import { AIAgent } from "../AIAgent";
import { ProgressTracker } from "../AIAgentChain";
import { Observer } from "../Observer";
import AISearch from "./AISearch";

class AICollector implements Observer<{providerName : string, data : string}>{
    #providerNameList : string[] = []
    #observers : (AIAgent | ProgressTracker | AISearch)[] = []
    #state : {[requiredNode : string] : unknown} = {}

    constructor({providerNameList} : {providerNameList : string[]}){
        this.#providerNameList = providerNameList
    }

    addProvider(providerName : string){
        if(!this.#providerNameList.includes(providerName)) this.#providerNameList.push(providerName)
    }

    update({providerName, data} : {providerName : string, data : string}){
        if(this.#providerNameList.includes(providerName)) this.#state = {...this.#state, [providerName] : data}
        // notify the observers only when the data from the last source node has been collected
        if(this.allNodesResultsReceived()) this.notifyObservers()         
    }

    addObserver(observer : AIAgent | ProgressTracker | AISearch) {
        this.#observers.push(observer);
    }

    notifyObservers() : void {
        for(const observer of this.#observers){
            if(observer instanceof AIAgent) observer.update(JSON.stringify(this.#state))
        }
    }

    allNodesResultsReceived() : boolean {
        return this.#providerNameList.every(id => id in this.#state)
    }
}

export default AICollector