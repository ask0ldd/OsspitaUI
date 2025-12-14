import IAgentResponse from "../../../interfaces/responses/IAgentResponse";
import { AIAgent } from "../../../models/AIAgent";

export default interface IAgentService {
  /**
   * Saves a new AI agent to the backend.
   */
  save(agent: AIAgent): Promise<string | void>;

  /**
   * Updates an existing AI agent in the backend by agent name.
   */
  updateByName(agentName: string, agent: AIAgent): Promise<string | void>;

  /**
   * Updates an existing AI agent in the backend by agent ID.
   */
  updateById(agent: AIAgent): Promise<string | void>;

  /**
   * Retrieves all AI agents.
   */
  getAll(): Promise<IAgentResponse[] | undefined>;

  /**
   * Retrieves a list of all agent names.
   */
  getAgentsNameList(): Promise<string[] | undefined>;

  /**
   * Fetches a single agent by its name.
   */
  getAgentByName(name: string): Promise<IAgentResponse | undefined>;

  /**
   * Deletes an agent by its name.
   */
  deleteAgent(name: string): Promise<void>;

  /**
   * Updates the configuration for all agents.
   */
  updateAgentsConfig(config: {
    advancedModel: string;
    basicModel: string;
    embeddingModel: string;
  }): Promise<void>;
}
