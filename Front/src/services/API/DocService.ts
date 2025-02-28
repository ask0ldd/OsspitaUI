import IEmbedChunkedDoc from "../../interfaces/IEmbedChunk"
import { IRAGDocument } from "../../interfaces/IRAGDocument"
import IRAGChunkResponse from "../../interfaces/responses/IRAGChunkResponse"
import { AIModel } from "../../models/AIModel"
import DocProcessorService from "../DocProcessorService"

export default class DocService{

    static embeddingModel = new AIModel({modelName : "nomic-embed-text"})

    static async saveDocWithEmbeddings(processedDoc : IEmbedChunkedDoc[]){
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

    // deletion by name possible since duplicates aren't allowed
    static async deleteByName(filename : string){
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