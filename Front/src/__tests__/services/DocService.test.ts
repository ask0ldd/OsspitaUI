/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import DocService from '../../services/API/DocService'
import IEmbedChunkedDoc from '../../interfaces/IEmbedChunk'
import IRAGChunkResponse from '../../interfaces/responses/IRAGChunkResponse'

// Mock the fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock the AIModel class
vi.mock('../../models/AIModel', () => ({
  AIModel: vi.fn().mockImplementation(() => ({
    askEmbeddingsFor: vi.fn().mockResolvedValue({ embedding: [0.1, 0.2, 0.3] })
  }))
}))

// Mock the DocProcessorService
vi.mock('../../services/DocProcessorService', () => ({
  default: {
    normalizeVector: vi.fn().mockReturnValue([0.1, 0.2, 0.3])
  }
}))

describe('DocService', () => {
    beforeEach(() => {
        mockFetch.mockClear()
        vi.spyOn(DocService.embeddingModel, 'askEmbeddingsFor').mockResolvedValue({embedding : [0.1, 0.2, 0.3]})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })
    
  describe('saveDocWithEmbeddings', () => {
    it('should successfully save document with embeddings', async () => {
      const mockResponse = { ok: true }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const processedDoc : IEmbedChunkedDoc[] = [{ text: 'test', embedding: [0.1, 0.2, 0.3], metadatas : {filename : 'test.tsx', filesize : 10000} }]
      await DocService.saveDocWithEmbeddings(processedDoc)

      expect(global.fetch).toHaveBeenCalledWith(
        '/backend/embeddings',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(processedDoc)
        })
      )
    })

    it('should handle errors when saving document', async () => {
      const mockResponse = { ok: false, status: 500 }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const processedDoc : IEmbedChunkedDoc[] = [{ text: 'test', embedding: [0.1, 0.2, 0.3], metadatas : {filename : 'test.tsx', filesize : 10000} }]
      await DocService.saveDocWithEmbeddings(processedDoc)

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('deleteByName', () => {
    it('should successfully delete document by name', async () => {
      const mockResponse = { ok: true }
      mockFetch.mockResolvedValueOnce(mockResponse)

      await DocService.deleteByName('test.pdf')

      expect(global.fetch).toHaveBeenCalledWith(
        '/backend/doc/byName/test.pdf',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should handle errors when deleting document', async () => {
      const mockResponse = { ok: false, status: 404 }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await DocService.deleteByName('nonexistent.pdf')

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('getAll', () => {
    it('should successfully fetch all documents', async () => {
      const mockDocs = [{ id: '1', name: 'doc1.pdf' }, { id: '2', name: 'doc2.pdf' }]
      const mockResponse = { ok: true, json: () => Promise.resolve(mockDocs) }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await DocService.getAll()

      expect(result).toEqual(mockDocs)
      expect(mockFetch).toHaveBeenCalledWith(
        '/backend/docs',
        expect.objectContaining({
          method: 'GET'
        })
      )
    })

    it('should handle errors when fetching all documents', async () => {
      const mockResponse = { ok: false, status: 500 }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await DocService.getAll()

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('getRAGResults', () => {
    it('should successfully fetch RAG results', async () => {
      const mockRAGResults : IRAGChunkResponse[] = [{ text: 'test', embedding : [1, 2, 3], similarity : 0.9 }]
      const mockResponse = { ok: true, json: () => Promise.resolve(mockRAGResults) }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await DocService.getRAGResults('query', ['doc1.pdf', 'doc2.pdf'])

      expect(result).toEqual(mockRAGResults)
      expect(mockFetch).toHaveBeenCalledWith(
        '/backend/docs/bySimilarity',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            query: 'query',
            targetFilesNames: ['doc1.pdf', 'doc2.pdf']
          }),
          headers: { "Content-Type": "application/json", }
        })
      )
    })

    it('should handle errors when fetching RAG results', async () => {
      const mockResponse = { ok: false, status: 500 }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await DocService.getRAGResults('query', ['doc1.pdf'])

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})