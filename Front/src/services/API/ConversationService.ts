import { IConversation, IConversationWithId } from "../../interfaces/IConversation"

export default class ConversationService{
 
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