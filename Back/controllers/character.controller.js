const fs = require('fs').promises
const SETTINGS_FILE = "characterSettings.cfg"

const getAllCharacters = (db) => async (req, res) => {
    try {
        return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json(db.getCollection("characters").find())
    } catch (error) {
        console.error("Error retrieving characters:", error)
        res.status(500).json({ message: 'An error occurred while retrieving characters.' })
    }
}

const saveCharacterSettings = () => async (req, res) => {
    try {
        const { model, temperature, num_ctx, num_predict } = req.body

        // Input validation
        if (!model || typeof temperature !== 'number' || typeof num_ctx !== 'number' || typeof num_predict !== 'number') {
            return res.status(400).json({ message: 'Invalid input. Please provide all required fields with correct types.' })
        }

        // writing the settings
        const settings = { model, temperature, num_ctx, num_predict }
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
        
        res.status(201).json({ message: 'Settings saved successfully', settings })
    } catch (error) {
        console.error("Error writing character settings:", error)
        res.status(500).json({ message: 'An error occurred while saving character settings.' })
    }
}

const getCharacterSettings = () => async (req, res) => {
    try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf8')
        const settings = JSON.parse(data)
        
        res.status(200).json(settings)
    } catch (error) {
        console.error("Error retrieving character settings:", error)
        if (error.code === 'ENOENT') {
            res.status(404).json({ message: 'Settings file not found. Default settings may be used.' })
        } else {
            res.status(500).json({ message: 'An error occurred while retrieving character settings.' })
        }
    }
}

const initCharacterSettings = async ({ model, temperature, num_ctx, num_predict }) => {
    try{
        const settings = { model, temperature, num_ctx, num_predict }
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
    } catch (error) {
        console.error("Error writing character settings:", error)
    }
}

const updateCharacterModel = () => async (req, res) => { // update model settings
    try {
        const { model } = req.body

        // Input validation
        if (!model) {
            return res.status(400).json({ message: 'Invalid input. Please provide all required fields with correct types.' })
        }

        // reading the settings
        if(!require('fs').existsSync(SETTINGS_FILE)) await initCharacterSettings({model : "llama3.1:3b", temperature : 0.8, num_ctx : 10000, num_predict : 2048})
        const data = await fs.readFile(SETTINGS_FILE, 'utf8')
        const settings = {...JSON.parse(data)}

        // updating the settings
        settings.model = model
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
        
        res.status(201).json({ message: 'Settings saved successfully', settings })
    } catch (error) {
        console.error("Error writing character settings:", error)
        res.status(500).json({ message: 'An error occurred while saving character settings.' })
    }
}

module.exports = {getAllCharacters, saveCharacterSettings, getCharacterSettings, SETTINGS_FILE, initCharacterSettings, updateCharacterModel}