/* eslint-disable no-unused-private-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IEmbeddingResponse } from "../interfaces/responses/IEmbeddingResponse"
import { IAIModelParams } from "../interfaces/params/IAIModelParams"
import visionModelsClues from "../constants/VisionModelsClues"
import { ICompletionResponse } from "../interfaces/responses/OllamaResponseTypes"

/**
 * @class AIModel
 * @description A class representing an AI model for generating text and embeddings.
 * @property {string} #modelName - The name of the AI model.
 * @property {boolean} #stream - Whether to stream the response or not.
 * @property {string} #systemPrompt - The system prompt for the AI model.
 * @property {number[]} #context - The context for the AI model.
 * @property {number} #contextSize - The size of the context for the AI model.
 */
export class AIModel{

    #modelName = "llama3.1:8b"
    #systemPrompt = "You are an helpful assistant."
    #context : number[] = []
    #num_ctx = 2048
    #temperature = 0.8
    #num_predict = 1024
    #abortController = new AbortController()
    #signal = this.#abortController.signal
    #mirostat = 0
    #mirostat_eta = 0.1
    #mirostat_tau = 5.0
    #repeat_last_n = 64
    #repeat_penalty = 1.1
    #seed = 0
    #stop = ["\n", "user:", "AI assistant:"] // "AI assistant:"
    #tfs_z = 1
    #top_k = 40
    #top_p = 0.9
    #status : "standard" | "base" | "favorite" = "standard"

    #min_p = 0.0
    #num_keep = 5
    #typical_p = 0.7
    #presence_penalty = 1.5
    #frequency_penalty = 1.0
    #penalize_newline = true
    #numa = false
    #num_batch = 2
    #num_gpu = 1
    #main_gpu = 0
    #low_vram = false
    #vocab_only = false
    #use_mmap = true
    #use_mlock = false
    #num_thread = 8

    #thinkingTags : [string, string] | null = null
    #discardThinking = false
   
    // add keep alive!!!!!
    // add format : json

    constructor({ 
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
        status = "standard",
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
    } : IAIModelParams){
        this.#modelName = modelName
        this.#systemPrompt = systemPrompt
        this.#context = context
        this.#num_ctx = num_ctx
        this.#num_predict = num_predict
        this.#temperature = temperature
        this.#mirostat = mirostat
        this.#mirostat_eta = mirostat_eta
        this.#mirostat_tau = mirostat_tau
        this.#repeat_last_n = repeat_last_n
        this.#repeat_penalty = repeat_penalty
        this.#seed = seed
        this.#stop = stop
        this.#tfs_z = tfs_z
        this.#top_k = top_k
        this.#top_p = top_p
        this.#status = status
        this.#min_p = min_p
        this.#num_keep = num_keep
        this.#typical_p = typical_p
        this.#presence_penalty = presence_penalty
        this.#frequency_penalty = frequency_penalty
        this.#penalize_newline = penalize_newline
        this.#numa = numa
        this.#num_batch = num_batch
        this.#num_gpu = num_gpu
        this.#main_gpu = main_gpu
        this.#low_vram = low_vram
        this.#vocab_only = vocab_only
        this.#use_mmap = use_mmap
        this.#use_mlock = use_mlock
        this.#num_thread = num_thread
    }

    /**
     * @async
     * @function ask
     * @param {string} prompt - The prompt for the AI model.
     * @returns {Promise<ICompletionResponse>} The response from the AI model.
     * @description Sends a request to the AI model with the given prompt and returns the response.
     */
    async ask(prompt : string) : Promise<ICompletionResponse> {
        try {
            const response = await fetch("/ollama/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: this.#buildRequest({prompt, stream : false}),
                signal: this.#signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json()
            
        } catch (error) {
            if (error instanceof Error) {
                // in case of manual request abortion
                if (error.name === "AbortError") {
                    console.error(error.message)
                    throw error
                }
                this.abortLastRequest()
                console.error(error.message)
                throw error
            }
            this.abortLastRequest()
            console.error(error)
            throw error
        }
    }

    /**
     * @param {string} prompt - The prompt to send to the model.
     * @param {string[]} [images=[]] - An optional array of image URLs or base64 encoded images.
     * @returns {Promise<ReadableStreamDefaultReader<Uint8Array>>} A promise that resolves to a ReadableStreamDefaultReader.
     * @throws {Error} Throws an error if no image is provided for vision models.
     * @throws {Error} Throws an error if the HTTP response is not ok.
     * @throws {Error} Throws an error if the response body cannot be read.
     * @throws {Error} Rethrows any caught errors, including AbortError.
     * @description Sends a request to the Ollama API for a streamed response. Supports both text and vision models.
     */
    async askForAStreamedResponse(prompt : string, images : string[] = []) : Promise<ReadableStreamDefaultReader<string/*Uint8Array*/>>{
        try {
            if(visionModelsClues.some(clue => this.#modelName.toLowerCase().includes(clue)) && images.length < 1) throw new Error("No image provided / selected.")

            const response = await fetch("/ollama/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // ? querying an image : no image
                body:  (images.length && visionModelsClues.some(clue => this.#modelName.toLowerCase().includes(clue))) ? this.#buildVisionRequest({prompt, stream : true, images}) : this.#buildRequest({prompt, stream : true}),
                signal: this.#signal,
                // keepalive: true
            })

            if (!response.ok)  throw new Error(`HTTP error! status: ${response.status}`)

            if(!response.body) throw new Error("Failed to read response body.")

            const reader = this.#consolidateStream(response.body).getReader()

            return reader

        } catch (error) {
            if (error instanceof Error) {
                // in case of manual request abortion
                if (error.name === "AbortError") {
                    console.error(error.message)
                    throw error
                }
                this.abortLastRequest()
                console.error(error.message)
                throw error
            }
            this.abortLastRequest()
            console.error(error)
            throw error
        }
    }

    /**
     * Consolidates and fixes incomplete or concatenated chunks in a ReadableStream.
     * 
     * @param {ReadableStream} originalStream - The original stream to be consolidated.
     * @returns {ReadableStream<string>} A new ReadableStream with consolidated and fixed chunks.
     * @private
     */
    #consolidateStream(originalStream: ReadableStream): ReadableStream<string> {
        console.log("consolidate")
        return new ReadableStream({
            start(controller: ReadableStreamDefaultController) {
                const reader = originalStream.getReader()
                const textDecoder = new TextDecoder()
                
                async function pump(): Promise<void> {
                    const { done, value } = await reader.read()
                    if (done) {
                        controller.close()
                        return
                    }

                    let decodedValue = textDecoder.decode(value, { stream: true })

                    if(decodedValue.includes('"done":true') && !decodedValue.trim().endsWith("}")) 
                        decodedValue = await StreamConsolidator.malformedEndingValueReconstructor(decodedValue, reader, textDecoder)
    
                    // check if the decoded value isn't malformed -> fix it if it is
                    const reconstructedValue = StreamConsolidator.malformedValueReconstructor(decodedValue)

                    controller.enqueue(reconstructedValue)
                    return pump()
                }
                
                return pump()
            }
        })
    }

    /**
     * @async
     * @function embeddings
     * @param {string} sequence - The sequence for which to generate embeddings.
     * @returns {Promise<IEmbeddingResponse>} The embeddings for the given sequence.
     * @description Sends a request to generate embeddings for the given sequence and returns the embeddings.
     */
    async askEmbeddingsFor(sequence : string) : Promise<IEmbeddingResponse> {
        try {
            const response = await fetch("/ollama/api/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: this.#buildEmbeddingRequest(sequence),
                // signal: this.#signal,
                // keepalive: true
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json()

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error("Request was aborted.");
                } else {
                    throw new Error(`Failed to create embeddings : ${error.message}`);
                }
            }
            throw new Error("An unknown error occurred.");
        }
    }

    /*async tokenize(sequence : string) : Promise<number[]> {
        try {
            const response = await fetch("/ollama/api/tokenize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: this.#buildTokenizeRequest(sequence),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return (await response.json())?.tokens

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error("Request was aborted.");
                } else {
                    throw new Error(`Failed to tokenize : ${error.message}`);
                }
            }
            throw new Error("An unknown error occurred.");
        }
    }*/

    /**
     * @private
     * @function #buildRequest
     * @param {string} prompt - The prompt for the AI model.
     * @returns {string} The request body for the AI model.
     * @description Builds the request body for the AI model with the given prompt and other parameters.
     */
    #buildRequest({prompt, stream, outputFormat} : {prompt : string, stream : boolean, outputFormat? : string}) : string {
        const baseRequest : IBaseOllamaRequest = {
            "model": this.#modelName,
            "stream": stream,
            "system": this.#systemPrompt,
            "prompt": prompt,
            "context" : [...this.#context],
        }

        /* https://ollama.com/blog/structured-outputs
        const request = outputFormat ? {...baseRequest,
            "format" : {
                "type": "object",
                "properties": outputFormat
            },
            "required" : [output]
        } : baseRequest*/

        const requestWithOptions = {...baseRequest, 
            "options": this.getPartialOptions()
        }
        return JSON.stringify(requestWithOptions)
    }

    #buildVisionRequest({prompt, images, stream} : {prompt : string, images : string[], stream : boolean}) : string {
        const baseRequest : IBaseVisionOllamaRequest = {
            "model": this.#modelName,
            "stream": stream,
            // "system": this.#systemPrompt,
            "prompt": prompt,
            // "context" : [...this.#context],
            "images" : this.#modelName.includes("llama") && this.#modelName.includes("vision") ? [images[0]] : [...images],
        }
        const requestWithOptions = {...baseRequest, "options": this.getPartialOptions()}
        return JSON.stringify(requestWithOptions)
    }

    /**
     * @private
     * @function #buildEmbeddingRequest
     * @param {any} sequence - The sequence for which to generate embeddings.
     * @returns {string} The request body for generating embeddings.
     * @description Builds the request body for generating embeddings for the given sequence.
     */
    #buildEmbeddingRequest (sequence : unknown) : string {
        return JSON.stringify({
            "model": this.#modelName, /*"nomic-embed-text" "mxbai-embed-large"*/
            "prompt": sequence,
        })
    }

    /*#buildTokenizeRequest (sequence : unknown) : string {
        console.log(this.#modelName)
        return JSON.stringify({
            "model": this.#modelName,
            "prompt": sequence,
        })
    }*/

    // !!! should instead pass the controller to the conversation?!!! so that model can be easily switched
    abortLastRequest() : void{
        if(this.#abortController) this.#abortController.abort("Signal aborted.")
        // need to create a new abort controller and a new signal
        // or subsequent request will be aborted from the get go
        this.generateNewAbortControllerAndSignal()
    }

    generateNewAbortControllerAndSignal() : void{
        this.#abortController = new AbortController()
        this.#signal = this.#abortController.signal
    }

    #escapeRegExp(string : string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    //#region Discard Thinking

    #discardThinkingSequence(response : string) : string {
        if(!this.#thinkingTags) return response
        const pattern = this.#escapeRegExp(this.#thinkingTags[0]) + "[\\s\\S]*?" + this.#escapeRegExp(this.#thinkingTags[1])
        const regex = new RegExp(pattern, "g")
        return response.replace(regex, "")
    }
   
    setThinkingTags({startWith, endWith} : {startWith : string, endWith : string}) : this {
        this.#thinkingTags = [startWith, endWith]
        return this
    }

    activateDiscardThinking(targetTag : {startWith : string, endWith : string}) : this {
        this.#discardThinking = true
        this.setThinkingTags({startWith : targetTag.startWith, endWith : targetTag.endWith})
        return this
    }

    //#region Getters & Setters

    /**
     * @function setSystemPrompt
     * @param {string} prompt - The new system prompt for the AI model.
     * @description Sets the system prompt for the AI model.
     */
    setSystemPrompt(prompt : string) : this {
        this.#systemPrompt = prompt
        return this
    }

    /**
     * @function setModel
     * @param {string} modelName - The new name of the AI model.
     * @description Sets the name of the AI model.
     */
    setModel(modelName : string) : this {
        this.#modelName = modelName
        return this
    }

    /**
     * @function setContextSize
     * @param {number} value - The new size of the context for the AI model.
     * @description Sets the size of the context for the AI model.
     */
    setContext(context : number[]) : this {
        this.#context = [...context]
        return this
    }

    /**
     * @function setContextSize
     * @param {number} value - The new size of the context for the AI model.
     * @description Sets the size of the context for the AI model.
     */
    setContextSize(value : number) : this {
        if(value < 0) value = 0
        this.#num_ctx = value
        return this
    }

    /**
     * @function setTemperature
     * @param {number} value - The new temperature for the AI model.
     * @description Sets the temperature for the AI model.
     */
    setTemperature(value : number) : this {
        if(value > 1) value = 1
        if(value < 0) value = 0
        this.#temperature = value
        return this
    }

    setNumPredict(value : number){
        this.#num_predict = value
        return this
    }

    setSettings({ modelName = "llama3.1:8b", systemPrompt =  'You are a helpful assistant.', context = [], num_ctx = 2048, temperature = 0.8, num_predict = 1024 } : IAIModelParams){
        this.#modelName = modelName
        this.#systemPrompt = systemPrompt
        this.#context = context
        this.#num_ctx = num_ctx
        this.#num_predict = num_predict
        this.#temperature = temperature
    }

    setNumCtx(value: number) {
        this.#num_ctx = value;
        return this;
    }
     
    setMirostat(value: number) {
        this.#mirostat = value;
        return this;
    }
    
    setMirostatEta(value: number) {
        this.#mirostat_eta = value;
        return this;
    }
    
    setMirostatTau(value: number) {
        this.#mirostat_tau = value;
        return this;
    }
    
    setRepeatLastN(value: number) {
        this.#repeat_last_n = value;
        return this;
    }
    
    setRepeatPenalty(value: number) {
        this.#repeat_penalty = value;
        return this;
    }
    
    setSeed(value: number) {
        this.#seed = value;
        return this;
    }
    
    setStop(value: ["AI assistant:"]) {
        this.#stop = value;
        return this;
    }
    
    setTfsZ(value: number) {
        this.#tfs_z = value;
        return this;
    }
    
    setTopK(value: number) {
        this.#top_k = value;
        return this;
    }
    
    setTopP(value: number) {
        this.#top_p = value;
        return this;
    }
    
    setStatus(value: "standard" | "base" | "favorite") {
        this.#status = value;
        return this;
    }

    setMinP(value: number): AIModel {
        this.#min_p = value;
        return this;
    }
    
    setNumKeep(value: number): AIModel {
        this.#num_keep = value;
        return this;
    }
    
    setTypicalP(value: number): AIModel {
        this.#typical_p = value;
        return this;
    }
    
    setPresencePenalty(value: number): AIModel {
        this.#presence_penalty = value;
        return this;
    }
    
    setFrequencyPenalty(value: number): AIModel {
        this.#frequency_penalty = value;
        return this;
    }
    
    setPenalizeNewline(value: boolean): AIModel {
        this.#penalize_newline = value;
        return this;
    }
    
    setNuma(value: boolean): AIModel {
        this.#numa = value;
        return this;
    }
    
    setNumBatch(value: number): AIModel {
        this.#num_batch = value;
        return this;
    }
    
    setNumGpu(value: number): AIModel {
        this.#num_gpu = value;
        return this;
    }
    
    setMainGpu(value: number): AIModel {
        this.#main_gpu = value;
        return this;
    }
    
    setLowVram(value: boolean): AIModel {
        this.#low_vram = value;
        return this;
    }
    
    setVocabOnly(value: boolean): AIModel {
        this.#vocab_only = value;
        return this;
    }
    
    setUseMmap(value: boolean): AIModel {
        this.#use_mmap = value;
        return this;
    }
    
    setUseMlock(value: boolean): AIModel {
        this.#use_mlock = value;
        return this;
    }
    
    setNumThread(value: number): AIModel {
        this.#num_thread = value;
        return this;
    }   

    getSystemPrompt() : string{
        return this.#systemPrompt
    }

    getTemperature() : number {
        return this.#temperature
    }

    getContextSize() : number {
        return this.#num_ctx
    }

    getModelName() : string {
        return this.#modelName
    }

    getNumPredict() : number {
        return this.#num_predict
    }
    
    getMirostat(): number {
        return this.#mirostat;
    }
    
    getMirostatEta(): number {
        return this.#mirostat_eta;
    }
    
    getMirostatTau(): number {
        return this.#mirostat_tau;
    }
    
    getRepeatLastN(): number {
        return this.#repeat_last_n;
    }
    
    getRepeatPenalty(): number {
        return this.#repeat_penalty;
    }
    
    getSeed(): number {
        return this.#seed;
    }
    
    getStop(): string[] {
        return this.#stop;
    }
    
    getTfsZ(): number {
        return this.#tfs_z;
    }
    
    getTopK(): number {
        return this.#top_k;
    }
    
    getTopP(): number {
        return this.#top_p;
    }

    getContext() : number[]{
        return this.#context
    }
    
    getStatus(): "standard" | "base" | "favorite" {
        return this.#status;
    }    

    getSignal() : AbortSignal{
        return this.#signal;
    }

    getMinP(): number {
        return this.#min_p;
    }

    getNumKeep(): number {
        return this.#num_keep;
    }

    getTypicalP(): number {
        return this.#typical_p;
    }

    getPresencePenalty(): number {
        return this.#presence_penalty;
    }

    getFrequencyPenalty(): number {
        return this.#frequency_penalty;
    }

    getPenalizeNewline(): boolean {
        return this.#penalize_newline;
    }

    getNuma(): boolean {
        return this.#numa;
    }

    getNumBatch(): number {
        return this.#num_batch;
    }

    getNumGpu(): number {
        return this.#num_gpu;
    }

    getMainGpu(): number {
        return this.#main_gpu;
    }

    getLowVram(): boolean {
        return this.#low_vram;
    }

    getVocabOnly(): boolean {
        return this.#vocab_only;
    }

    getUseMmap(): boolean {
        return this.#use_mmap;
    }

    getUseMlock(): boolean {
        return this.#use_mlock;
    }

    getNumThread(): number {
        return this.#num_thread;
    }

    getThinkingTags() : [string, string] | null{
        return this.#thinkingTags
    }

    get discardThinking() {
        return this.#discardThinking
    }

    //#endregion

    asString(){
        return JSON.stringify({
            modelName: this.#modelName,
            systemPrompt: this.#systemPrompt,
            context: this.#context,
            num_ctx: this.#num_ctx,
            temperature: this.#temperature,
            num_predict: this.#num_predict,
            mirostat: this.#mirostat,
            mirostat_eta: this.#mirostat_eta,
            mirostat_tau: this.#mirostat_tau,
            repeat_last_n: this.#repeat_last_n,
            repeat_penalty: this.#repeat_penalty,
            seed: this.#seed,
            stop: this.#stop,
            tfs_z: this.#tfs_z,
            top_k: this.#top_k,
            top_p: this.#top_p,
            status: this.#status,
            min_p: this.#min_p,
            num_keep: this.#num_keep,
            typical_p: this.#typical_p,
            presence_penalty: this.#presence_penalty,
            frequency_penalty: this.#frequency_penalty,
            penalize_newline: this.#penalize_newline,
            numa: this.#numa,
            num_batch: this.#num_batch,
            num_gpu: this.#num_gpu,
            main_gpu: this.#main_gpu,
            low_vram: this.#low_vram,
            vocab_only: this.#vocab_only,
            use_mmap: this.#use_mmap,
            use_mlock: this.#use_mlock,
            num_thread: this.#num_thread,
        })
    }

    getPartialOptions(){
        return ({
            num_ctx: this.#num_ctx,
            temperature: this.#temperature,
            num_predict: this.#num_predict,
            mirostat: this.#mirostat,
            mirostat_eta: this.#mirostat_eta,
            mirostat_tau: this.#mirostat_tau,
            repeat_last_n: this.#repeat_last_n,
            repeat_penalty: this.#repeat_penalty,
            seed: this.#seed,
            tfs_z: this.#tfs_z,
            top_k: this.#top_k,
            top_p: this.#top_p,
        })
    }

    getOptions(){
        return ({
            num_ctx: this.#num_ctx,
            temperature: this.#temperature,
            num_predict: this.#num_predict,
            mirostat: this.#mirostat,
            mirostat_eta: this.#mirostat_eta,
            mirostat_tau: this.#mirostat_tau,
            repeat_last_n: this.#repeat_last_n,
            repeat_penalty: this.#repeat_penalty,
            seed: this.#seed,
            tfs_z: this.#tfs_z,
            top_k: this.#top_k,
            top_p: this.#top_p,
            min_p: this.#min_p,
            num_keep: this.#num_keep,
            typical_p: this.#typical_p,
            presence_penalty: this.#presence_penalty,
            frequency_penalty: this.#frequency_penalty,
            penalize_newline: this.#penalize_newline,
            numa: this.#numa,
            num_batch: this.#num_batch,
            num_gpu: this.#num_gpu,
            main_gpu: this.#main_gpu,
            low_vram: this.#low_vram,
            vocab_only: this.#vocab_only,
            use_mmap: this.#use_mmap,
            use_mlock: this.#use_mlock,
            num_thread: this.#num_thread,
        })
    }
}

type TReadableStreamValue = Uint8Array<ArrayBufferLike> | undefined;

interface IBaseRequest{
    model: string
    stream: boolean
    prompt: string
}

export interface IBaseOllamaRequest extends IBaseRequest{
    system: string
    context : number[]
    options? : unknown
}

interface IBaseVisionOllamaRequest extends IBaseRequest {
    images: string[]
}

interface IOllamaChunk {
    model : string
    created_at : string
    response : string
    done : boolean
}

class StreamConsolidator{
    // close all split chunks on both ends if needed
    static #bracingChunk(unsafeChunk: string){
        const trimmedValue = unsafeChunk.trim()
        return (trimmedValue.startsWith('{') ? '' : '{') +
            trimmedValue +
        (trimmedValue.endsWith('}') ? '' : '}')
    }

    // parse all split chunks and aggregate the response value
    static #mergeChunks(bracedChunks : string[]){
        let reconstructedValue = ''
        let isDone = false
        let lastChunk
    
        for (const chunk of bracedChunks) {
            const parsedChunk = JSON.parse(chunk)
            reconstructedValue += parsedChunk.response
            // if one of the malformed chunk is the {..., done : true } chunk
            // then the reconstructed chunk becomes a {..., done : true } chunk itself
            isDone = isDone || parsedChunk.done
            lastChunk = parsedChunk
        }
    
        return {
            ...lastChunk,
            response: reconstructedValue,
            done: isDone
        }
    }

    // split one malformed block into multiple ones if needed
    static malformedValueReconstructor(value : string | null) : string{
      try{
        // console.log("untouchedValue : " + value)
        if(value == null) return JSON.stringify({"model":"","created_at":"","response":" ","done":false})
        // try splitting the chunk into multiple ones
        const unsafeChunks = value.split("}\n{")
        if(unsafeChunks.length == 1) return value.trim()
        // close all split chunks on both ends if needed
        const bracedChunks = unsafeChunks.map(this.#bracingChunk)
        // parse all split chunks and aggregate the response value
        const aggregatedChunk = this.#mergeChunks(bracedChunks)
        // console.log("rebuilt : " + JSON.stringify(aggregatedChunk))
        return JSON.stringify(aggregatedChunk)
      } catch (error) {
        // this.abortAgentLastRequest()
        console.error(`Can't reconstruct these values : ` + JSON.stringify(value))
        throw error
      }
    }

    /* memo : decodedValue structure : {"model":"qwen2.5:3b","created_at":"2024-09-29T15:14:02.9781312Z","response":" also","done":false} */
    // deal with the very last datas chunk being unexpectedly split into partial chunks
    static async malformedEndingValueReconstructor(value : string, reader : ReadableStreamDefaultReader<Uint8Array>, decoder : TextDecoder) : Promise<string>{
      let nextChunk = ""
      let decodedValue = value
      while(true){
        console.log("trying to add subsequent value")
        // try retrieving the next partial chunk to see if it is enough to rebuild a complete chunk
        nextChunk = decoder.decode((await reader.read()).value)
        if(nextChunk == null) {
          // if the chunk can't be reconstructed despite the stream coming to and end
          // -> a chunk with an empty context is returned
          decodedValue = decodedValue.split(',"context"')[0] + ',"context":[]}'
          break
        }
        decodedValue += nextChunk
        // if with this addition the chunk is now complete, break the loop
        if(decodedValue.trim().endsWith("}")) break
      }
      return decodedValue
    }
}