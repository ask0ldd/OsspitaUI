import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaService } from '../../services/OllamaService';
import mockRunningModelsInfos from '../../__mocks__/mockRunningModelsInfos';
import { IListModelResponse } from '../../interfaces/responses/OllamaResponseTypes';

const mockModelsListResponse: IListModelResponse = {
    models: [
      {
        name: "mistral:latest",
        model: "mistral:latest",
        size: 5137025024,
        digest: "2ae6f6dd7a3dd734790bbbf58b8909a606e0e7e97e94b7604e0aa7ae4490e6d8",
        details: {
          parentModel: "",
          format: "gguf",
          family: "llama",
          families: ["llama"],
          parameterSize: "7.2B",
          quantizationLevel: "Q4_0"
        },
        modifiedAt: "2024-06-04T14:38:31.83753-07:00",
      }
    ]
};

// Mock the global fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch;

describe('OllamaService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getModelList', () => {
    it('should return model list when API call is successful', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockModelsListResponse),
        })

        const result = await OllamaService.getModelList()
        expect(result).toEqual(mockModelsListResponse)
        expect(mockFetch).toHaveBeenCalledWith("/ollama/api/tags")
    })

    it('should handle API error and log it', async () => {
        mockFetch.mockRejectedValue(new Error('API Error'))
        console.error = vi.fn()

        const result = await OllamaService.getModelList()
        expect(result).toBeUndefined()
        expect(console.error).toHaveBeenCalled()
    })

    it('should throw an error when response is not ok', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 404,
        })
        console.error = vi.fn()

        const result = await OllamaService.getModelList()
        expect(result).toBeUndefined()
        expect(console.error).toHaveBeenCalled()
    })
  })

  describe('getRunningModelInfos', () => {
    it('should return running model infos when API call is successful', async () => {

        mockFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockRunningModelsInfos),
        })

        const result = await OllamaService.getRunningModelInfos()
        expect(result).toEqual(mockRunningModelsInfos)
        expect(mockFetch).toHaveBeenCalledWith("/ollama/api/ps")
    })

    it('should handle API error and log it', async () => {
        mockFetch.mockRejectedValue(new Error('API Error'))
        console.error = vi.fn()

        const result = await OllamaService.getRunningModelInfos()
        expect(result).toBeUndefined()
        expect(console.error).toHaveBeenCalled()
    })

    it('should throw an error when response is not ok', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
        })
        console.error = vi.fn()

        const result = await OllamaService.getRunningModelInfos()
        expect(result).toBeUndefined()
        expect(console.error).toHaveBeenCalled()
    })
  })
})
