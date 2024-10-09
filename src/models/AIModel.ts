/* eslint-disable @typescript-eslint/no-unused-vars */

import { ICompletionResponse } from "../interfaces/ICompletionResponse"
import { IEmbeddingResponse } from "../interfaces/IEmbeddingResponse"

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

    #modelName : string
    #systemPrompt : string
    #context : number[]
    #num_ctx : number
    #temperature : number
    #num_predict : number
    #abortController = new AbortController()
    #signal = this.#abortController.signal
    // add keep alive!!!!!
    // add format : json

    constructor({ modelName = "llama3.1:8b", systemPrompt =  'You are a helpful assistant.', context = [], num_ctx = 2048, temperature = 0.8, num_predict = 1024 } : IAIModelParams){
        this.#modelName = modelName
        // this.#stream = stream
        this.#systemPrompt = systemPrompt
        this.#context = context
        this.#num_ctx = num_ctx
        this.#num_predict = num_predict
        this.#temperature = temperature
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
            const response = await fetch("http://127.0.0.1:11434/api/generate", {
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
            // in case of manual request abortion
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error("Request was aborted.");
                }
                this.abortLastRequest()
                throw new Error(`Failed to fetch: ${error.message}`);
            }
            this.abortLastRequest()
            throw new Error("An unknown error occurred.");
        }
    }

    async askForAStreamedResponse(prompt : string) : Promise<ReadableStreamDefaultReader<Uint8Array>>{
        try {
            const response = await fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: this.#buildRequest({prompt, stream : true}),
                signal: this.#signal,
                // keepalive: true
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error("Failed to read response body.")
            }
            return reader

        } catch (error) {
            // in case of manual request abortion
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error("Request was aborted.");
                }
                this.abortLastRequest()
                throw new Error(`Failed to fetch: ${error.message}`);
            }
            this.abortLastRequest()
            throw new Error("An error occurred during streaming.");
        }
    }

    /**
     * @async
     * @function embeddings
     * @param {string} sequence - The sequence for which to generate embeddings.
     * @returns {Promise<IEmbeddingResponse>} The embeddings for the given sequence.
     * @description Sends a request to generate embeddings for the given sequence and returns the embeddings.
     */
    async embeddings(sequence : string) : Promise<IEmbeddingResponse> {
        try {
            const response = await fetch("http://127.0.0.1:11434/api/embeddings", {
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
                }
                throw new Error(`Failed to create embeddings : ${error.message}`);
            }
            throw new Error("An unknown error occurred.");
        }
    }

    async tokenize(sequence : string) : Promise<number[]> {
        try {
            const response = await fetch("http://127.0.0.1:11434/api/tokenize", {
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
                }
                throw new Error(`Failed to tokenize : ${error.message}`);
            }
            throw new Error("An unknown error occurred.");
        }
    }

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

    /**
     * @private
     * @function #buildRequest
     * @param {string} prompt - The prompt for the AI model.
     * @returns {string} The request body for the AI model.
     * @description Builds the request body for the AI model with the given prompt and other parameters.
     */
    #buildRequest({prompt, stream} : {prompt : string, stream : boolean}) : string {
        const baseRequest : IBaseOllamaRequest = {
            "model": this.#modelName,
            "stream": stream,
            "system": this.#systemPrompt,
            "prompt": prompt,
            "context" : [...this.#context],
        }
        const requestWithOptions = {...baseRequest, 
            "options": { 
                "num_ctx": this.#num_ctx,
                "temperature" : this.#temperature, 
                "num_predict" : this.#num_predict 
        }}
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
        console.log(this.#modelName)
        return JSON.stringify({
            "model": /*"mxbai-embed-large"*/ "nomic-embed-text" /*this.#modelName*/,
            "prompt": sequence,
            /*"stream": false,*/
        })
    }

    #buildTokenizeRequest (sequence : unknown) : string {
        console.log(this.#modelName)
        return JSON.stringify({
            "model": /*"mxbai-embed-large"*/ /*"nomic-embed-text"*/ this.#modelName,
            "prompt": sequence,
            /*"stream": false,*/
        })
    }

    abortLastRequest(){
        if(this.#abortController) this.#abortController.abort("Signal aborted.")
        // need to create a new abort controller and a new signal
        // or subsequent request will be aborted from the get go
        this.generateNewAbortControllerAndSignal()
    }

    generateNewAbortControllerAndSignal(){
        this.#abortController = new AbortController()
        this.#signal = this.#abortController.signal
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

    asString(){
        return JSON.stringify({
            model : this.#modelName,
            systemPrompt : this.#systemPrompt,
            num_ctx : this.#num_ctx,
            num_predict : this.#num_predict,
            temperature : this.#temperature,
        })
    }
}

export interface IAIModelParams{
    modelName? : string
    stream? : boolean
    systemPrompt? : string
    context? : number[]
    num_ctx? : number
    temperature? : number
    num_predict? : number
}

export interface IBaseOllamaRequest{
    model: string
    stream: boolean
    system: string
    prompt: string
    context : number[]
    options? : unknown
}