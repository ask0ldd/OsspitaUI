import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIAgent } from '../../models/AIAgent';
import AnswerFormatingService from '../../services/AnswerFormatingService';
import { ChatService } from '../../services/ChatService';
import { ICompletionResponse } from '../../interfaces/responses/OllamaResponseTypes';
import InferenceStatsFormatingService from '../../services/InferenceStatsFormatingService';

vi.mock('../models/AIAgent')
vi.mock('./AnswerFormatingService')

const mockCompletionResponse : ICompletionResponse = {
    model: "mockModel",
    created_at: "date",
    response: "response",
    done: true,
    context: [1, 2, 3],
    total_duration: 0,
    load_duration: 0,
    prompt_eval_count: 0,
    prompt_eval_duration: 0,
    eval_count: 0,
    eval_duration: 0,
} 

const mockActiveAgent : AIAgent = new AIAgent({id : 'a0000000001',
    name: "baseAssistant",
    modelName : "mistral-nemo:latest",
    systemPrompt : "You are an helpful assistant",
    mirostat: 0,
    mirostat_eta: 0.1,
    mirostat_tau: 5.0,
    num_ctx: 2048,
    repeat_last_n: 64,
    repeat_penalty: 1.1,
    temperature: 0.1,
    seed: 0,
    stop: ["AI assistant:"],
    tfs_z: 1,
    num_predict: 1024,
    top_k: 40,
    top_p: 0.9,
    type : "system",
    favorite : false
})

const mockFetch = vi.fn()
global.fetch = mockFetch;

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // ChatService.clearRAGTargets()
  })

  describe('askForFollowUpQuestions', () => {
    it('should return a response from the active agent', async () => {
      const answerFormatingService = new AnswerFormatingService()
      const inferenceStatsFormatingService = new InferenceStatsFormatingService()
      const chatService = new ChatService(answerFormatingService, inferenceStatsFormatingService)
      vi.spyOn(chatService.activeAgent, 'ask').mockResolvedValue(mockCompletionResponse)
      const result = await chatService.askForFollowUpQuestions('Test question')
      expect(result).toBe(mockCompletionResponse.response)
    })

    it('should throw an error if the agent is not available', async () => {
      const answerFormatingService = new AnswerFormatingService()
      const inferenceStatsFormatingService = new InferenceStatsFormatingService()
      const chatService = new ChatService(answerFormatingService, inferenceStatsFormatingService)
      chatService.activeAgent = null as unknown as AIAgent;
      await expect(chatService.askForFollowUpQuestions('Test question')).rejects.toThrow('Agent is not available')
    })
  })

  describe('askTheActiveAgent', () => {
    it('should return a formatted response', async () => {
        const answerFormatingService = new AnswerFormatingService()
        const inferenceStatsFormatingService = new InferenceStatsFormatingService()
        const chatService = new ChatService(answerFormatingService, inferenceStatsFormatingService)
        chatService.activeAgent = mockActiveAgent

        vi.spyOn(chatService.activeAgent, 'ask').mockResolvedValue(mockCompletionResponse)
        vi.spyOn(answerFormatingService, 'format').mockResolvedValue('<p>' + mockCompletionResponse.response + '</p>')

        const result = await chatService.askTheActiveAgent('Test question')
        expect(result).toEqual({
            context: [1, 2, 3],
            answer: { asMarkdown: mockCompletionResponse.response, asHTML: '<p>' + mockCompletionResponse.response + '</p>' },
            sources: [],
            question: 'Test question',
            date: expect.any(String),
            images : []
        })
    })
  })

  /*
  describe('askTheActiveAgentForAStreamedResponse', () => {
    it('should process streamed response chunks', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('{"response":"Chunk 1","done":false}') })
          .mockResolvedValueOnce({ value: new TextEncoder().encode('{"response":"Chunk 2","done":true,"context":[1,2,3]}') })
      };
      vi.spyOn(ChatService.activeAgent, 'askForAStreamedResponse').mockResolvedValue(mockReader as any)
      vi.spyOn(AnswerFormatingService, 'format').mockImplementation(async (text) => `<p>${text}</p>`)

      const chunkProcessorCallback = vi.fn()
      const result = await ChatService.askTheActiveAgentForAStreamedResponse('Test question', chunkProcessorCallback)

      expect(chunkProcessorCallback).toHaveBeenCalledTimes(2)
      expect(result.newContext).toEqual([1, 2, 3])
      expect(result.inferenceStats).toBeDefined()
    })
  })*/

  describe('RAG targets management', () => {
    it('should add and remove RAG targets', () => {
      const answerFormatingService = new AnswerFormatingService()
      const inferenceStatsFormatingService = new InferenceStatsFormatingService()
      const chatService = new ChatService(answerFormatingService, inferenceStatsFormatingService)
      chatService.setDocAsARAGTarget('doc1')
      chatService.setDocAsARAGTarget('doc2')
      expect(chatService.getRAGTargetsFilenames()).toEqual(['doc1', 'doc2'])

      chatService.removeDocFromRAGTargets('doc1')
      expect(chatService.getRAGTargetsFilenames()).toEqual(['doc2'])

      chatService.clearRAGTargets()
      expect(chatService.getRAGTargetsFilenames()).toEqual([])
    })
  })

  describe('Agent management', () => {
    it('should set and get active agent', () => {
      const answerFormatingService = new AnswerFormatingService()
      const inferenceStatsFormatingService = new InferenceStatsFormatingService()
      const chatService = new ChatService(answerFormatingService, inferenceStatsFormatingService)
      chatService.setActiveAgent(mockActiveAgent)
      expect(chatService.getActiveAgent()).toBe(mockActiveAgent)
      expect(chatService.getActiveAgentName()).toBe(mockActiveAgent.getName())
    })
  })

  /*describe('ChatService Reconstructor', () => {
    const mockStream = new ReadableStream({
      start(controller) {
        // controller.enqueue(new Uint8Array([72, 101, 108, 108, 111])); // "Hello" in UTF-8
        controller.enqueue(new Uint8Array([125])) // } aka closing bracket in UTF-8
        controller.close()
      }
    })

    const reader = mockStream.getReader()
    const decoder = new TextDecoder('utf-8')

    it('should reformat middle concatenated chunks', async () => {
      expect(await ChatService.rebuildMalformedChunksOptimized(`{"model":"","created_at":"","response":"aaaa ","done":false}\n{"model":"","created_at":"","response":"bbbb","done":false}`, reader, decoder)).toEqual(JSON.stringify({"model":"","created_at":"","response":"aaaa bbbb","done":false}))
    })

    it('should reformat middle concatenated chunks with \n### in it', async () => {
      expect(await ChatService.rebuildMalformedChunksOptimized(`{"model":"","created_at":"","response":"aaaa \n","done":false}\n{"model":"","created_at":"","response":"###bbbb","done":false}`, reader, decoder)).toEqual(JSON.stringify({"model":"","created_at":"","response":"aaaa \n###bbbb","done":false}))
    })

    it('should reformat ending concatenated chunks', async () => {
      expect(await ChatService.rebuildMalformedChunksOptimized(`{"model":"","created_at":"","response":"aaaa ","done":false}\n{"model":"","created_at":"","response":"bbbb","done":true`, reader, decoder)).toEqual(JSON.stringify({"model":"","created_at":"","response":"aaaa bbbb","done":true}))
    })
  })*/
})
