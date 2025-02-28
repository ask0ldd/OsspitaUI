/* eslint-disable no-unused-private-class-members */
import { ComfyUIBaseWorkflow } from "../constants/ComfyUIBaseWorkflow"
import ComfyUIWorkflow from "../models/ComfyUIWorkflow"
import ComfyUIWorkflowBase from "../models/ComfyUIWorkflowBase"

class ComfyUIWorkflowBuilder extends ComfyUIWorkflowBase {
    
    constructor() {
        super({...ComfyUIBaseWorkflow});
        this.setRandomSeed();
    }

    build() : ComfyUIWorkflow{
        return new ComfyUIWorkflow(this.workflow)
        // return this.workflow
    }
}

export default ComfyUIWorkflowBuilder