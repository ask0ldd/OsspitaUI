/* eslint-disable no-unused-private-class-members */
import { AIAgent } from "./AIAgent";
import { ProgressTracker } from "./AIAgentChain";
import Mediator from "./Mediator";

class AIAgentsLine{
    #agents : AIAgent[] = []
    #mediator : Mediator

    constructor(agents : AIAgent[]){
        this.#agents = agents
        this.#mediator = new Mediator({requiredNodesIds : this.getAgentsNames()})
        this.#agents.forEach(agent => agent.addObserver(this.#mediator))
    }

    getAgentsNames() : string[]{
        return this.#agents.map(agent => agent.getName())
    }

    setMediator(mediator : Mediator){
        this.#mediator = mediator
        this.#agents.forEach(agent => agent.addObserver(mediator))
    }

    getAgents() : AIAgent[]{
        return this.#agents
    }

    update(request : string) {
        this.#agents.forEach(agent => agent.update(request))
    }

    addObserver(observer : AIAgent | ProgressTracker ){
        this.#mediator.addObserver(observer)
    }
}

export default AIAgentsLine