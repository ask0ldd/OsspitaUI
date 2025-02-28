const express = require('express');
const router = express.Router();
const { getDefault, getAll } = require('../../controllers/imageGen/workflow.controller.js')

function imageWorkflowRouter(db){
    router.get('/', getDefault(db))
    return router;
}

function imageWorkflowsRouter(db){
    router.get('/', getAll(db))
    return router;
}

module.exports = {imageWorkflowRouter, imageWorkflowsRouter}