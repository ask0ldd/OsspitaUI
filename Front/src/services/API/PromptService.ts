import IPromptResponse from "../../interfaces/responses/IPromptResponse"
import IPromptService from "./interfaces/IPromptService"

export default class PromptService implements IPromptService{

    /**
     * Saves a new prompt to the backend.
     * @async
     * @param {string} name - The name of the prompt.
     * @param {string} prompt - The prompt content.
     * @returns {Promise<void>} Resolves when the prompt is saved.
     * @throws {Error} If the save operation fails.
     */
    async save(name : string, prompt : string) : Promise<void>{
        try{
            const reponse = await fetch('/backend/prompt', {
                method : 'POST',
                body : JSON.stringify({name, prompt, version : 1}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error saving the prompt') // !!! deal with existing name
        }catch(e){
            console.error(e)
        }
    }

    /**
     * Updates an existing prompt by its previous name.
     * @async
     * @param {string} prevName - The previous name of the prompt.
     * @param {Object} options - The update options.
     * @param {string} options.newName - The new name for the prompt.
     * @param {string} options.prompt - The updated prompt content.
     * @param {number} options.version - The version number.
     * @returns {Promise<void>} Resolves when the prompt is updated.
     * @throws {Error} If the update operation fails.
     */
    async updateByName(prevName : string, {newName, prompt, version} : {newName : string, prompt : string, version : number}) : Promise<void>{
        try{
            const reponse = await fetch('/backend/prompt/byName/' + prevName, {
                method : 'PUT',
                body : JSON.stringify({name : newName, prompt, version}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error updating the prompt')
        }catch(e){
            console.error(e)
        }
    }

    /**
     * Updates an existing prompt by its ID.
     * @async
     * @param {string} id - The ID of the prompt.
     * @param {Object} options - The update options.
     * @param {string} options.name - The new name for the prompt.
     * @param {string} options.prompt - The updated prompt content.
     * @param {number} options.version - The version number.
     * @returns {Promise<void>} Resolves when the prompt is updated.
     * @throws {Error} If the update operation fails.
     */
    async updateById(id : string, {name, prompt, version} : {name : string, prompt : string, version : number}) : Promise<void>{
        try{
            const reponse = await fetch('/backend/prompt/byId/' + id, {
                method : 'PUT',
                body : JSON.stringify({name, prompt, version}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error updating the prompt')
        }catch(e){
            console.error(e)
        }
    }

    /**
     * Retrieves a prompt by its name.
     * @async
     * @param {string} name - The name of the prompt.
     * @returns {Promise<IPromptResponse|undefined>} The prompt response, or undefined if not found or on error.
     */
    async getByName(name : string) : Promise<IPromptResponse | undefined>{
        try {
            const response = await fetch("/backend/prompt/byName/" + name, {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching the target prompt : ", error)
            return undefined
        }
    }

    /**
     * Retrieves all prompts.
     * @async
     * @returns {Promise<IPromptResponse[]|undefined>} Array of prompt responses, or undefined on error.
     */
    async getAll() : Promise<IPromptResponse[] | undefined>{
        try {
            const response = await fetch("/backend/prompts", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching prompts list : ", error)
            return undefined
        }
    }

    /**
     * Deletes a prompt by its ID.
     * @async
     * @param {string} promptId - The ID of the prompt to delete.
     * @returns {Promise<void>} Resolves when the prompt is deleted.
     * @throws {Error} If the delete operation fails.
     */
    async deleteById(promptId : string) : Promise<void>{
        try {
            const response = await fetch("/backend/prompt/byId/" + promptId, {
                method:"DELETE"
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

        } catch (error) {
            console.error("Error deleting the target prompt : ", error)
            return undefined
        }
    }

    /**
     * Deletes a prompt by its name.
     * @async
     * @param {string} promptName - The name of the prompt to delete.
     * @returns {Promise<void>} Resolves when the prompt is deleted.
     * @throws {Error} If the delete operation fails.
     */
    async deleteByName(promptName : string) : Promise<void>{
        try {
            const response = await fetch("/backend/prompt/byName/" + promptName, {
                method:"DELETE"
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

        } catch (error) {
            console.error("Error deleting the target prompt : ", error)
            return undefined
        }
    }
}