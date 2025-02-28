const { promptRouter, promptsRouter } = require('./routes/prompt.routes.js')
const { agentRouter, agentsRouter } = require('./routes/agent.routes.js');
const { docRouter, docsRouter, embeddingsRouter } = require('./routes/doc.routes.js')
const { characterRouter, charactersRouter } = require('./routes/character.routes.js')
const { conversationRouter, conversationsRouter } = require('./routes/conversation.routes.js');
const { getScrapedDatas } = require('./controllers/scraping.controller.js')
const { uploadImage, getAllImages, deleteImageById, getAllGeneratedImages } = require('./controllers/image.controller.js')
const { imagePromptRouter, imagePromptsRouter } = require('./routes/imageGen/prompt.routes.js')
const { imageWorkflowRouter, imageWorkflowsRouter } = require('./routes/imageGen/workflow.routes.js')
// const { getTTSaudio } = require('./controllers/tts.controller.js')
const express = require('express')
const cors = require('cors')
const loki = require("lokijs")
const LokiFSAdapter = require("lokijs/src/loki-fs-structured-adapter")
const VectorDatabase = require('./models/VectorDatabase.js')
const { initImageStorage } = require('./services/storage.service.js');
const { removeCollections, databaseInit } = require('./services/db.service.js');

const app = express()
const PORT = process.env.PORT || 5174

const adapter = new LokiFSAdapter()
const db = new loki('sandbox.db', { 
  adapter : adapter,
  autoload: true,
  autoloadCallback : async () => await databaseInit(db),
  autosave: true, 
  autosaveInterval: 4000
})

const vdb = new VectorDatabase("./embeddings.db")
vdb.start()
vdb.clearDB()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

app.get('/ping', (req, res) => {
  console.log("ping")
  res.status(200).json({message: "pong"})
})

app.post('/scrape', getScrapedDatas())

app.use('/agents', agentsRouter(db))
app.use('/agent', agentRouter(db))
app.use('/prompts', promptsRouter(db))
app.use('/prompt', promptRouter(db))
app.use('/imagegen/prompts', imagePromptsRouter(db))
app.use('/imagegen/prompt', imagePromptRouter(db))
app.use('/imagegen/workflows', imageWorkflowsRouter(db))
app.use('/imagegen/workflow', imageWorkflowRouter(db))
app.use('/conversations', conversationsRouter(db))
app.use('/conversation', conversationRouter(db))
app.use('/characters', charactersRouter(db))
app.use('/character', characterRouter(db))
app.use('/docs', docsRouter(vdb))
app.use('/doc', docRouter(vdb))
app.use('/embeddings', embeddingsRouter(vdb))

// defining Documents related routes
/*app.post('/embeddings', saveEmbeddings(vdb))
app.get('/docs', getAllDocs(vdb))
app.post('/docs/bySimilarity', getDocsChunksBySimilarity(vdb))
app.delete('/doc/byName/:name', deleteDocumentEmbeddings(vdb))*/

// app.post('/tts/generate', getTTSaudio)

// images
const imageStorage = initImageStorage()
app.post('/upload', imageStorage.single('image'), uploadImage(db))
app.get('/images', getAllImages(db))
app.get('/generated', getAllGeneratedImages(db))
// app.get('/image/byFilename/:filename', getImageByFilename(db))
app.use('/images', express.static('images'))
app.delete('/image/byId/:id', deleteImageById(db))