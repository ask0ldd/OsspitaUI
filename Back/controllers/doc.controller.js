const getAllDocs = (vdb) => async (req, res) => {
    try {
      console.log("Fetching docs.")

      // return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json(db.getCollection("docs").find())

      return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json(vdb.getFilesList())

    } catch (error) {
      console.error("Error retrieving docs:", error)
      res.status(500).json({ message: 'An error occurred while retrieving docs.' })
    }
}

// vdb search result : { id: string, filename: string, size: number, selected: : boolean, similitary : number }
const getDocsChunksBySimilarity = (vdb) => async (req, res) => {
  try {
    console.log("Fetching docs by similarity.")

    const { query, embedding, targetFilesNames} = req.body
    // console.log("embeddings : " + JSON.stringify(embeddings))
    if(targetFilesNames.length < 1) return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json([])
    const RAGTopKResults = await vdb.search(embedding, targetFilesNames)

    return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json((RAGTopKResults)/*.map((doc)=> doc.text)*/)

  } catch (error) {
    console.error("Error retrieving docs:", error)
    res.status(500).json({ message: 'An error occurred while retrieving docs.' })
  }
}

const saveEmbeddings = (vdb) => async (req, res) => {
  try {
      const textChunks = req.body
      await vdb.addDocumentWithEmbeddings(textChunks)
      await vdb.saveDB()

      res.status(201).send('Embeddings saved successfully.')

  } catch (error) {
      console.error(error)
      res.status(500).send('An error occurred while attempting to save the embeddings : ' + error)
  }
}

const deleteDocumentEmbeddings = (vdb) => async (req, res) => {
  try {
    const filename = req.params.name
    await vdb.deleteDocument(filename)

    res.status(204).send('Document deleted.')
    
  } catch (error) {
    console.log("Error deleting the docs:", error)
    res.status(500).send('An error occurred while attempting to delete the document : ' + error)
  }
}

module.exports = { getAllDocs, getDocsChunksBySimilarity, saveEmbeddings, deleteDocumentEmbeddings }