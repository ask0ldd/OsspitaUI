import { IEmbeddingResponse } from "../interfaces/responses/IEmbeddingResponse"
import IRAGChunkResponse from "../interfaces/responses/IRAGChunkResponse"
import { AIModel } from "../models/AIModel"
import { split } from 'sentence-splitter'

class DocProcessorService{

    static embeddingModel = new AIModel({modelName : "nomic-embed-text"})

    static async processTextFile(fileContent : string) : Promise<{text : string, embedding : number[]}[]>{
        const chunks = this.splitTextIntoChunks(fileContent, 600 /* words */)
        const chunksEmbeddings = []
        for (const chunk of chunks) {
            const embedding = (await this.embeddingModel.askEmbeddingsFor(chunk)).embedding
            chunksEmbeddings.push({text : chunk, embedding : embedding})
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

    /*static sentencesSplitter(text : string){
        const segmenter = new (Intl as any).Segmenter('en', { granularity: 'sentence' });
        const sentences = Array.from(segmenter.segment(text), (s : SegmentResult) => s?.segment ? s.segment.trim() : undefined);
        console.log(sentences);
    }*/

    static sentencesSplitter(text : string) : string[]{
        const sentences = split(text);
        // Process sentences for LLM input
        const extractedSentences = sentences.map(node => {
        if (node.type === 'Sentence') {
            return node.raw.trim()
        }
        return ''
        }).filter(Boolean)

        console.log(JSON.stringify(extractedSentences))
        return extractedSentences
    }

    static getCosineSimilarity(vecA : number[], vecB : number[]) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
        return dotProduct / (magnitudeA * magnitudeB)
    }

    static async getEmbeddingsForChunk(chunk : string) : Promise<{text : string} & IEmbeddingResponse> {
        const embeddings = (await this.embeddingModel.askEmbeddingsFor(this.toTelegraphicText(chunk))).embedding
        return {text  : chunk, embedding : this.normalizeVector(embeddings)}
    }

    static async semanticChunking(text : string, threshold : number){
        const sentences = this.sentencesSplitter(text)
        const embedSentences : { text: string, embedding : number[] } [] = []
        for(const sentence of sentences){
            const embedSentence = await this.getEmbeddingsForChunk(sentence)
            embedSentences.push({text : embedSentence.text.replace(/\s+/g, ' '), embedding : embedSentence.embedding})
        }
        console.log(embedSentences.length)
        return await this.sentencesGroupingBySimilarity(embedSentences, threshold)
    }

    static async sentencesGroupingBySimilarity(embedSentences : {text : string, embedding : number[]}[], threshold : number){
        const groupedSentences = []
        let concatSentence = ""
        if (embedSentences.length > 0){
            concatSentence = embedSentences[0].text
            for(let i = 0; i < embedSentences.length - 1; i++){
                // console.log(DocProcessorService.getCosineSimilarity(embedSentences[i].embedding, embedSentences[i+2].embedding))
                // is there 3 elements left? how similar are they?
                if(i < embedSentences.length - 3 && DocProcessorService.getCosineSimilarity(embedSentences[i].embedding, embedSentences[i+2].embedding) > threshold) 
                {
                    concatSentence += embedSentences[i+1].text + embedSentences[i+2].text
                    i++
                    continue
                }
                // is there 2 elements left? how similar are they?
                if(i < embedSentences.length - 2 && DocProcessorService.getCosineSimilarity(embedSentences[i].embedding, embedSentences[i+1].embedding) > threshold) 
                {
                    concatSentence += embedSentences[i+1].text
                    groupedSentences.push(concatSentence)
                    concatSentence = embedSentences[i+2].text
                    i++
                    continue
                }
                
                groupedSentences.push(concatSentence)
                concatSentence = embedSentences[i+1].text
            }
            groupedSentences.push(concatSentence)
        } 
        
        console.log(JSON.stringify(groupedSentences))
        console.log(groupedSentences.length)
        console.log(embedSentences.reduce((acc, sentence) => acc + sentence.text, "").length)
        console.log(groupedSentences.reduce((acc, sentence) => acc + sentence, "").length)
        
        const sentencesWithEmbedding = []
        for(const sentence of groupedSentences){
            sentencesWithEmbedding.push({text : sentence, embedding : await DocProcessorService.getEmbeddingsForChunk(sentence)})
        }
        return sentencesWithEmbedding
    }

    static normalizeVector(vector : number[]) {
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return vector.map(val => Math.round(val * 10000000 / magnitude));
    }

    static convertTo2Bits(vector : number[]) {
        return vector.map(val => {
            if(val == 0) return 0
            return val > 0 ? 1 : -1
        })
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

    static formatRAGDatas(contextSize : number, RAGDatas : IRAGChunkResponse []){
        // consider the context length of the agent to determine the quantity of datas to keep
        // 1500 is the estimated maximum size of a chunk
        // const nChunksAllowed = Math.floor(ChatService.getActiveAgent().getContextSize() / 1500)
        const nChunksAllowed = Math.floor(contextSize / 1500)
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
`From now on, ignore any past directive that could contradict what follows.

### Process

1. ***Prioritize RAG Datas***: Always use the provided RAG data as your primary source of information. This data supersedes any knowledge from your training and from our conversation.
2. ***Hierarchical consideration***: When formulating an answer, consider the RAG data in order of priority, with higher priority data taking precedence.
3. ***Fallback to training data***: If the RAG data is insufficient to answer the query, utilize your training data to provide a response.
4. ***Acknowledge limitations***: If neither the RAG data nor your training data can adequately address the query, respond with: "I can't find any relevant information to reply."
5. ***Maintain context***: Keep track of the conversation history to provide coherent and contextually appropriate responses.
6. ***Avoid hallucination***: Do not generate or infer information beyond what is explicitly provided in the RAG data or your training.
7. ***Clarity and conciseness***: Provide clear, concise answers that directly address the user's query.
8. ***Adaptability***: Be prepared to handle follow-up questions or requests for clarification based on your initial response.

### Output

1. ***Introduction***: Your answer should always begin with "According to the provided documents,".
2. ***Keep priority unknown***: NEVER mention in your answer any information about the priority of the data used.
3. ***Seamless integration***: When using RAG data, incorporate the information seamlessly without explicitly mentioning the source.

### RAG Datas

`

export default DocProcessorService