import '@testing-library/react/dont-cleanup-after-each'
import { userEvent } from '@testing-library/user-event'
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
import AIAgentChain from '../../models/AIAgentChain';
import mockLLMResponse from '../../__mocks__/mockLLMResponse';
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
        vi.resetAllMocks()
        HTMLDialogElement.prototype.show = vi.fn()
        HTMLDialogElement.prototype.showModal = vi.fn()
        HTMLDialogElement.prototype.close = vi.fn()
        vi.spyOn(OllamaService, 'getModelList').mockResolvedValue(mockModelsList)
        vi.spyOn(OllamaService, 'getRunningModelInfos').mockResolvedValue(mockRunningModelsInfos)
        vi.spyOn(AgentService.prototype, 'getAll').mockResolvedValue(mockAgentsList)
        vi.spyOn(AgentService.prototype, 'getAgentByName').mockResolvedValue(mockAgentsList[0])
        vi.spyOn(AIAgentChain, 'process').mockResolvedValue(mockLLMResponse)
        vi.spyOn(DocService, 'getAll').mockResolvedValue(mockRAGDocumentsList)
        vi.spyOn(PromptService.prototype, 'getAll').mockResolvedValue(mockPromptsList)
        vi.spyOn(ConversationService, 'getAll').mockResolvedValue([mockConversationsList[0], mockConversationsList[1], mockConversationsList[2]])
        vi.stubGlobal('speechSynthesis', {
            getVoices: vi.fn().mockReturnValue(mockVoices),
        });
        render(<MockedRouter />)
    });

    afterEach(() => {
        vi.restoreAllMocks()
        cleanup()
    })

    test('Then I should see the page title', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        expect(screen.getByText(mockPromptsList[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockPromptsList[1].name)).toBeInTheDocument()
        expect(screen.getByText(mockPromptsList[2].name)).toBeInTheDocument()
        expect(screen.getByText(mockRAGDocumentsList[0].filename)).toBeInTheDocument()
        expect(screen.getByText(mockRAGDocumentsList[1].filename)).toBeInTheDocument()
        expect(screen.getByText(mockRAGDocumentsList[2].filename)).toBeInTheDocument()
        expect(screen.getByText(/DOCUMENTS/i)).toBeInTheDocument()
        expect(screen.getByText(/CONVERSATIONS/i)).toBeInTheDocument()
        expect(screen.getByText(/PROMPTS/i)).toBeInTheDocument()
        expect(screen.getByTitle(/Query processed by one single Agent/i)).toBeInTheDocument()
        expect(screen.getByTitle(/Query processed by a chain of Agents/i)).toBeInTheDocument()
    })

    test('Web search can be activated', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        const webSearchButton = screen.getAllByRole('button').filter(button => button.textContent == "Web Search")[0]
        expect(webSearchButton).toBeDefined()
        expect(webSearchButton.className.includes("activated")).toBeFalsy()
        act(() => webSearchButton.click())
        await waitFor(() => expect(webSearchButton.className.includes("activated")).toBeTruthy())
        // testing switch
        await waitFor(() => expect(webSearchButton.children[1].children[0].className.includes("active")).toBeTruthy())
    })

    test('Then I should be able to add some agents to the chain', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        const chainButton = screen.getByTitle(/Query processed by a chain of Agents/i)
        expect(chainButton).toBeInTheDocument()
        act(() => chainButton.click())
        await waitFor(() => expect(screen.getByText(/ACTIVE CHAIN/i)).toBeInTheDocument())
        const addAgentButton = screen.getByText('+ Add Agent')
        expect(addAgentButton).toBeInTheDocument()
        act(() => addAgentButton.click())
        await waitFor(() => expect(screen.getByText(/COTTableGenerator/i)).toBeInTheDocument())
    })

    test('When sending a query through the active AIChain, the expected response should be displayed', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        const chainButton = screen.getByTitle(/Query processed by a chain of Agents/i)
        expect(chainButton).toBeInTheDocument()
        act(() => chainButton.click())
        await waitFor(() => expect(screen.getByText(/ACTIVE CHAIN/i)).toBeInTheDocument())
        const mainSendButton = ((screen.getByText(/(to Chain)/i) as HTMLSpanElement).parentElement as HTMLButtonElement)
        expect(mainSendButton).toBeInTheDocument()
        const addAgentButton = screen.getByText('+ Add Agent')
        expect(addAgentButton).toBeInTheDocument()
        act(() => addAgentButton.click())
        await waitFor(() => expect(screen.getByText(/COTTableGenerator/i)).toBeInTheDocument())
        const textArea = (screen.getAllByRole("textbox").filter((el) => el.getAttribute('id') === 'mainTextArea')[0] as HTMLTextAreaElement)
        expect(textArea).toBeInTheDocument()
        await userEvent.type(textArea, 'here is my query');
        await waitFor(() => expect(screen.getByText(/here is my query/i)).toBeInTheDocument())
        act(() => mainSendButton.click())
        await waitFor(() => expect(AIAgentChain.process).toHaveBeenCalledWith('here is my query'))
        await waitFor(() => expect(screen.getByText(/here is my mock response/i)).toBeInTheDocument())
    })

    test('When sending a query through the active AIChain and a failure happens amidst the process', async () => {
        vi.spyOn(AIAgentChain, 'process').mockRejectedValueOnce(new Error('Error processing query'))
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        const chainButton = screen.getByTitle(/Query processed by a chain of Agents/i)
        expect(chainButton).toBeInTheDocument()
        act(() => chainButton.click())
        await waitFor(() => expect(screen.getByText(/ACTIVE CHAIN/i)).toBeInTheDocument())
        const mainSendButton = ((screen.getByText(/(to Chain)/i) as HTMLSpanElement).parentElement as HTMLButtonElement)
        expect(mainSendButton).toBeInTheDocument()
        const addAgentButton = screen.getByText('+ Add Agent')
        expect(addAgentButton).toBeInTheDocument()
        act(() => addAgentButton.click())
        await waitFor(() => expect(screen.getByText(/COTTableGenerator/i)).toBeInTheDocument())
        const textArea = (screen.getAllByRole("textbox").filter((el) => el.getAttribute('id') === 'mainTextArea')[0] as HTMLTextAreaElement)
        expect(textArea).toBeInTheDocument()
        await userEvent.type(textArea, 'here is my query');
        await waitFor(() => expect(screen.getAllByText(/here is my query/i)[0]).toBeInTheDocument())
        act(() => mainSendButton.click())
        await waitFor(() => expect(AIAgentChain.process).toHaveBeenCalledWith('here is my query'))
        await waitFor(() => expect(screen.getByText(/Stream failed/i)).toBeInTheDocument())
    })

})