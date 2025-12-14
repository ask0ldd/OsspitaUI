import { IConversationElement, IInferenceStats } from "../../interfaces/IConversation";
import IScrapedPage from "../../interfaces/IScrapedPage";
import { AIAgent } from "../../models/AIAgent";
import AICharacter from "../../models/AICharacter";
import ScrapedPage from "../../models/ScrapedPage";
import { IAnswerFormattingService } from "./IAnswerFormatingService";
import { IInferenceStatsFormattingService } from "./IInferenceStatsFormatingService";

export interface IAskedStreamedResponseParameters {
  question: string;
  chunkProcessorCallback: (params: { markdown: string; html: string }) => void;
  context: number[];
  scrapedPages?: ScrapedPage[];
  images?: string[];
}

/**
 * Interface representing a service managing AI chat interactions,
 * including question answering, follow-up generation, streaming responses,
 * and retrieval-augmented generation (RAG) handling.
 */
export interface IChatService {
  // Dependencies
  readonly answerFormatingService: IAnswerFormattingService;
  readonly inferenceStatsFormatingService: IInferenceStatsFormattingService;

  // State
  activeAgent: AIAgent | AICharacter;
  stillInUseAgent: AIAgent | AICharacter;

  // Core methods
  askForFollowUpQuestions(question: string, context?: number[]): Promise<string>;

  askTheActiveAgent(
    question: string,
    context?: number[],
    format?: boolean
  ): Promise<IConversationElement>;

  askTheActiveAgentForAStreamedResponse(
    params: IAskedStreamedResponseParameters
  ): Promise<{ newContext: number[]; inferenceStats: IInferenceStats }>;

  abortAgentLastRequest(): void;

  // Agent management
  setActiveAgent(agent: AIAgent | AICharacter): void;
  setCurrentlyUsedAgent(agent: AIAgent | AICharacter): void;
  getActiveAgentName(): string;
  getActiveAgent(): AIAgent | AICharacter;

  // RAG document management
  setDocAsARAGTarget(docName: string): void;
  removeDocFromRAGTargets(docName: string): void;
  getRAGTargetsFilenames(): string[];
  clearRAGTargets(): void;

  // Data logging
  logScrapedDatas(scrapedPages: IScrapedPage[]): void;

  // Model type detection
  isAVisionModelActive(): boolean;
  isLlamaVisionModelActive(): boolean;
}
