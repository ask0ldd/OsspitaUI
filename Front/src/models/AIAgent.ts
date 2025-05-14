/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-private-class-members */
import IAIAgentPartialParams from "../interfaces/params/IAIAgentPartialParams.js"
import { IAIModelParams } from "../interfaces/params/IAIModelParams.js"
import TAgentReturnValue from "../interfaces/TAgentReturnValue.js"
import { ProgressTracker } from "./AIAgentChain.js"
import { AIModel } from "./AIModel.js"
import Mediator from "./Mediator.js"
import { Observer } from "./Observer.js"

export class AIAgent extends AIModel implements Observer<string> {

    // !!! user should be able to add a regex verifying the quality of the output

    readonly #id : string
    #name : string
    #type : 'system' | 'user_created' = "user_created"
    #favorite : boolean = false
    #targetFilesNames : string[] = []
    #webSearchEconomy: boolean = false
    #observers : (AIAgent | Mediator | ProgressTracker)[] = []
    #onUpdate?: (state: string, systemPrompt? : string) => Promise<TAgentReturnValue | void>

    constructor({
        id = "",
        name, 
        modelName = "llama3.1:8b", 
        systemPrompt = "You are an helpful assistant.", 
        temperature = 0.8, 
        mirostat = 0, 
        mirostat_eta = 0.1, 
        mirostat_tau = 5.0, 
        num_ctx = 2048,
        context = [],
        repeat_last_n = 64, 
        repeat_penalty = 1.1, 
        seed = 0,
        stop = ["\n", "user:", "AI assistant:"], 
        tfs_z = 1, 
        num_predict = 1024,
        top_k = 40,
        top_p = 0.9,
        type = "user_created",
        favorite = false,
        webSearchEconomy = false,
        min_p = 0.0,
        num_keep = 5,
        typical_p = 0.7,
        presence_penalty = 1.5,
        frequency_penalty = 1.0,
        penalize_newline = true,
        numa = false,
        num_batch = 2,
        num_gpu = 1,
        main_gpu = 0,
        low_vram = false,
        vocab_only = false,
        use_mmap = true,
        use_mlock = false,
        num_thread = 8,
        targetFilesNames = [],
        onUpdate = undefined,
    } : IAIModelParams & IAIAgentPartialParams)
    {
        super({
            modelName, 
            systemPrompt, 
            temperature,
            mirostat,
            mirostat_eta,
            mirostat_tau,
            context,
            num_ctx,
            repeat_last_n,
            repeat_penalty,
            seed,
            stop,
            tfs_z,
            num_predict,
            top_k,
            top_p,
            min_p,
            num_keep,
            typical_p,
            presence_penalty,
            frequency_penalty,
            penalize_newline,
            numa,
            num_batch,
            num_gpu,
            main_gpu,
            low_vram,
            vocab_only,
            use_mmap,
            use_mlock,
            num_thread,
        })
        this.#id = id
        this.#name = name
        this.#type = type
        this.#favorite = favorite
        this.#targetFilesNames = targetFilesNames
        this.#webSearchEconomy = webSearchEconomy
        this.#onUpdate = onUpdate
        return this
    }

    getId() : string {
        return this.#id
    }

    getName() : string{
        return this.#name
    }

    getWebSearchEconomy() : boolean {
        return this.#webSearchEconomy
    }

    getType() : 'system' | 'user_created' {
        return this.#type
    }

    getFavorite() : boolean {
        return this.#favorite
    }

    getTargetFilesNames() : string[]{
        return this.#targetFilesNames
    }

    setName(name : string) : AIAgent {
        this.#name = name
        return this
    }

    setWebSearchEconomy(webSearchEconomy: boolean) {
        this.#webSearchEconomy = webSearchEconomy
        return this
    }

    setType(type : string) {
        if(type!== 'system' && type!=='user_created') throw new Error('invalid type')
        this.#type = type
    }

    setFavorite(favorite : boolean){
        this.#favorite = favorite
    }

    setTargetFilesNames(filesnames : string[]) : AIAgent{
        this.#targetFilesNames = filesnames
        return this
    }

    asString(){
        return JSON.stringify(
            {
                id : this.getId(),
                name : this.#name,
                modelName: this.getModelName(),
                model: this.getModelName(),
                systemPrompt: this.getSystemPrompt(),
                num_ctx: this.getContextSize(),
                temperature: this.getTemperature(),
                num_predict: this.getNumPredict(),
                mirostat: this.getMirostat(),
                mirostat_eta: this.getMirostatEta(),
                mirostat_tau: this.getMirostatTau(),
                repeat_last_n: this.getRepeatLastN(),
                repeat_penalty: this.getRepeatPenalty(),
                seed: this.getSeed(),
                stop: this.getStop(),
                tfs_z: this.getTfsZ(),
                top_k: this.getTopK(),
                top_p: this.getTopP(),
                type: this.getType(),
                favorite: this.getFavorite()
            }
        )
    }

    onUpdate(callback : (state: string) => Promise<TAgentReturnValue | void >){
        /*const boundCallback = (state : string) => {
            return callback.call(this, state)
        }*/
        this.#onUpdate = callback //boundCallback
    }

    toObject(){
        return({
            id : this.getId(),
            name : this.#name,
            modelName: this.getModelName(),
            systemPrompt: this.getSystemPrompt(),
            num_ctx: this.getContextSize(),
            temperature: this.getTemperature(),
            num_predict: this.getNumPredict(),
            mirostat: this.getMirostat(),
            mirostat_eta: this.getMirostatEta(),
            mirostat_tau: this.getMirostatTau(),
            repeat_last_n: this.getRepeatLastN(),
            repeat_penalty: this.getRepeatPenalty(),
            seed: this.getSeed(),
            stop: this.getStop(),
            tfs_z: this.getTfsZ(),
            top_k: this.getTopK(),
            top_p: this.getTopP(),
            type: this.getType(),
            favorite: this.getFavorite()
        })
    }
    
    clone() : AIAgent{
        return new AIAgent({
            id : this.getId(),
            name : this.#name,
            modelName: this.getModelName(),
            systemPrompt: this.getSystemPrompt(),
            num_ctx: this.getContextSize(),
            temperature: this.getTemperature(),
            num_predict: this.getNumPredict(),
            mirostat: this.getMirostat(),
            mirostat_eta: this.getMirostatEta(),
            mirostat_tau: this.getMirostatTau(),
            repeat_last_n: this.getRepeatLastN(),
            repeat_penalty: this.getRepeatPenalty(),
            seed: this.getSeed(),
            stop: this.getStop(),
            tfs_z: this.getTfsZ(),
            top_k: this.getTopK(),
            top_p: this.getTopP(),
            type: this.getType(),
            favorite: this.getFavorite(),
            min_p: this.getMinP(),
            num_keep: this.getNumKeep(),
            typical_p: this.getTypicalP(),
            presence_penalty: this.getPresencePenalty(),
            frequency_penalty: this.getFrequencyPenalty(),
            penalize_newline: this.getPenalizeNewline(),
            numa: this.getNuma(),
            num_batch: this.getNumBatch(),
            num_gpu: this.getNumGpu(),
            main_gpu: this.getMainGpu(),
            low_vram: this.getLowVram(),
            vocab_only: this.getVocabOnly(),
            use_mmap: this.getUseMmap(),
            use_mlock: this.getUseMlock(),
            num_thread: this.getNumThread(),
        })
       // return Object.create(this)
    }

    // Observer methods / observer[0] -> AIAgent, observer[1] -> ProgressTracker
    async update(response: string): Promise<TAgentReturnValue | void> {
        try {
            let result: TAgentReturnValue | void
    
            // if the onUpdate callback has been defined, use it
            if (this.#onUpdate) {
                result = await this.#onUpdate(response)
            } else {
                // if not, LLM.ask
                result = await this.defaultAskLLMCallback(response)
            }
    
            if (result && this.#observers.length > 0) {
                return await this.notifyObservers(result)
            }
    
            return result
        } catch (error) {
            console.error(`Error when trying to update the agent ${this.#name} :`, error)
        }
    }

    async defaultAskLLMCallback(query : string) : Promise<TAgentReturnValue | void>{
        try{
            const response = await this.ask(query)
            // if there is no observer listening to this agent (last agent of the chain)
            // if(this.#observers.length < 1) return response
            // if there is at least an observer
            // return await this.notifyObservers(response)
            return response
        }catch(error){
            console.error('Error while trying to communicate with the model : ', error)
            throw error
        }
    }

    addObserver(observer : AIAgent | Mediator | ProgressTracker ) {
        this.#observers.push(observer)
        return observer
    }

    getObservers(){
        return this.#observers
    }

    // notify the next agent in the chain
    // & the chainProgressTracker
    async notifyObservers(response : TAgentReturnValue) : Promise<TAgentReturnValue | void> {
        this.#observers.forEach(observer => {
            if(observer instanceof ProgressTracker) observer.update(response)
        })
        for(const observer of this.#observers){
            if(observer instanceof Mediator) return observer.update((typeof(response) === "object" && 'response' in response) ? {sourceNode : this.#name, data : response.response} : {sourceNode : this.#name, data : response})
            if(observer instanceof AIAgent) return observer.update((typeof(response) === "object" && 'response' in response) ? response.response : response)
        }
        return undefined
    }
}

/*export interface IAIAgentParams{
    name : string
    model : AIModel
}*/

/*
Agent Attributes
Attribute	Description
Role	Defines the agent's function within the crew. It determines the kind of tasks the agent is best suited for.
Goal	The individual objective that the agent aims to achieve. It guides the agent's decision-making process.
Backstory	Provides context to the agent's role and goal, enriching the interaction and collaboration dynamics.
LLM (optional)	Represents the language model that will run the agent. It dynamically fetches the model name from the OPENAI_MODEL_NAME environment variable, defaulting to "gpt-4" if not specified.
Tools (optional)	Set of capabilities or functions that the agent can use to perform tasks. Expected to be instances of custom classes compatible with the agent's execution environment. Tools are initialized with a default value of an empty list.
Function Calling LLM (optional)	Specifies the language model that will handle the tool calling for this agent, overriding the crew function calling LLM if passed. Default is None.
Max Iter (optional)	The maximum number of iterations the agent can perform before being forced to give its best answer. Default is 25.
Max RPM (optional)	The maximum number of requests per minute the agent can perform to avoid rate limits. It's optional and can be left unspecified, with a default value of None.
max_execution_time (optional)	Maximum execution time for an agent to execute a task It's optional and can be left unspecified, with a default value of None, menaning no max execution time
Verbose (optional)	Setting this to True configures the internal logger to provide detailed execution logs, aiding in debugging and monitoring. Default is False.
Allow Delegation (optional)	Agents can delegate tasks or questions to one another, ensuring that each task is handled by the most suitable agent. Default is True.
Step Callback (optional)	A function that is called after each step of the agent. This can be used to log the agent's actions or to perform other operations. It will overwrite the crew step_callback.
Cache (optional)	Indicates if the agent should use a cache for tool usage. Default is True.
*/

/*
interface ModelParams {
  id: string;
  name: string;
  modelName: string;
  systemPrompt: string;
  temperature: number;
  mirostat: number;
  mirostat_eta: number;
  mirostat_tau: number;
}

interface ContextParams {
  context: any[];
  num_ctx: number;
  repeat_last_n: number;
  repeat_penalty: number;
  seed: number;
  stop: string[];
}

interface PredictionParams {
  tfs_z: number;
  num_predict: number;
  top_k: number;
  top_p: number;
}

interface AgentParams {
  type: string;
  favorite: boolean;
  webSearchEconomy: boolean;
  min_p: number;
  num_keep: number;
  typical_p: number;
  presence_penalty: number;
  frequency_penalty: number;
  penalize_newline: boolean;
}

interface HardwareParams {
  numa: boolean;
  num_batch: number;
  num_gpu: number;
  main_gpu: number;
  low_vram: boolean;
  vocab_only: boolean;
  use_mmap: boolean;
  use_mlock: boolean;
  num_thread: number;
}

constructor({
  modelParams = {
    id: "",
    name: "",
    modelName: "llama3.1:8b",
    systemPrompt: "You are an helpful assistant.",
    temperature: 0.8,
    mirostat: 0,
    mirostat_eta: 0.1,
    mirostat_tau: 5.0,
  },
  contextParams = {
    context: [],
    num_ctx: 2048,
    repeat_last_n: 64,
    repeat_penalty: 1.1,
    seed: 0,
    stop: ["\n", "user:", "AI assistant:"],
  },
  predictionParams = {
    tfs_z: 1,
    num_predict: 1024,
    top_k: 40,
    top_p: 0.9,
  },
  agentParams = {
    type: "user_created",
    favorite: false,
    webSearchEconomy: false,
    min_p: 0.0,
    num_keep: 5,
    typical_p: 0.7,
    presence_penalty: 1.5,
    frequency_penalty: 1.0,
    penalize_newline: true,
  },
  hardwareParams = {
    numa: false,
    num_batch: 2,
    num_gpu: 1,
    main_gpu: 0,
    low_vram: false,
    vocab_only: false,
    use_mmap: true,
    use_mlock: false,
    num_thread: 8,
  },
  targetFilesNames = [],
  onUpdate = undefined,
  searchRequest,
}: {
  modelParams: ModelParams;
  contextParams: ContextParams;
  predictionParams: PredictionParams;
  agentParams: AgentParams;
  hardwareParams: HardwareParams;
  targetFilesNames: any[];
  onUpdate: any;
  searchRequest: string;
}) {
  super({
    ...modelParams,
    ...contextParams,
    ...predictionParams,
    ...agentParams,
    ...hardwareParams,
    targetFilesNames,
    onUpdate,
  });
  this.#searchRequest = searchRequest;
}
*/