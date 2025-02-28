import '@testing-library/react/dont-cleanup-after-each'
import { OllamaService } from '../../services/OllamaService';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import {describe, beforeEach, vi, expect, test, afterEach } from 'vitest';
import '@testing-library/react/dont-cleanup-after-each'
import mockModelsList from '../../__mocks__/mockModelsList';
import mockAgentsList from '../../__mocks__/mockAgentsList';
import DocService from '../../services/API/DocService';
import mockRAGDocumentsList from '../../__mocks__/mockRAGDocumentsList';
import PromptService from '../../services/API/PromptService';
import mockPromptsList from '../../__mocks__/mockPromptsList';
import mockRunningModelsInfos from '../../__mocks__/mockRunningModelsInfos';
import AgentService from '../../services/API/AgentService';
import mockConversationsList from '../../__mocks__/mockConversationsList';
import ConversationService from '../../services/API/ConversationService';
import { MockedRouter } from '../../__mocks__/mockedRouter';

const mockVoices = [
    { name: 'Voice 1', lang: 'en-US' },
    { name: 'Voice 2', lang: 'es-ES' },
];

describe('Given I am on the Chat page', () => {
    beforeEach(() => {
        HTMLDialogElement.prototype.show = vi.fn()
        HTMLDialogElement.prototype.showModal = vi.fn()
        HTMLDialogElement.prototype.close = vi.fn()
        vi.spyOn(OllamaService, 'getModelList').mockResolvedValue(mockModelsList)
        vi.spyOn(OllamaService, 'getRunningModelInfos').mockResolvedValue(mockRunningModelsInfos)
        vi.spyOn(AgentService.prototype, 'getAll').mockResolvedValue(mockAgentsList)
        vi.spyOn(AgentService.prototype, 'getAgentByName').mockResolvedValue(mockAgentsList[0])
        vi.spyOn(DocService, 'getAll').mockResolvedValue(mockRAGDocumentsList)
        vi.spyOn(PromptService.prototype, 'getAll').mockResolvedValue(mockPromptsList)
        vi.spyOn(PromptService.prototype, 'getByName').mockResolvedValue(mockPromptsList[0])
        // ConversationService.getAll = vi.fn().mockResolvedValue(mockConversationsList)
        vi.spyOn(ConversationService, 'getAll').mockResolvedValue([mockConversationsList[0], mockConversationsList[1], mockConversationsList[2]])
        // vi.spyOn(ChatService, 'isAVisionModelActive').mockReturnValue(false)

        vi.stubGlobal('speechSynthesis', {
            getVoices: vi.fn().mockReturnValue(mockVoices),
        });
        render(<MockedRouter />)
    });

    afterEach(() => {
        vi.resetAllMocks()
        cleanup()
    })

    test('Can navigate between Prompts', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        expect(screen.getByText(mockPromptsList[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockPromptsList[1].name)).toBeInTheDocument()
        expect(screen.getByText(mockPromptsList[2].name)).toBeInTheDocument()

        const previousPages = screen.getAllByTitle("previous page")
        const nextPages = screen.getAllByTitle("next page")

        act(() => nextPages[2].click())
        await waitFor(() => expect(screen.getByText(mockPromptsList[3].name)).toBeInTheDocument())
        expect(screen.queryByText(mockPromptsList[0].name)).not.toBeInTheDocument()

        act(() => previousPages[2].click())
        await waitFor(() => expect(screen.getByText(mockPromptsList[0].name)).toBeInTheDocument())
        expect(screen.queryByText(mockPromptsList[3].name)).not.toBeInTheDocument()
    })

    test('Can open a modal to save a new prompt', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        expect(screen.getByText(mockPromptsList[0].name)).toBeInTheDocument()

        const newPromptButton = screen.getByTitle("new prompt")

        act(() => newPromptButton.click())
        await waitFor(() => expect(screen.getByTestId("modal")).toBeInTheDocument())
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })
})