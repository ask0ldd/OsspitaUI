const express = require('express');
const router = express.Router();
const { savePrompt, getPromptById, getPromptByName, getAllPrompts, updatePromptById, updatePromptByName, deletePromptById } = require('../../controllers/imageGen/prompt.controller.js')

function imagePromptRouter(db){
    router.post('/', savePrompt(db))
    router.get('/byId/:id', getPromptById(db))
    router.put('/byId/:id', updatePromptById(db))
    router.put('/byName/:name', updatePromptByName(db))
    router.get('/byName/:name', getPromptByName(db))
    router.delete('/byId/:id', deletePromptById(db))
    return router;
}

function imagePromptsRouter(db){
    router.get('/', getAllPrompts(db))
    return router;
}

module.exports = { imagePromptRouter, imagePromptsRouter };