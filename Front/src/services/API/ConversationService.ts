import { IConversation, IConversationWithId } from "../../interfaces/IConversation"

export default class ConversationService{
 
    /**
     * Saves a new conversation to the backend.
     *
     * @async
     * @param {IConversation} conversation - The conversation data to save.
     * @returns {Promise<IConversationWithId|undefined>} The saved conversation with its ID, or undefined if an error occurs.
     * @throws {Error} If the backend returns a non-OK response.
     */
    static async save(conversation : IConversation) : Promise<IConversationWithId | undefined>{
        try{
            const reponse = await fetch('/backend/conversation', {
                method : 'POST',
                body : JSON.stringify({...conversation}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error saving the conversation') // !!! deal with existing name
            return reponse.json()
        }catch(e){
            console.error(e)
        }
    }

    /**
     * Updates an existing conversation by its ID.
     *
     * @async
     * @param {number} conversationId - The ID of the conversation to update.
     * @param {IConversation} conversation - The updated conversation data.
     * @returns {Promise<void>} Resolves when the update is complete.
     * @throws {Error} If the backend returns a non-OK response.
     */
    static async updateById(conversationId : number, conversation : IConversation) : Promise<void>{
        try{
            const reponse = await fetch('/backend/conversation/byId/' + conversationId, {
                method : 'PUT',
                body : JSON.stringify({...conversation}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error updating the conversation')
        }catch(e){
            console.error(e)
        }
    }

    // getById<T extends IConversationWithId>(conversationId: T['$loki']): Promise<T | undefined>
    /**
     * Retrieves a conversation by its ID.
     *
     * @async
     * @param {number} conversationId - The ID of the conversation to retrieve.
     * @returns {Promise<IConversationWithId|undefined>} The found conversation, or undefined if not found or on error.
     * @throws {Error} If the backend returns a non-OK response.
     */
    static async getById(conversationId : number) : Promise<IConversationWithId | undefined>{
        try {
            const response = await fetch("/backend/conversation/byId/" + conversationId, {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching the target conversation : ", error)
            return undefined
        }
    }

    /**
     * Retrieves all conversations from the backend.
     *
     * @async
     * @returns {Promise<IConversationWithId[]|undefined>} An array of conversations, or undefined if an error occurs.
     * @throws {Error} If the backend returns a non-OK response.
     */
    static async getAll() : Promise<IConversationWithId[] | undefined>{
        try {
            const response = await fetch("/backend/conversations", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching conversations list : ", error)
            throw error
        }
    }

    /**
     * Deletes a conversation by its ID.
     *
     * @async
     * @param {number} conversationId - The ID of the conversation to delete.
     * @returns {Promise<void>} Resolves when the deletion is complete.
     * @throws {Error} If the backend returns a non-OK response.
     */
    static async deleteById(conversationId : number) : Promise<void>{
        try {
            const response = await fetch("/backend/conversation/byId/" + conversationId, {
                method:"DELETE"
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

        } catch (error) {
            console.error("Error deleting the target conversation : ", error)
            return undefined
        }
    }
}