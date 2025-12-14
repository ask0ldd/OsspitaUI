import { createContext, ReactNode } from 'react';
import PromptService from '../services/API/PromptService';
import AgentService from '../services/API/AgentService';
import { WebSearchService } from '../services/WebSearchService';
import { TTSService } from '../services/TTSService';
import ImageService from '../services/API/ImageService';
import CharacterService from '../services/API/CharacterService';
import ComfyUIService from '../services/ComfyUIService';
import ImageGenWorkflowService from '../services/API/imageGen/imageGenWorkflowService';
import ImageGenPromptService from '../services/API/imageGen/ImageGenPromptService';
import { ChatService } from '../services/ChatService';
import AnswerFormatingService from '../services/AnswerFormatingService';
import InferenceStatsFormatingService from '../services/InferenceStatsFormatingService';
import { IAnswerFormattingService } from '../services/interfaces/IAnswerFormatingService';
import { IComfyUIService } from '../services/interfaces/IComfyUIService';
import { IChatService } from '../services/interfaces/IChatService';
import { IInferenceStatsFormattingService } from '../services/interfaces/IInferenceStatsFormatingService';
import { IWebSearchService } from '../services/interfaces/IWebSearchService';
import { ITTSService } from '../services/interfaces/ITTSService';
import IPromptService from '../services/API/interfaces/IPromptService';
import IAgentService from '../services/API/interfaces/IAgentService';
import { IImageService } from '../services/API/interfaces/IImageService';
import ICharacterService from '../services/API/interfaces/ICharacterService';

export interface ServicesContextType {
  agentService: IAgentService
  promptService: IPromptService
  webSearchService: IWebSearchService
  ttsService : ITTSService
  imageService : IImageService
  characterService : ICharacterService
  comfyUIService : IComfyUIService
  workflowService : ImageGenWorkflowService
  imagePromptService : ImageGenPromptService
  chatService : IChatService
  answerFormatingService : IAnswerFormattingService
  inferenceStatsFormatingService : IInferenceStatsFormattingService
}

const defaultContextValue: ServicesContextType = {
  agentService: new AgentService(),
  promptService: new PromptService(),
  webSearchService: new WebSearchService(),
  ttsService : new TTSService(),
  imageService : new ImageService(),
  characterService : new CharacterService(),
  comfyUIService : new ComfyUIService(),
  workflowService : new ImageGenWorkflowService(),
  imagePromptService : new ImageGenPromptService(),
  chatService : new ChatService(new AnswerFormatingService(), new InferenceStatsFormatingService()),
  answerFormatingService : new AnswerFormatingService(),
  inferenceStatsFormatingService : new InferenceStatsFormatingService()
};

export const ServicesContext = createContext<ServicesContextType>(defaultContextValue);

interface ServicesProviderProps {
  children: ReactNode;
  customServices?: Partial<ServicesContextType>;
}

export function ServicesProvider({ children, customServices }: ServicesProviderProps) {
  const contextValue: ServicesContextType = {
    ...defaultContextValue,
    ...customServices,
  };

  return (
    <ServicesContext.Provider value={contextValue}>
      {children}
    </ServicesContext.Provider>
  );
}