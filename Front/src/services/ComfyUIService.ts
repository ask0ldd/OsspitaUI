/* eslint-disable @typescript-eslint/no-unused-vars */
import { IComfyWorkflow } from "../interfaces/IComfyWorkflow";
import { TWSMessage, WSMessageType } from "../interfaces/TWSMessageType";

/* eslint-disable no-unused-private-class-members */
class ComfyUIService {
    readonly #name : string
    #serverAddress = "127.0.0.1:8188"
    #ws! : WebSocket
    #messagesCallbacks: { [key: string]: ((message: TWSMessage) => void)[] } = {}
    #workflowExecutedCallbacks : ((message: TWSMessage) => void)[] = []
    #lastPrompt = ""

    constructor(){
        this.#name = this.generateUniqueName()
    }

    initSocket(){
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

    disconnect(){
      this.resetOnEventsCallbacks()
      this.#ws.close()
    }

    on(messageType: WSMessageType, callback: (message: TWSMessage) => void) {
      if (!this.#messagesCallbacks[messageType]) {
          this.#messagesCallbacks[messageType] = [];
      }
      this.#messagesCallbacks[messageType].push(callback);
    }

    onWorkflowExecuted(callback: (message: TWSMessage) => void){
      this.#workflowExecutedCallbacks.push(callback)
    }

    resetOnEventsCallbacks(){
      this.#workflowExecutedCallbacks = []
      this.#messagesCallbacks = {}
    }

    handleWSMessage(message: TWSMessage) {

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

    generateUniqueName(): string {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2);
        return `${timestamp}${randomPart}`;
    }

    async queuePrompt(workflow : IComfyWorkflow){
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

    async getHistory(maxItems?: number) : Promise<HistoryObject | void>{
        const response = await fetch(`http://${this.#serverAddress}/history` + (maxItems ? '?maxItems=' + maxItems : ''))
        if(response.ok) return await response.json()
    }

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

    async getPrompt(promptId : string) {
        const response = await fetch(`http://${this.#serverAddress}/history?` + promptId)
        console.log(await response.json())
    }

    getLastPrompt(){
      return this.#lastPrompt
    }

    setLastPrompt(prompt : string){
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
  
  interface HistoryObject {
    [key: string]: PromptEntry;
  }