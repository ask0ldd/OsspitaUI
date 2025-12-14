import IEmbedChunkedDoc from "../../interfaces/IEmbedChunk"
import { IRAGDocument } from "../../interfaces/IRAGDocument"
import IRAGChunkResponse from "../../interfaces/responses/IRAGChunkResponse"
import { AIModel } from "../../models/AIModel"
import DocProcessorService from "../DocProcessorService"

export default class DocService{

    static embeddingModel = new AIModel({modelName : "nomic-embed-text"})

    /**
     * Persists a processed document and its embeddings to the backend.
     * @async
     * @param {IEmbedChunkedDoc[]} processedDoc - Array of processed document chunks with embeddings.
     * @returns {Promise<void>}
     */
    static async saveDocWithEmbeddings(processedDoc : IEmbedChunkedDoc[]): Promise<void>{
        try{
            const response = await fetch("/backend/embeddings", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body : JSON.stringify(processedDoc)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }catch(e){
            console.error(e)
        }
    }

    /**
     * Deletes a document from the backend by its filename.
     * Duplicates are not allowed, so deletion by name is unique.
     * @async
     * @param {string} filename - The name of the file to delete.
     * @returns {Promise<void>}
     */
    static async deleteByName(filename : string): Promise<void>{
        try{
            const response = await fetch("/backend/doc/byName/" + filename, {
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
     * Retrieves all documents from the backend.
     * @async
     * @returns {Promise<IRAGDocument[]>} Resolves to an array of RAG documents.
     */
    static async getAll() : Promise<IRAGDocument[]>{
        try {
            const response = await fetch("/backend/docs", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching docs list : ", error)
            return []
        }
    }

    /**
     * Retrieves RAG (Retrieval-Augmented Generation) results for a given query and target file names.
     * @async
     * @param {string} query - The query string to search for.
     * @param {string[]} targetFilesNames - Array of target file names to search within.
     * @returns {Promise<IRAGChunkResponse[]>} Resolves to an array of RAG chunk responses.
     */
    static async getRAGResults(query : string, targetFilesNames : string[]) : Promise<IRAGChunkResponse[]>{
        try {
            console.log("***Get RAG Datas***")
            const queryEmbeddings = (await this.embeddingModel.askEmbeddingsFor(query)).embedding
            const response = await fetch("/backend/docs/bySimilarity", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body : JSON.stringify({ query,  embedding : DocProcessorService.normalizeVector(queryEmbeddings), targetFilesNames })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching related docs : ", error)
            return []
        }
    }
}