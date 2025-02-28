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
import AgentService from '../../services/API/AgentService';
import { userEvent } from '@testing-library/user-event';
import { mockImagesList, mockImagesList2 } from '../../__mocks__/mockImagesList';
import ImageService from '../../services/API/ImageService';
import { IImage } from '../../interfaces/IImage';
import ConversationService from '../../services/API/ConversationService';
import mockConversationsList from '../../__mocks__/mockConversationsList';
import { MockedRouter } from '../../__mocks__/mockedRouter';

const mockVoices = [
    { name: 'Voice 1', lang: 'en-US' },
    { name: 'Voice 2', lang: 'es-ES' },
];

// const mockConversations : IConversationWithId[] = []

const mockImage : IImage = {
    $loki: 0,
    filename: 'mockImage.png'
}

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
        vi.stubGlobal('speechSynthesis', {
            getVoices: vi.fn().mockReturnValue(mockVoices),
        });
        vi.spyOn(ImageService.prototype, 'upload').mockResolvedValue(mockImage)
        // vi.spyOn(ConversationService.prototype, 'getAll').mockResolvedValue(mockConversations)
        // ConversationService.getAll = vi.fn().mockResolvedValue(mockConversationsList)
        vi.spyOn(ConversationService, 'getAll').mockResolvedValue([mockConversationsList[0], mockConversationsList[1], mockConversationsList[2]])
        /*vi.spyOn(ImageRepository, 'setSelectedImageId').mockReturnValue()
        vi.spyOn(ImageRepository, 'pushImage').mockReturnValue()
        vi.spyOn(ImageRepository, 'nImages').mockReturnValue(mockImagesList.length)*/
        render(<MockedRouter />)
    });

    afterEach(() => {
        vi.resetAllMocks()
        cleanup()
    })

    test('Can access the image slot which contains 5 empty slots', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        const imagesButton = (screen.getByText('IMAGES') as HTMLElement).parentElement
        act(() => imagesButton?.click())
        expect(screen.getAllByTitle('emptySlot').length).toEqual(5)
    })

    test('Can upload a new image and get it displayed', async () => { // get the endpoint called
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        const imagesButton = (screen.getByText('IMAGES') as HTMLElement).parentElement
        act(() => imagesButton?.click())
        expect(screen.getAllByTitle('emptySlot').length).toEqual(5)
        const uploadImageInput = screen.getByTestId('imageFileInput') as HTMLInputElement
        const file = new File([mockImagesList[0].data], mockImagesList[0].filename, { type: 'image/png' })
        const formData = new FormData()
        formData.append('image', file, file.name)
        await userEvent.upload(uploadImageInput, file)

        await waitFor(() => expect(ImageService.prototype.upload).toHaveBeenCalledTimes(1))
        expect(ImageService.prototype.upload).toHaveBeenCalledWith(formData)
    })

})

describe('Give I am on the chat page focusing on the image slot', () => {

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
        vi.stubGlobal('speechSynthesis', {
            getVoices: vi.fn().mockReturnValue(mockVoices),
        });
        vi.spyOn(ImageService.prototype, 'upload').mockResolvedValue(mockImage)
        vi.spyOn(ImageService.prototype, 'getAll').mockResolvedValueOnce(mockImagesList2)
        render(<MockedRouter />)
    });

    afterEach(() => {
        vi.resetAllMocks()
        cleanup()
    })

    test('When the api return 4 images, all of them should be displayed', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument())
        const imagesButton = (screen.getByText('IMAGES') as HTMLElement).parentElement
        act(() => imagesButton?.click())
        expect(screen.getAllByTitle('emptySlot').length).toEqual(1)
        expect(screen.getByAltText(mockImagesList2[0].filename)).toBeInTheDocument()
        expect(screen.getByAltText(mockImagesList2[1].filename)).toBeInTheDocument()
        expect(screen.getByAltText(mockImagesList2[2].filename)).toBeInTheDocument()
        expect(screen.getByAltText(mockImagesList2[3].filename)).toBeInTheDocument()
    })
})