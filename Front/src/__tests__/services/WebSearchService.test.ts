/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebSearchService } from '../../services/WebSearchService'
import mockAgentsList from '../../__mocks__/mockAgentsList'
import IScrapedPage from '../../interfaces/IScrapedPage'
import ScrapedPage from '../../models/ScrapedPage'
import AgentService from '../../services/API/AgentService'
import { ICompletionResponse } from '../../interfaces/responses/OllamaResponseTypes'

// Mock dependencies
vi.mock('./API/AgentService')
vi.mock('../models/AIAgent')
vi.mock('../models/ScrapedPage')

// Mock the fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockScrapedPages : IScrapedPage[] = [
    {datas : "datas1", source : "source1", mostRecentDate : "2024/06/06"},
    {datas : "datas2", source : "source2", mostRecentDate : "2024/06/06"},
]

const mockCompletionResponse : ICompletionResponse = {
    model: "mockModel",
    created_at: "date",
    response: "query",
    done: true,
    context: [1, 2, 3],
    total_duration: 0,
    load_duration: 0,
    prompt_eval_count: 0,
    prompt_eval_duration: 0,
    eval_count: 0,
    eval_duration: 0,
} 

const mockSummarizationResponse : ICompletionResponse = {
    model: "mockModel",
    created_at: "date",
    response: "summarizedData",
    done: true,
    context: [1, 2, 3],
    total_duration: 0,
    load_duration: 0,
    prompt_eval_count: 0,
    prompt_eval_duration: 0,
    eval_count: 0,
    eval_duration: 0,
} 

const mockOptimizerRequest = {
    "model": mockAgentsList[0].model,
    "stream": false,
    "system": mockAgentsList[0].systemPrompt,
    "prompt": "query",
    "context" : [],
    "options": { 
        "num_ctx": mockAgentsList[0].num_ctx,
        "temperature" : mockAgentsList[0].temperature, 
        "num_predict" : mockAgentsList[0].num_predict,
        "mirostat": 0,
        "mirostat_eta": 0.1,
        "mirostat_tau": 5.0,
        "repeat_last_n": 64,
        "repeat_penalty": 1.1,
        "seed": 0,
        "tfs_z": 1,
        "top_k": 40,
        "top_p": 0.9,
    }   
}

const mockSummarizerRequest = {
    "model": mockAgentsList[0].model,
    "stream": false,
    "system": mockAgentsList[0].systemPrompt,
    "prompt": `Produce a summary with the following context :\n
                        <SCRAPEDDATAS>datas1</SCRAPEDDATAS>\n
                        <REQUEST>query</REQUEST>\n
                    `,
    "context" : [],
    "options": { 
        "num_ctx": mockAgentsList[0].num_ctx,
        "temperature" : mockAgentsList[0].temperature, 
        "num_predict" : mockAgentsList[0].num_predict,
        "mirostat": 0,
        "mirostat_eta": 0.1,
        "mirostat_tau": 5.0,
        "repeat_last_n": 64,
        "repeat_penalty": 1.1,
        "seed": 0,
        "tfs_z": 1,
        "top_k": 40,
        "top_p": 0.9,
    }   
}

let webSearchService = new WebSearchService()

describe('WebSearchService', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.resetAllMocks()

        webSearchService = new WebSearchService()
        
        // Reset WebSearchService
        webSearchService.setWebSearchSummarizationStatus(false)
        webSearchService.generateNewAbortControllerAndSignal()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('scraping', () => {
        it('should scrape data without summarization', async () => {
            vi.spyOn(AgentService.prototype, 'getAgentByName').mockResolvedValueOnce(mockAgentsList[0])

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCompletionResponse),
            }).mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockScrapedPages)
            })

            const result = await webSearchService.scrapeRelatedDatas({query : "query", maxPages : 5})

            expect(mockFetch).toHaveBeenCalledWith("/ollama/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mockOptimizerRequest),
                signal: new AbortController().signal,
            })
            expect(mockFetch).toHaveBeenCalledWith('/backend/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query : "query" }),
                signal : new AbortController().signal,
            })

            expect(result).toEqual(mockScrapedPages.map(page => new ScrapedPage(page.datas, page.source, page.mostRecentDate)))
        })

        it('scrape endpoint doesnt send an array back', async () => {
            vi.spyOn(AgentService.prototype, 'getAgentByName').mockResolvedValueOnce(mockAgentsList[0])

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCompletionResponse),
            }).mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(undefined)
            })

            console.error = vi.fn()

            await expect(webSearchService.scrapeRelatedDatas({query: "query", maxPages: 5}))
            .rejects.toThrow();

            expect(mockFetch).toHaveBeenCalledWith("/ollama/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mockOptimizerRequest),
                signal: new AbortController().signal,
            })
            expect(mockFetch).toHaveBeenCalledWith('/backend/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query : "query" }),
                signal : new AbortController().signal,
            })

            expect(console.error).toHaveBeenCalled()
        })

        it('should handle API error and log it', async () => {
            vi.spyOn(AgentService.prototype, 'getAgentByName').mockResolvedValueOnce(mockAgentsList[0])
            mockFetch.mockRejectedValue(new Error('API Error'))
            console.error = vi.fn()

            await expect(webSearchService.scrapeRelatedDatas({query: "query", maxPages: 5}))
            .rejects.toThrow();
            expect(console.error).toHaveBeenCalled()
        })

        it('should handle queryOptimizer agent missing and log it', async () => {
            vi.spyOn(AgentService.prototype, 'getAgentByName').mockResolvedValueOnce(undefined)
            mockFetch.mockRejectedValue(new Error('API Error'))
            console.error = vi.fn()

            await expect(webSearchService.scrapeRelatedDatas({query: "query", maxPages: 5}))
            .rejects.toThrow();
            expect(console.error).toHaveBeenCalled()
        })

        it('should scrape data with summarization', async () => {
            vi.spyOn(AgentService.prototype, 'getAgentByName').mockResolvedValue(mockAgentsList[0])
            webSearchService.setWebSearchSummarizationStatus(true)

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCompletionResponse),
            }).mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue(mockScrapedPages)
            }).mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockSummarizationResponse)
            })

            const result = await webSearchService.scrapeRelatedDatas({query : "query", maxPages : 5})

            expect(mockFetch).toHaveBeenCalledWith("/ollama/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mockOptimizerRequest),
                signal: new AbortController().signal,
            })
            expect(mockFetch).toHaveBeenCalledWith('/backend/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query : "query" }),
                signal : new AbortController().signal,
            })
            expect(mockFetch).toHaveBeenNthCalledWith(3, "/ollama/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mockSummarizerRequest),
                signal: new AbortController().signal,
            })

            expect(result).toEqual(mockScrapedPages.map(page => new ScrapedPage("summarizedData", page.source, page.mostRecentDate)))
        })
    })

    describe('web search status', () => {
        it('should be false by default', async() => {
            expect(webSearchService.getWebSearchSummarizationStatus()).toBeFalsy()
        })

        it('should be true when set to true', async() => {
            webSearchService.setWebSearchSummarizationStatus(true)
            expect(webSearchService.getWebSearchSummarizationStatus()).toBeTruthy()
        })
    })
})
