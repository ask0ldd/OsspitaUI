import { IListModelResponse, IRunningModelsResponse } from "../interfaces/responses/OllamaResponseTypes";


export class OllamaService{
    static async getModelList() : Promise<IListModelResponse | undefined>{
        const url = "/ollama/api/tags"
        try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Response status: ${response.status}`);
            }
            const json = await response.json();
            return json
        } catch (error) {
            console.error(error);
        }
    }

    static async getRunningModelInfos() : Promise<IRunningModelsResponse | undefined>{
        const url = "/ollama/api/ps"
        try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Response status: ${response.status}`);
            }
            const json = await response.json();
            return json
        } catch (error) {
            console.error(error);
        }
    }
}

/*

{
  "models": [
    {
      "name": "mistral:latest",
      "model": "mistral:latest",
      "size": 5137025024,
      "digest": "2ae6f6dd7a3dd734790bbbf58b8909a606e0e7e97e94b7604e0aa7ae4490e6d8",
      "details": {
        "parent_model": "",
        "format": "gguf",
        "family": "llama",
        "families": [
          "llama"
        ],
        "parameter_size": "7.2B",
        "quantization_level": "Q4_0"
      },
      "expires_at": "2024-06-04T14:38:31.83753-07:00",
      "size_vram": 5137025024
    }
  ]
}
*/