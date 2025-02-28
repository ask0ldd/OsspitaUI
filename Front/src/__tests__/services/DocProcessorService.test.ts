import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import DocProcessorService from '../../services/DocProcessorService';
import { AIModel } from '../../models/AIModel';
import { IEmbeddingResponse } from '../../interfaces/responses/IEmbeddingResponse';

const mockFetch = vi.fn()
global.fetch = mockFetch;

const mockEmbeddingsResponse : IEmbeddingResponse = {
    embedding : [1, 2, 3]
}

describe('DocProcessorService', () => {
    // Mocking the AIModel's askEmbeddingsFor method
    beforeAll(() => {
        vi.resetAllMocks()
        vi.spyOn(AIModel.prototype, 'askEmbeddingsFor').mockResolvedValue({ embedding: [1, 2, 3] });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('should split text into chunks correctly', () => {
        const text = 'This is a test text that should be split into chunks of words.';
        const chunks = DocProcessorService.splitTextIntoChunks(text, 5);
        expect(chunks).toEqual([
            'This is a test text that',
            'should be split into chunks',
            'of words.'
        ]);
    });

    it('should process a text file and return embeddings', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockEmbeddingsResponse),
        })
        const fileContent = 'This is a sample text file content that needs processing.';
        const result = await DocProcessorService.processTextFile(fileContent);
        
        expect(result[0]).toEqual({
            text: 'This is a sample text file content that needs processing.',
            embedding: [1, 2, 3]
        });
    });

    it('should normalize vector correctly', () => {
        const vector = [3, 4];
        const normalized = DocProcessorService.normalizeVector(vector);
        expect(normalized).toEqual([6000000, 8000000]); // Expected normalized values
    });

    it('should convert vector to 2 bits correctly', () => {
        const vector = [0, 1, -1, 2];
        const converted = DocProcessorService.convertTo2Bits(vector);
        expect(converted).toEqual([0, 1, -1, 1]);
    });

    it('should convert text to telegraphic format', () => {
        const text = 'This is a test sentence that should be converted.';
        const telegraphicText = DocProcessorService.toTelegraphicText(text);
        expect(telegraphicText).toBe('This test sentence that converted.');
    });

    /*it('should format RAG data correctly', () => {
        const ragData = [
            { text: 'High priority data' },
            { text: 'Medium priority data' },
            { text: 'Low priority data' },
        ] as IRAGChunkResponse[];

        // Mocking ChatService.getActiveAgent().getContextSize()
        vi.spyOn(ChatService, 'getActiveAgent').mockReturnValue(new AIAgent({...mockAgentsList[0], modelName : mockAgentsList[0].model}));

        const formattedData = DocProcessorService.formatRAGDatas(ragData);
        
        expect(formattedData).toContain('-**HIGHEST PRIORITY DATA :**\nHigh priority data.\n');
        expect(formattedData).toContain('-**MEDIUM PRIORITY DATA :**\nMedium priority data.\n');
        expect(formattedData).toContain('-**LOW PRIORITY DATA :**\nLow priority data.\n');
    });*/

    it('should check if a file is a text file', async () => {
        const blob = new Blob(['Sample text content'], { type: 'text/plain' });

        const mockFile = new File([blob], 'sample.txt', {
            type: blob.type,
            lastModified: Date.now()
        });
        
        const result = await DocProcessorService.isTextFile(mockFile);
        
        expect(result).toBe(true);
    });
});
