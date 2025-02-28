import { AIAgent } from "../AIAgent";
import { ProgressTracker } from "../AIAgentChain";
import Mediator from "../Mediator";
import { Observer } from "../Observer";

class AIDistributor implements Observer<void>{
    #observers : (AIAgent | Mediator | ProgressTracker)[] = []
    #name : string

    constructor(){
        this.#name = this.generateUniqueName()
    }

    generateUniqueName(): string {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2);
        return `${timestamp}${randomPart}`;
    }

    update(){

    }

    addObserver(observer : AIAgent | Mediator | ProgressTracker ) {
        this.#observers.push(observer);
    }

    getName() : string{
        return this.#name
    }

    getObservers(){
        return this.#observers
    }
}

export default AIDistributor