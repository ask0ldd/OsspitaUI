const express = require('express');
const router = express.Router();
const {getAllCharacters, saveCharacterSettings, getCharacterSettings, SETTINGS_FILE, initCharacterSettings, updateCharacterModel} = require('../controllers/character.controller')


function characterRouter(db){
    router.get('/settings', getCharacterSettings(db))
    router.put('/settings', saveCharacterSettings(db))
    router.put('/model', updateCharacterModel(db))
    return router;
}

function charactersRouter(db){
    router.get('/', getAllCharacters(db))
    return router;
}

module.exports = { characterRouter, charactersRouter };