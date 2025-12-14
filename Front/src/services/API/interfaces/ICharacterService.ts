import ICharacterSettings from "../../../interfaces/ICharacterSettings";
import ICharacterResponse from "../../../interfaces/responses/ICharacterResponse";

interface ICharacterService {
  /**
   * Fetches the list of all characters from the backend.
   * @returns Promise resolving to an array of character response objects.
   */
  getAll(): Promise<ICharacterResponse[]>;

  /**
   * Fetches the current character settings from the backend.
   * @returns Promise resolving to the character settings object, or undefined.
   */
  getSettings(): Promise<ICharacterSettings | undefined>;

  /**
   * Saves the provided character settings to the backend.
   * @param settings - The character settings to save.
   * @returns Promise resolving to the response from the backend, or undefined.
   */
  saveSettings(settings: ICharacterSettings): Promise<unknown | undefined>;

  /**
   * Updates the character model on the backend.
   * @param model - The new model name to set.
   * @returns Promise resolving to the response from the backend, or undefined.
   */
  updateModel(model: string): Promise<unknown | undefined>;
}

export default ICharacterService;
