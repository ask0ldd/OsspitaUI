import { IComfyWorkflow } from "../interfaces/IComfyWorkflow";
import ComfyUIWorkflowBase from "./ComfyUIWorkflowBase";

export default class ComfyUIWorkflow extends ComfyUIWorkflowBase {
    
    constructor(workflow: IComfyWorkflow) {
        super(workflow);
    }

    get(){
        return this.workflow
    }

    countNodes(){
        if(typeof this.workflow !== "object") return 0
        return Object.keys(this.workflow).length
    }
}