import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { IConversation } from '../../interfaces/IConversation'
import ConversationService from '../../services/API/ConversationService'
import mockConversationsList from '../../__mocks__/mockConversationsList'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ConversationService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('save', () => {
    it('should save a conversation successfully', async () => {
      const mockConversation: IConversation = mockConversationsList[0]
      mockFetch.mockResolvedValueOnce({ ok: true })

      await ConversationService.save(mockConversation)

      expect(mockFetch).toHaveBeenCalledWith('/backend/conversation', {
        method: 'POST',
        body: JSON.stringify(mockConversation),
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should handle errors when saving fails', async () => {
      const mockConversation: IConversation = mockConversationsList[0]
      mockFetch.mockResolvedValueOnce({ ok: false })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await ConversationService.save(mockConversation)

      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('updateById', () => {
    it('should update a conversation successfully', async () => {
      const mockConversation: IConversation = mockConversationsList[0]
      mockFetch.mockResolvedValueOnce({ ok: true })

      await ConversationService.updateById(1, mockConversation)

      expect(mockFetch).toHaveBeenCalledWith('/backend/conversation/byId/1', {
        method: 'PUT',
        body: JSON.stringify({ /*id: 1, */...mockConversation }),
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should handle errors when updating fails', async () => {
      const mockConversation: IConversation = mockConversationsList[0]
      mockFetch.mockResolvedValueOnce({ ok: false })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await ConversationService.updateById(1, mockConversation)

      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('should fetch a conversation by id successfully', async () => {
      const mockConversation: IConversation = mockConversationsList[0]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConversation)
      })

      const result = await ConversationService.getById(1)

      expect(result).toEqual(mockConversation)
      expect(mockFetch).toHaveBeenCalledWith('/backend/conversation/byId/1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should handle errors when fetching fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await ConversationService.getById(1)

      expect(result).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('getAll', () => {
    it('should fetch all conversations successfully', async () => {
      const mockConversations: IConversation[] = [
        mockConversationsList[0], mockConversationsList[1]
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConversations)
      })

      const result = await ConversationService.getAll()

      expect(result).toEqual(mockConversations)
      expect(mockFetch).toHaveBeenCalledWith('/backend/conversations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should handle errors when fetching all fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await expect(ConversationService.getAll()).rejects.toThrow('HTTP error! status: 500')
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('deleteById', () => {
    it('should delete a conversation by id successfully', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await ConversationService.deleteById(1)

      expect(mockFetch).toHaveBeenCalledWith('/backend/conversation/byId/1', {
        method: 'DELETE'
      })
    })

    it('should handle errors when deleting fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await ConversationService.deleteById(1)

      expect(consoleSpy).toHaveBeenCalled()
    })
  })
})