import { IComfyWorkflow } from "../IComfyWorkflow";
import { ILokiBaseInterface } from "./ILokiBaseInterface";

export interface IComfyWorklowResponse extends ILokiBaseInterface {
    name : string
    workflow : IComfyWorkflow
}