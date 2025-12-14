import { IComfyWorkflow } from "../../interfaces/IComfyWorkflow";
import { WSMessageType, TWSMessage } from "../../interfaces/TWSMessageType";
import { HistoryObject } from "../ComfyUIService";

export interface IComfyUIService {
  /** Initializes the WebSocket connection to ComfyUI. */
  initSocket(): void;

  /** Disconnects from WebSocket and resets internal callbacks. */
  disconnect(): void;

  /** Registers a callback for a specific WebSocket message type. */
  on(messageType: WSMessageType, callback: (message: TWSMessage) => void): void;

  /** Registers a callback fired when a workflow execution finishes. */
  onWorkflowExecuted(callback: (message: TWSMessage) => void): void;

  /** Removes all registered WebSocket callbacks. */
  resetOnEventsCallbacks(): void;

  /** Fetches a generated image as a Blob. */
  fetchGeneratedImage(filename: string): Promise<Blob | void>;

  /** Queues a workflow for execution via HTTP. */
  queuePrompt(workflow: IComfyWorkflow): Promise<void>;

  /** Fetches past workflow executions. */
  getHistory(maxItems?: number): Promise<HistoryObject | void>;

  /** Fetches an image and returns it as a Base64 data URI. */
  getImageAsBase64String(params: { filename: string; subfolder?: string; type?: string; }): Promise<string | void>;

  /** Fetches details of a specific prompt using its ID. */
  getPrompt(promptId: string): Promise<void>;

  /** Returns the last prompt string sent. */
  getLastPrompt(): string;

  /** Sets the last prompt string sent. */
  setLastPrompt(prompt: string): void;
}
