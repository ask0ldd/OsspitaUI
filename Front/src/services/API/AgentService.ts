/* eslint-disable @typescript-eslint/no-unused-vars */
import IAgentResponse from "../../interfaces/responses/IAgentResponse";
import { AIAgent } from "../../models/AIAgent";
import IAgentService from "./interfaces/IAgentService";

export default class AgentService implements IAgentService{

    /**
     * Saves a new AI agent to the backend.
     * @param {AIAgent} agent - The agent instance to save.
     * @returns {Promise<string|void>} Resolves with an error message if the request fails, or void on success.
     */
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

    /**
     * Updates an existing AI agent in the backend by agent name.
     * @param {string} agentName - The name of the agent to update.
     * @param {AIAgent} agent - The updated agent instance.
     * @returns {Promise<string|void>} Resolves with an error message if the request fails, or void on success.
     */
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

    /**
     * Updates an existing AI agent in the backend by agent ID.
     * @param {AIAgent} agent - The updated agent instance (must have a valid ID).
     * @returns {Promise<string|void>} Resolves with an error message if the request fails, or void on success.
     */
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

    /**
     * Retrieves a list of all agent names from the backend.
     * @returns {Promise<string[]|undefined>} Resolves with an array of agent names, or undefined if the request fails.
     * @throws {Error} Throws if the HTTP request fails.
     */
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

    /**
     * Retrieves a list of all agent names from the backend.
     * @returns {Promise<string[]|undefined>} Resolves with an array of agent names, or undefined if the request fails.
     * @throws {Error} Throws if the HTTP request fails.
     */
    async getAgentsNameList() : Promise<string[] | undefined> {
        try{
            const allAgents = await this.getAll()
            return allAgents?.map(agent => agent.name) || []        
        } catch (error) {
            console.error("Error fetching agents list : ", error)
            throw error
        }
    }

    /**
     * Fetches a single agent by its name.
     * @param {string} name - The name of the agent to retrieve.
     * @returns {Promise<IAgentResponse|undefined>} Resolves with the agent response, or undefined if not found or request fails.
     */
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

    /**
     * Deletes an agent by its name.
     * @param {string} name - The name of the agent to delete.
     * @returns {Promise<void>} Resolves when the agent is deleted.
     */
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

    /**
     * Updates the configuration for all agents.
     * @param {Object} config - The agents configuration object.
     * @param {string} config.advancedModel - The advanced model name.
     * @param {string} config.basicModel - The basic model name.
     * @param {string} config.embeddingModel - The embedding model name.
     * @returns {Promise<void>} Resolves when the configuration is updated.
     */
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