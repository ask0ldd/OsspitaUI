import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIAgent } from '../../models/AIAgent';
import IAgentResponse from '../../interfaces/responses/IAgentResponse';
import mockAgentsList from '../../__mocks__/mockAgentsList';
import AgentService from '../../services/API/AgentService';

// Mock the global fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch;

const mockAgentParameters = {...mockAgentsList[0], modelName : mockAgentsList[0].model}

describe('AgentService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('save', () => {
    it('should save an agent successfully', async () => {
      const mockAgent = new AIAgent(mockAgentParameters)
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await new AgentService().save(mockAgent)
      expect(result).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith('/backend/agent', {
        method: 'POST',
        body: mockAgent.asString(),
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('should return error text when save fails', async () => {
      const mockAgent = new AIAgent(mockAgentParameters)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Error saving agent'),
      })

      const result = await new AgentService().save(mockAgent)
      expect(result).toBe('Error saving agent')
    })
  })

  describe('updateByName', () => {
    it('should update an agent by name successfully', async () => {
      const mockAgent = new AIAgent(mockAgentParameters)
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await new AgentService().updateByName(mockAgentParameters.name, mockAgent)
      expect(result).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith('/backend/agent/byName/' + mockAgentParameters.name, {
        method: 'PUT',
        body: mockAgent.asString(),
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('should return error text when update fails', async () => {
      const mockAgent = new AIAgent(mockAgentParameters)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Error updating agent'),
      })

      const result = await new AgentService().updateByName(mockAgentParameters.name, mockAgent)
      expect(result).toBe('Error updating agent')
    })
  })

  describe('updateById', () => {
    it('should update an agent by ID successfully', async () => {
      const mockAgent = new AIAgent(mockAgentParameters)
      vi.spyOn(mockAgent, 'getId').mockReturnValue('123')
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await new AgentService().updateById(mockAgent)
      expect(result).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith('/backend/agent/byId/123', {
        method: 'PUT',
        body: mockAgent.asString(),
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('should return error text when update fails', async () => {
      const mockAgent = new AIAgent(mockAgentParameters)
      vi.spyOn(mockAgent, 'getId').mockReturnValue('123')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Error updating agent'),
      })

      const result = await new AgentService().updateById(mockAgent)
      expect(result).toBe('Error updating agent')
    })
  })

  describe('getAll', () => {
    it('should fetch all agents successfully', async () => {
      const mockAgents: IAgentResponse[] = [
        mockAgentsList[0],
        mockAgentsList[1],
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAgents),
      })

      const result = await new AgentService().getAll()
      expect(result).toEqual(mockAgents)
      expect(mockFetch).toHaveBeenCalledWith('/backend/agents', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('should handle the error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await expect(new AgentService().getAll()).rejects.toThrow('HTTP error! status: 500')
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('getAgentsNameList', () => {
    it('should return a list of agent names', async () => {
        const mockAgents: IAgentResponse[] = [
            mockAgentsList[0],
            mockAgentsList[1],
        ];
        const agentService = new AgentService();
        vi.spyOn(agentService, 'getAll').mockResolvedValueOnce(mockAgents)

        const result = await agentService.getAgentsNameList()
        expect(result).toEqual([mockAgentsList[0].name, mockAgentsList[1].name])
    })

    it('should return an empty array when no agents are found', async () => {
      const agentService = new AgentService();
      vi.spyOn(agentService, 'getAll').mockResolvedValueOnce(undefined)

      const result = await agentService.getAgentsNameList()
      expect(result).toEqual([])
    })
  })

  describe('getAgentByName', () => {
    it('should fetch an agent by name successfully', async () => {
      const mockAgent: IAgentResponse = mockAgentsList[0];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAgent),
      })

      const result = await new AgentService().getAgentByName(mockAgent.name)
      expect(result).toEqual(mockAgent)
      expect(mockFetch).toHaveBeenCalledWith('/backend/agent/byName/' + mockAgent.name, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('should return undefined when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await new AgentService().getAgentByName(mockAgentsList[0].name)
      expect(result).toBeUndefined()
    })
  })

  describe('deleteAgent', () => {
    it('should delete an agent successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      await expect(new AgentService().deleteAgent(mockAgentsList[0].name)).resolves.toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith('/backend/agent/byName/' + mockAgentsList[0].name, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
    })
    /*
    it('should throw an error when delete fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await expect(AgentService.deleteAgent('Test Agent')).rejects.toThrow('HTTP error! status: 404')
    })*/
  })

  describe('updateAgentsConfig', () => {
    it('should update agents config successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const config = {
        advancedModel: 'advanced',
        basicModel: 'basic',
        embeddingModel: 'embedding',
      };

      await expect(new AgentService().updateAgentsConfig(config)).resolves.toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith('/backend/agents/config', {
        method: 'PUT',
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' },
      })
    })
  })
})