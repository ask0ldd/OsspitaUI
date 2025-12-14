/* eslint-disable @typescript-eslint/no-unused-vars */
import { IComfyWorkflow } from "../interfaces/IComfyWorkflow";
import { TWSMessage, WSMessageType } from "../interfaces/TWSMessageType";
import { IComfyUIService } from "./interfaces/IComfyUIService";

/**
 * Service for interacting with the ComfyUI WebSocket API and HTTP endpoints.
 * Handles workflow execution, message callbacks, and image fetching.
 */
/* eslint-disable no-unused-private-class-members */
class ComfyUIService implements IComfyUIService {
    readonly #name : string
    #serverAddress = "127.0.0.1:8188"
    #ws! : WebSocket
    #messagesCallbacks: { [key: string]: ((message: TWSMessage) => void)[] } = {}
    #workflowExecutedCallbacks : ((message: TWSMessage) => void)[] = []
    #lastPrompt = ""

    constructor(){
        this.#name = this.generateUniqueName()
    }

    /**
     * Initializes the WebSocket connection and sets up event handlers.
     * @returns {void}
     */
    initSocket(): void{
      this.#ws = new WebSocket('ws://127.0.0.1:8188/ws?clientId=' + this.#name)

      this.#ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleWSMessage(message);
      }
      
      this.#ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      }
      
      this.#ws.onclose = () => {
        console.log('Disconnected from ComfyUI WebSocket');
      }
    }

    /**
     * Disconnects from the WebSocket and resets event callbacks.
     * @returns {void}
     */
    disconnect(): void{
      this.resetOnEventsCallbacks()
      this.#ws.close()
    }

    /**
     * Registers a callback for a specific WebSocket message type.
     * @param {WSMessageType} messageType - Type of the message to listen for.
     * @param {(message: TWSMessage) => void} callback - Callback function.
     * @returns {void}
     */
    on(messageType: WSMessageType, callback: (message: TWSMessage) => void): void {
      if (!this.#messagesCallbacks[messageType]) {
          this.#messagesCallbacks[messageType] = [];
      }
      this.#messagesCallbacks[messageType].push(callback);
    }

    /**
     * Registers a callback for workflow executed events.
     * @param {(message: TWSMessage) => void} callback - Callback function.
     * @returns {void}
     */
    onWorkflowExecuted(callback: (message: TWSMessage) => void): void{
      this.#workflowExecutedCallbacks.push(callback)
    }

    /**
     * Clears all registered event callbacks.
     * @returns {void}
     */
    resetOnEventsCallbacks(): void{
      this.#workflowExecutedCallbacks = []
      this.#messagesCallbacks = {}
    }

    /**
     * Handles incoming WebSocket messages and dispatches to callbacks.
     * @param {TWSMessage} message - The message object.
     * @returns {void}
     */
    handleWSMessage(message: TWSMessage): void {

      // Execute registered callbacks for this message type
      /*const callbacks = this.#messagesCallbacks[message.type]
      if (callbacks) {
          callbacks.forEach(callback => callback(message))
      }*/

      switch (message.type) {
        case 'execution_start':
          console.log('Workflow execution started')
          if(Array.isArray(this.#messagesCallbacks["execution_start"])) this.#messagesCallbacks["execution_start"].forEach(callback => callback(message))
          break
        case 'executing':
          if("data" in message && "node" in message.data) 
            console.log('Executing node:', message.data.node)
          break
        case 'progress':
          if("data" in message && "value" in message.data && "max" in message.data)
          {
            const percentage = Math.round(message.data.value / message.data.max * 100)
            if(Array.isArray(this.#messagesCallbacks["progress"])) this.#messagesCallbacks["progress"].forEach(callback => callback(message))
            console.log('Progress:', percentage, '%')
          }
          break
        case 'executed':
          this.#workflowExecutedCallbacks.forEach(callback => callback(message))
          if("data" in message && "node" in message.data) 
            console.log('Node executed:', message.data.node)
          console.log(JSON.stringify(message))
          break
        case 'execution_cached':
          console.log('Execution cached')
          break
        case 'execution_error':
          if("data" in message && "exception_message" in message.data)
            console.error('Execution error:', message.data.exception_message)
          break
        case 'execution_complete':
          console.log('Workflow execution completed', JSON.stringify(message))
          break
      }
    }

    /*WSSendWorkflow(workflow: IComfyWorkflow) {
      const message = {
        type: 'execute',
        data: {
          prompt: workflow,
          client_id: this.#name
        }
      }
      this.#ws.send(JSON.stringify(message))
    }*/
    
    /**
     * Fetches a generated image as a Blob.
     * @param {string} filename - Image filename.
     * @returns {Promise<Blob|void>} Resolves with image Blob or void on error.
     */
    async fetchGeneratedImage(filename: string): Promise<Blob | void> {
      try{
        const response = await fetch(`http://${this.#serverAddress}/view?filename=${filename}`)
        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }
        return await response.blob()
      }catch(error){
          console.error("Error fetching image : ", error)
          return void 0
      }
    }

    /**
     * Generates a unique client name.
     * @returns {string} Unique name.
     */
    generateUniqueName(): string {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2);
        return `${timestamp}${randomPart}`;
    }

    /**
     * Queues a workflow prompt for execution via HTTP.
     * @param {IComfyWorkflow} workflow - The workflow to execute.
     * @returns {Promise<void>}
     */
    async queuePrompt(workflow : IComfyWorkflow): Promise<void>{
        const body = {client_id : this.#name, prompt : {...workflow}}

        const response = await fetch(`http://${this.#serverAddress}/prompt`, {
            method : 'POST',
            body : JSON.stringify(body),
            headers:{ 
                'Content-Type' : 'application/json', 
            }
        })
        if(response.ok) console.log(await response.text())
    }

    /**
     * Fetches workflow execution history.
     * @param {number} [maxItems] - Optional max number of items to fetch.
     * @returns {Promise<HistoryObject|void>}
     */
    async getHistory(maxItems?: number) : Promise<HistoryObject | void>{
        const response = await fetch(`http://${this.#serverAddress}/history` + (maxItems ? '?maxItems=' + maxItems : ''))
        if(response.ok) return await response.json()
    }

    /**
     * Fetches an image and returns it as a base64 string.
     * @param {Object} params
     * @param {string} params.filename - Image filename.
     * @param {string} [params.subfolder] - Optional subfolder.
     * @param {string} [params.type] - Optional type (default: "output").
     * @returns {Promise<string|void>} Resolves with base64 string or void on error.
     */
    async getImageAsBase64String({ filename, subfolder = "", type = "output" } : { filename: string, subfolder?: string, type?: string }) : Promise<string | void>{
        try{
            const response = await fetch(`http://${this.#serverAddress}/view?` + encodeURI(new URLSearchParams({ filename, subfolder, type }).toString()))
            const imageBlob = await response.blob()
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to convert image to base64'));
                }
                };
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });
        }catch(error){
            console.error("Error fetching image : ", error)
            return void 0
        }
    }

    /**
     * Fetches a prompt by its ID.
     * @param {string} promptId - Prompt ID.
     * @returns {Promise<void>}
     */
    async getPrompt(promptId : string) : Promise<void> {
        const response = await fetch(`http://${this.#serverAddress}/history?` + promptId)
        console.log(await response.json())
    }

    /**
     * Gets the last prompt sent.
     * @returns {string}
     */
    getLastPrompt() : string{
      return this.#lastPrompt
    }

    /**
     * Sets the last prompt sent.
     * @param {string} prompt - The prompt string.
     * @returns {void}
     */
    setLastPrompt(prompt : string): void{
      this.#lastPrompt = prompt
    }
}

export default ComfyUIService

// a nice hotel room looking like a 3d render with a haussmanian touch and red walls

// type WSMessageType = "execution_start" | "executing" | "progress" | "executed" | "execution_cached" | "execution_error" | "execution_complete"

interface PromptInput {
    seed: number;
    steps: number;
    cfg: number;
    sampler_name: string;
    scheduler: string;
    denoise: number;
    model: [string, number];
    positive: [string, number];
    negative: [string, number];
    latent_image: [string, number];
  }
  
  interface NodeInput {
    [key: string]: unknown;
  }
  
  interface Node {
    inputs: NodeInput;
    class_type: string;
    _meta: {
      title: string;
    };
  }
  
  interface PromptData {
    [key: string]: Node;
  }
  
  interface OutputImage {
    filename: string;
    subfolder: string;
    type: string;
  }
  
  interface Output {
    images: OutputImage[];
  }
  
  interface StatusMessage {
    prompt_id: string;
    timestamp: number;
    nodes?: string[];
  }
  
  interface Status {
    status_str: string;
    completed: boolean;
    messages: [string, StatusMessage][];
  }
  
  interface Meta {
    [key: string]: {
      node_id: string;
      display_node: string;
      parent_node: string | null;
      real_node_id: string;
    };
  }
  
  interface PromptEntry {
    prompt: [number, string, PromptData, object, string[]];
    outputs: {
      [key: string]: Output;
    };
    status: Status;
    meta: Meta;
  }
  
  export interface HistoryObject {
    [key: string]: PromptEntry;
  }