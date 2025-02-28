const express = require('express');
const router = express.Router();
const { saveAgent, updateAgentByName, updateAgentById, getAgentById, getAgentByName, getAllAgents, deleteAgentByName, updateAgentsConfig } = require('../controllers/agent.controller.js')

function agentRouter(db){
    router.post('/', saveAgent(db))
    // router.put('/agents/config', updateAgentsConfig(db))
    router.put('/byName/:name', updateAgentByName(db))
    router.put('/byId/:id', updateAgentById(db))
    router.get('/byName/:name', getAgentByName(db))
    // router.get('/agents', getAllAgents(db))
    router.delete('/byName/:name', deleteAgentByName(db))
    return router;
}

function agentsRouter(db){
    router.put('/config', updateAgentsConfig(db))
    router.get('/', getAllAgents(db))
    return router;
}

module.exports = { agentRouter, agentsRouter };