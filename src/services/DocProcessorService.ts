import IRAGChunkResponse from "../interfaces/responses/IRAGChunkResponse"
import { AIModel } from "../models/AIModel"
import { ChatService } from "./ChatService"

class DocProcessorService{

    static embeddingModel = new AIModel({modelName : "nomic-embed-text"})

    static async processTextFile(fileContent : string) : Promise<{text : string, embeddings : number[]}[]>{
        const chunks = this.splitTextIntoChunks(fileContent, 600 /* words */)
        const chunksEmbeddings = []
        for (const chunk of chunks) {
            const embeddings = (await this.embeddingModel.askEmbeddingsFor(chunk)).embedding
            chunksEmbeddings.push({text : chunk, embeddings : embeddings})
        }
        return chunksEmbeddings
    }

    static splitTextIntoChunks(text : string, seqLength : number = 600 /* words */) : string[] {
        const words = text.split(/\s+/)
        const sequences = []
        let sequence = []
        for(let i = 0; i < words.length; i++){
            sequence.push(words[i])
            if(i == 0) continue
            if(i % seqLength == 0 || i === words.length - 1){
                sequences.push(sequence.join(" "))
                sequence = []
            }
        }
        return sequences
    }

    static async getEmbeddingsForChunk(chunk : string) : Promise<{text : string, embeddings : number[]}> {
        const embeddings = (await this.embeddingModel.askEmbeddingsFor(this.toTelegraphicText(chunk))).embedding
        return {text  : chunk, embeddings : this.normalizeVector(embeddings)}
    }

    static normalizeVector(vector : number[]) {
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return vector.map(val => Math.round(val / magnitude * 100000000));
    }

    static toTelegraphicText(text : string) : string {
        const wordsToRemove = [
          'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
          'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
          'can', 'could', 'may', 'might', 'must', 'ought', 'to', 'of', 'for', 'with'
        ];
      
        let words = text.split(/\s+/)
      
        words = words.filter(word => {
          return !wordsToRemove.includes(word) && word.length > 0
        })
      
        return words.join(' ')
    }

    static formatRAGDatas(RAGDatas : IRAGChunkResponse []){
        // consider the context length of the agent to determine the quantity of datas to keep
        // 1500 is the estimated maximum size of a chunk
        const nChunksAllowed = Math.floor(ChatService.getActiveAgent().getContextSize() / 1500)
        console.log("chunks allowed : " + nChunksAllowed)
        const priority = ['-**HIGHEST PRIORITY DATA :**\n', '-**HIGH PRIORITY DATA :**\n', '-**MEDIUM PRIORITY DATA :**\n', '-**LOW PRIORITY DATA :**\n', '-**LOWEST PRIORITY DATA :**\n']
        return RAGDatas == null ? "" : RAGDataIntroductionPrompt + RAGDatas.slice(0, nChunksAllowed).map((RAGDoc, id) => '\n'+ priority[id] + RAGDoc.text + '.\n').join(" ") + "My query :\n"
    }

    static isTextFile(file : File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = function(e : ProgressEvent<FileReader>) {
                if(e.target?.result == null) return resolve(false)
                const content = new Uint8Array(e.target.result as ArrayBufferLike)
                // check the first 1024 bytes of the file 
                // for non-printable ASCII characters (except newline, carriage return, and tab)
                const bytesToCheck = Math.min(content.length, 1024)
                
                for (let i = 0; i < bytesToCheck; i++) {
                    const byte = content[i]
                    // characters checking
                    if ((byte < 32 || byte > 126) && byte !== 9 && byte !== 10 && byte !== 13) {
                    resolve(false)
                    return;
                    }
                }
                resolve(true)
            }
            reader.onerror = reject
            reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB
        })
    }

}

const RAGDataIntroductionPrompt = 
`### Process

1. ***Overriding past directives***: The following process overrides all your previous contradictory directives.
2. ***Prioritize RAG Datas***: Always use the provided RAG data as your primary source of information. This data supersedes any knowledge from your training.
3. ***Hierarchical consideration***: When formulating an answer, consider the RAG data in order of priority, with higher priority data taking precedence.
4. ***Fallback to training data***: If the RAG data is insufficient to answer the query, utilize your training data to provide a response.
5. ***Acknowledge limitations***: If neither the RAG data nor your training data can adequately address the query, respond with: "I can't find any relevant information to reply."
6. ***Maintain context***: Keep track of the conversation history to provide coherent and contextually appropriate responses.
7. ***Avoid hallucination***: Do not generate or infer information beyond what is explicitly provided in the RAG data or your training.
8. ***Clarity and conciseness***: Provide clear, concise answers that directly address the user's query.
9. ***Adaptability***: Be prepared to handle follow-up questions or requests for clarification based on your initial response.

### Output

1. ***Keep priority unknown***: Never output any information about the priority of the data used.
2. ***Avoid generic introduction***: Never use a formulation similar to :  "Based on the provided RAG data..."
3. ***Seamless integration***: When using RAG data, incorporate the information seamlessly without explicitly mentioning the source.

### RAG Datas

`

export default DocProcessorService