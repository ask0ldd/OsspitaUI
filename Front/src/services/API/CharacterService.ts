import ICharacterSettings from "../../interfaces/ICharacterSettings"
import ICharacterResponse from "../../interfaces/responses/ICharacterResponse"
import ICharacterService from "./interfaces/ICharacterService"

class CharacterService implements ICharacterService{

    /**
     * Fetches the list of all characters from the backend.
     * @async
     * @returns {Promise<ICharacterResponse[]>} Promise resolving to an array of character response objects.
     * @throws {Error} If the network request fails or the response is not OK.
     */
    async getAll() : Promise<ICharacterResponse[]>{
        try {
            const response = await fetch("/backend/characters", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching characters list : ", error)
            throw error
        }
    }

    /**
     * Fetches the current character settings from the backend.
     * @async
     * @returns {Promise<ICharacterSettings|undefined>} Promise resolving to the character settings object, or undefined if an error occurs.
     * @throws {Error} If the network request fails or the response is not OK.
     */
    async getSettings() : Promise<ICharacterSettings | undefined>{
        try {
            const response = await fetch("/backend/character/settings", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching character settings : ", error)
            throw error
        }
    }

    /**
     * Saves the provided character settings to the backend.
     * @async
     * @param {ICharacterSettings} settings - The character settings to save.
     * @param {string} settings.model - The model name.
     * @param {number} settings.temperature - The temperature setting.
     * @param {number} settings.num_ctx - The context window size.
     * @param {number} settings.num_predict - The number of predictions.
     * @returns {Promise<any|undefined>} Promise resolving to the response from the backend, or undefined if an error occurs.
     */
    async saveSettings({model, temperature, num_ctx, num_predict} : ICharacterSettings){
        try {
            const response = await fetch("/backend/character/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json", },
                body : JSON.stringify({model, temperature, num_ctx, num_predict})
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error saving character settings : ", error)
            return undefined
        }
    }

    /**
     * Updates the character model on the backend.
     * @async
     * @param {string} model - The new model name to set.
     * @returns {Promise<any|undefined>} Promise resolving to the response from the backend, or undefined if an error occurs.
     */
    async updateModel(model : string){
        try {
            const response = await fetch("/backend/character/model", {
                method: "PUT",
                headers: { "Content-Type": "application/json", },
                body : JSON.stringify({model})
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error saving character settings : ", error)
            return undefined
        }
    }
}

export default CharacterService