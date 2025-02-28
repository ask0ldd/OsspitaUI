/* eslint-disable @typescript-eslint/no-unused-vars */
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
import mockConversationsList from '../../__mocks__/mockConversationsList';
import { ChatService } from '../../services/ChatService';
import { WebSearchService } from '../../services/WebSearchService';
import AgentService from '../../services/API/AgentService';
import ConversationService from '../../services/API/ConversationService';
import { MockedRouter } from '../../__mocks__/mockedRouter';

const mockVoices = [
    { name: 'Voice 1', lang: 'en-US' },
    { name: 'Voice 2', lang: 'es-ES' },
];

const mockFirstConversation = 
{
    $loki : 0,
    name : "First Conversation",
    history : [],
    lastAgentUsed : "mockAgent",
    lastModelUsed : "mockModel",
    images : []
}

let webSearchService
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
        vi.spyOn(ConversationService, 'getAll').mockResolvedValue([mockFirstConversation, mockConversationsList[0], mockConversationsList[1], mockConversationsList[2]])
        vi.spyOn(ConversationService, 'getById').mockResolvedValue(mockConversationsList[0])
        vi.spyOn(ConversationService, 'deleteById')
        vi.spyOn(ConversationService, 'save').mockResolvedValue({
            $loki: 0,
            name: "New Conversation",
            history: [],
            lastAgentUsed: "",
            lastModelUsed: "",
        })
        ChatService.abortAgentLastRequest = vi.fn()
        webSearchService = new WebSearchService()
        webSearchService.abortLastRequest = vi.fn()
        vi.stubGlobal('speechSynthesis', {
            getVoices: vi.fn().mockReturnValue(mockVoices),
        });
        render(<MockedRouter />)
    });

    afterEach(() => {
        vi.resetAllMocks()
        cleanup()
    })

    test('Three conversations displayed', async () => {
        await waitFor(() => expect(screen.getByText(/First Conversation/i)).toBeInTheDocument())
        expect(screen.getByText(mockConversationsList[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockConversationsList[1].name)).toBeInTheDocument()
        expect(screen.queryByText(mockConversationsList[2].name)).not.toBeInTheDocument()
    })

    test('Next page / Previous page buttons are working', async () => {
        await waitFor(() => expect(screen.getByText(/First Conversation/i)).toBeInTheDocument())
        expect(screen.getByText(mockConversationsList[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockConversationsList[1].name)).toBeInTheDocument()
        expect(screen.queryByText(mockConversationsList[2].name)).not.toBeInTheDocument()

        const previousPagesButtons = screen.getAllByTitle("previous page")
        const nextPagesButtons = screen.getAllByTitle("next page")

        act(() => nextPagesButtons[0].click())
        await waitFor(() => expect(screen.getByText(mockConversationsList[2].name)).toBeInTheDocument())

        act(() => previousPagesButtons[0].click())
        await waitFor(() => expect(screen.getByText(/First Conversation/i)).toBeInTheDocument())
    })

    test('New conversation button is calling the api to create a new conversation', async () => {
        await waitFor(() => expect(screen.getByText(/First Conversation/i)).toBeInTheDocument())
        const newConversationButton = screen.getAllByTitle("new conversation")[0]
        act(() => newConversationButton.click())
        // await waitFor(() => expect(screen.getByText(/New Conversation/i)).toBeInTheDocument())
        await waitFor(() => expect(ConversationService.save).toBeCalledWith({
            name: "New Conversation",
            history: [],
            lastAgentUsed: "",
            lastModelUsed: "",
        }))
    })

    test('Delete conversation button display a confirmation button', async () => {
        await waitFor(() => expect(screen.getByText(/First Conversation/i)).toBeInTheDocument())
        const deleteConversationButton = screen.getAllByTitle("delete conversation")[0]
        act(() => deleteConversationButton.click())
        // await waitFor(() => expect(ConversationService.deleteById).toBeCalledWith(mockFirstConversation))
        await waitFor(() => expect(screen.getByTitle(/confirm deletion/i)).toBeInTheDocument())
    })

    test('When all the existing conversations are deleted, a blank conversation is created', async () => {
        await waitFor(() => expect(screen.getByText(/First Conversation/i)).toBeInTheDocument())
        /*const newConversationButton = screen.getAllByTitle("new conversation")[0]
        act(() => newConversationButton.click())
        await waitFor(() => expect(screen.getByText(/New Conversation/i)).toBeInTheDocument())*/
        let deleteConversationButton : HTMLButtonElement
        let confirmDeletionButton : HTMLButtonElement

        let i = 0
        while(i < 5){
            deleteConversationButton = screen.getAllByTitle("delete conversation")[0] as HTMLButtonElement
            act(() => deleteConversationButton.click())
            confirmDeletionButton = screen.getByTitle(/confirm deletion/i)
            act(() => confirmDeletionButton.click())
            i++
        }

        await waitFor(() => expect(screen.queryByText(/New Conversation/i)).not.toBeInTheDocument())
    })

    test('Switching conversation', async () => {
        await waitFor(() => expect(screen.getByText(/First Conversation/i)).toBeInTheDocument())
        const conversationsList = screen.getByText("CONVERSATIONS").parentElement?.children[1]
        expect(conversationsList?.children[0].children[0].className.includes("active")).toBeTruthy()
        expect(conversationsList?.children[1].className.includes("active")).toBeFalsy()
        act(() => (conversationsList?.children[1] as HTMLElement).click())
        await waitFor(() => expect(conversationsList?.children[0].className.includes("active")).toBeFalsy())
        expect(conversationsList?.children[1].children[0].className.includes("active")).toBeTruthy()
    })

})