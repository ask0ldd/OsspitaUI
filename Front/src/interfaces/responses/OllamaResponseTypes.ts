export interface IRunningModelsResponse {
    models : IRunningModelInfo[]
}

export interface IRunningModelInfo {
    name: string
    model: string
    size: number
    digest: string
    details: {
        parent_model: string
        format: string
        family: string
        families: string[]
        parameter_size: string
        quantization_level: string
    },
    expires_at: string
    size_vram: number
}

export interface IListModelResponse {
        models : IModelInfos[]
}

interface IModelInfos{
        name: string;
        model: string;
        modifiedAt: Date | string;
        size: number;
        digest: string;
        details?: IModelDetails;  
}

export interface IModelDetails {
    parentModel: string,
    format: string,
    family: string,
    families: string[],
    parameterSize: string,
    quantizationLevel: string,
};

export interface ICompletionResponse{
    model: string
    created_at: string
    response: string
    done: boolean
    context?: number[]
    total_duration?: number
    load_duration?: number
    prompt_eval_count?: number
    prompt_eval_duration?: number
    eval_count?: number
    eval_duration?: number
}
