import IPromptResponse from "../../../interfaces/responses/IPromptResponse";

export default interface IPromptService {
  /**
   * Saves a new prompt to the backend.
   */
  save(name: string, prompt: string): Promise<void>;

  /**
   * Updates an existing prompt by its previous name.
   */
  updateByName(
    prevName: string,
    options: { newName: string; prompt: string; version: number }
  ): Promise<void>;

  /**
   * Updates an existing prompt by its ID.
   */
  updateById(
    id: string,
    options: { name: string; prompt: string; version: number }
  ): Promise<void>;

  /**
   * Retrieves a prompt by its name.
   */
  getByName(name: string): Promise<IPromptResponse | undefined>;

  /**
   * Retrieves all prompts.
   */
  getAll(): Promise<IPromptResponse[] | undefined>;

  /**
   * Deletes a prompt by its ID.
   */
  deleteById(promptId: string): Promise<void>;

  /**
   * Deletes a prompt by its name.
   */
  deleteByName(promptName: string): Promise<void>;
}
