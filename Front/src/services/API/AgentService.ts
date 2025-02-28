/* eslint-disable @typescript-eslint/no-unused-vars */
import IAgentResponse from "../../interfaces/responses/IAgentResponse";
import { AIAgent } from "../../models/AIAgent";

export default class AgentService{

    async save(agent : AIAgent) : Promise<string | void>{
        try{
            const reponse = await fetch('/backend/agent', {
                method : 'POST',
                body : agent.asString(),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) return reponse.text()
            // throw new Error('Error saving agent in DB.')
        }catch(e){
            console.error(e)
        }
    }

    async updateByName(agentName : string, agent : AIAgent) : Promise<string | void>{
        try{
            const reponse = await fetch('/backend/agent/byName/' + agentName, {
                method : 'PUT',
                body : agent.asString(),
                headers:{ 'Content-Type' : 'application/json' }
            })
            // if(!reponse.ok) throw new Error('Error updating agent in DB.')
            if(!reponse.ok) return reponse.text()
        }catch(e){
            console.error(e)
        }
    }

    async updateById(agent : AIAgent) : Promise<string | void>{
        try{
            const reponse = await fetch('/backend/agent/byId/' + agent.getId(), {
                method : 'PUT',
                body : agent.asString(),
                headers:{ 'Content-Type' : 'application/json' }
            })
            // if(!reponse.ok) throw new Error('Error updating agent in DB.')
            if(!reponse.ok) return reponse.text()
        }catch(e){
            console.error(e)
        }
    }

    async getAll(): Promise<IAgentResponse[] | undefined>{
        try {
            const response = await fetch("/backend/agents", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching agents list : ", error)
            throw error
        }
    }

    async getAgentsNameList() : Promise<string[] | undefined> {
        try{
            const allAgents = await this.getAll()
            return allAgents?.map(agent => agent.name) || []        
        } catch (error) {
            console.error("Error fetching agents list : ", error)
            throw error
        }
    }

    async getAgentByName(name : string): Promise<IAgentResponse | undefined>{
        try {
            const response = await fetch("/backend/agent/byName/" + name, {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching agents list : ", error)
            return undefined
        }
    }

    async deleteAgent(name : string): Promise<void>{
        try{
            const response = await fetch("/backend/agent/byName/" + name, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }catch(e){
            console.error(e)
        }
    }

    async updateAgentsConfig({advancedModel, basicModel, embeddingModel} : {advancedModel : string, basicModel : string, embeddingModel : string}) : Promise<void>{
        try{
            const reponse = await fetch('/backend/agents/config', {
                method : 'PUT',
                body : JSON.stringify({advancedModel, basicModel, embeddingModel}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error updating agents in DB.')
        }catch(e){
            console.error(e)
        }
    }
}