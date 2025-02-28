const express = require('express');
const router = express.Router();
const { getAllDocs, getDocsChunksBySimilarity, saveEmbeddings, deleteDocumentEmbeddings } = require('../controllers/doc.controller.js')

function docRouter(vdb){
    router.delete('/byName/:name', deleteDocumentEmbeddings(vdb))
    return router;
}

function docsRouter(vdb){
    router.get('/', getAllDocs(vdb))
    router.post('/bySimilarity', getDocsChunksBySimilarity(vdb))
    return router;
}

function embeddingsRouter(vdb){
    router.post('/', saveEmbeddings(vdb))
    return router;
}

module.exports = { docRouter, docsRouter, embeddingsRouter };