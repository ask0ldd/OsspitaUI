const fs = require('fs').promises

class VectorDatabase {
    #DBFilePath
    #datas

    constructor(filePath) {
      this.#DBFilePath = filePath
    }

    async start(){
        try {
            await fs.access(this.#DBFilePath)
            this.#datas = await this.loadDB()
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.#datas = []
                await this.saveDB()
            } else {
                throw error
            }
        }
    }

    async loadDB() {
        try {
          const readData = await fs.readFile(this.#DBFilePath, 'utf8')
          return JSON.parse(readData)
        } catch (error) {
          if (error.code === 'ENOENT') {
            return []
          }
          throw error
        }
    }

    async addChunk(text, embedding, metadatas = {}) {
      try {
        // const asciiEmbeddings = embeddings.map(embedding => this.convertCoordinateToASCII(Math.abs(embedding)))
        // const roundedEmbeddings = embeddings.map((embedding, index) => parseFloat(embedding.toFixed(9)))
        this.#datas.push({ text, embedding, metadatas })
      } catch (error) {
        console.error(error)
        throw error
      }
    }

    async addDocumentWithEmbeddings(document) {
      try {
        if(this.#datas.find(data => data.metadatas.filename == document[0].metadatas.filename)) {
          throw new Error("A document with this filename already exists in database.")
        }
        console.log(JSON.stringify(document.length))
        for(const chunk of document){
          await this.addChunk(chunk.text, chunk.embedding, {filename : chunk.metadatas.filename, filesize : chunk.metadatas.filesize})
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    }

    async deleteDocument(filename) {
      try {
        const newDatas = this.#datas.filter(data => data.metadatas.filename != filename)
        this.#datas = newDatas
        await this.saveDB()
      } catch (error) {
        console.log(error)
        throw error
      }
    }
   
    async saveDB() {
      await fs.writeFile(this.#DBFilePath, JSON.stringify(this.#datas), 'utf8')
    }

    async clearDB(){
      await fs.writeFile(this.#DBFilePath, JSON.stringify([]), 'utf8')
    }

    #cosineSimilarity(vecA, vecB) {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
      const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
      return dotProduct / (magnitudeA * magnitudeB)
    }
      
    #similaritySearch(queryEmbeddings, targetFilesNames, database, topK = 5) {
      const results = database.filter(item => targetFilesNames.includes(item.metadatas.filename)).map(item => ({
        ...item,
        similarity: this.#cosineSimilarity(queryEmbeddings, item.embedding)
      }))
      return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
    }

    search(queryEmbeddings, targetFilesNames, topK = 5) {
      const results = this.#similaritySearch(queryEmbeddings, targetFilesNames, this.#datas, topK)
      // results.forEach((result, index) => console.log('-- ' + result.similarity + ' : ' + index + ' > ' + result.text))
      // console.log('searchresults : ' + JSON.stringify(results))
      return this.#similaritySearch(queryEmbeddings, targetFilesNames, this.#datas, topK)
    }

    getFilesList(){
      const filesList = new Set(this.#datas.map((chunk) => (
        JSON.stringify({filename : chunk.metadatas.filename, size : chunk.metadatas.filesize })
      )))
      return [...filesList].map((file) => JSON.parse(file))
    }

    convertCoordinateToASCII(coordinate){
      let quotient = coordinate
      let newQuotient = coordinate
      let remainder = 0
      let finalASCIISeq = ""
  
      while(true){
          newQuotient = Math.floor(quotient/256)
          remainder = quotient - newQuotient*256
          finalASCIISeq += String.fromCharCode(remainder)
          if(newQuotient == 0) break
          quotient = newQuotient
      }
  
      return finalASCIISeq
    }
}

module.exports = VectorDatabase