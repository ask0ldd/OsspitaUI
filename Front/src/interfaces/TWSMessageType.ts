/* export type MessageType = 
  | 'execution_start'
  | 'executing'
  | 'progress'
  | 'executed'
  | 'execution_cached'
  | 'execution_error'
  | 'execution_complete';*/

export type WSMessageType = "execution_start" | "executing" | "progress" | "executed" | "execution_cached" | "execution_error" | "execution_complete"

type TOutput = {
 "images" : [{ filename : string, subfolder : string, type : string}]
}

// Define interfaces for each message type
export interface BaseMessage {
  type: WSMessageType;
}

export interface ExecutionStartMessage extends BaseMessage {
  type: 'execution_start';
  data: { prompt_id : string };
}

export interface ExecutingMessage extends BaseMessage {
  type: 'executing';
  data: { node: string, display_node : string, prompt_id : string, };
}

export interface ProgressMessage extends BaseMessage {
  type: 'progress';
  data: { value: number, max : number, prompt_id : string, node : string };
}

export interface ExecutedMessage extends BaseMessage {
  type: 'executed';
  data: { node: string, display_node : string, prompt_id : string, output : TOutput };
}

export interface ExecutionErrorMessage extends BaseMessage {
  type: 'execution_error';
  data: { exception_message: string };
}

// Union type for all possible message structures
export type TWSMessage = 
  | BaseMessage
  | ExecutingMessage
  | ProgressMessage
  | ExecutedMessage
  | ExecutionStartMessage
  | ExecutionErrorMessage;