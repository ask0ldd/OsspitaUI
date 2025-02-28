const express = require('express');
const router = express.Router();
const { saveConversation, getAllConversations, getConversationById, deleteConversationById, updateConversationById } = require('../controllers/conversation.controller.js')

function conversationRouter(db){
    router.post('/', saveConversation(db))
    router.get('/byId/:id', getConversationById(db))
    router.put('/byId/:id', updateConversationById(db))
    router.delete('/byId/:id', deleteConversationById(db))
    return router;
}

function conversationsRouter(db){
    router.get('/', getAllConversations(db))
    return router;
}


module.exports = { conversationRouter, conversationsRouter };