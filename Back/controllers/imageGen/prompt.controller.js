// final
const savePrompt = (db) => async (req, res) => {
  try {
    validatePromptInputs(req.body) // Validate inputs

    const promptsCollection = db.getCollection('imagegen-prompts')
    if (!promptsCollection) {
    throw new Error('The prompts collection does not exist in the database.')
    }

    const existingAgent = await promptsCollection.findOne({ name : req.body.name })
    if (existingAgent) {
      return res.status(409).send('Prompt name is not available.')
    }

    let highestLokiId = await promptsCollection.chain()
    .simplesort('$loki', { desc: true })
    .limit(1)
    .data()[0]?.$loki ?? 0
  
    const nZerosNeeded = 10 - (highestLokiId + 1).toString().length

    await promptsCollection.insertOne({
      id: "p" + '0'.repeat(nZerosNeeded) + (highestLokiId + 1) , 
      name: req.body.name, 
      prompts: [{
        text : req.body.prompt,
        version : 1,
        createdAt: new Date().toISOString(),
      }], 
      currentVersion: 1
    })

    db.saveDatabase((err) => {
      if (err) {
        console.error("Error saving database:", err)
        return res.status(500).json({ error: 'Cant save the database' })
      } else {
        console.log("Database saved successfully")
      }
    })

    res.status(201).send('Prompt saved successfully')

  } catch (error) {
      console.error(error)
      if (error.status) {
      res.status(error.status).send(error.message)
    } else {
      res.status(500).send('An error occurred while attempting to save the prompt')
    }
  }
}

const updatePromptById = (db) => async (req, res) => {
  try {
    console.log("Attempting to update a prompt")

    // Validate request body
    validatePromptInputs(req.body)

    const promptsCollection = db.getCollection('imagegen-prompts')
    if (!promptsCollection) {
      return res.status(500).json({ error: 'Prompts collection does not exist in the database.' })
    }

    const promptToUpdate = await promptsCollection.findOne({ id: req.params.id })

    if (promptToUpdate) {
      // Update existing agent
      Object.assign(promptToUpdate, req.body)
      const newPromptHistory = [{
        text : req.body.prompt,
        version : 1,
        createdAt: new Date().toISOString(),
      }]
      promptToUpdate = {...promptToUpdate, prompts: newPromptHistory, name : req.body.name }
      await promptsCollection.update(promptToUpdate)

      // applying the previous actions to the database
      db.saveDatabase((err) => {
        if (err) {
          console.error("Error saving database:", err)
          return res.status(500).json({ error: 'Cant save the database' })
        } else {
          console.log("Database saved successfully")
        }
      })

      console.log(`Updated agent: ${JSON.stringify(promptToUpdate)}`)

      return res.json({ message: 'Agent updated successfully', prompt: promptToUpdate })

    } else {
      // Create new agent
      const newPrompt = { ...req.body }
      await promptsCollection.insertOne(newPrompt)
      return res.status(201).json({ message: 'Agent created successfully', prompt: newPrompt })
    }
  } catch (error) {
    console.error(error)
    if (error.status) {
      res.status(error.status).send(error.message)
    } else {
      res.status(500).send('An error occurred while attempting to update the agent')
    }
  }
}

const updatePromptByName = (db) => async (req, res) => {
  try {
    console.log("Attempting to update a prompt")

    // Validate request body
    validatePromptInputs(req.body)

    const promptsCollection = db.getCollection('imagegen-prompts')
    if (!promptsCollection) {
      return res.status(500).json({ error: 'Prompts collection does not exist in the database.' })
    }

    let promptToUpdate = await promptsCollection.findOne({ name: req.params.name })

    if (promptToUpdate) {
      // Update existing agent
      Object.assign(promptToUpdate, req.body)
      /*const newPromptHistory = promptToUpdate.prompts.map(prompt => {
        if(prompt.version === req.body.version) return ({
          text : req.body.prompt
        })
      })*/
      const newPromptHistory = [{
        text : req.body.prompt,
        version : 1,
        createdAt: new Date().toISOString(),
      }]
      promptToUpdate = {...promptToUpdate, prompts: newPromptHistory, name : req.body.name }
      await promptsCollection.update(promptToUpdate)

      // applying the previous actions to the database
      db.saveDatabase((err) => {
        if (err) {
          console.error("Error saving database:", err)
          return res.status(500).json({ error: 'Cant save the database' })
        } else {
          console.log("Database saved successfully")
        }
      })

      return res.json({ message: 'Agent updated successfully', prompt: promptToUpdate })

    } else {
      // Create new agent
      const newPrompt = { ...req.body }
      await promptsCollection.insertOne(newPrompt)
      console.log(`Created new agent: ${JSON.stringify(newPrompt)}`)

      return res.status(201).json({ message: 'Agent created successfully', prompt: newPrompt })

    }
  } catch (error) {
    console.error(error)
    if (error.status) {
      res.status(error.status).send(error.message)
    } else {
      res.status(500).send('An error occurred while attempting to update the agent')
    }
  }
}
  
const getPromptById = (db) => async (req, res) => {
  const promptId = req.params.id
  if (!promptId) return res.status(400).json({ error: 'Prompt ID is required' })

  try {
    const prompt = await db.getCollection('imagegen-prompts').get(promptId)
    if (!prompt) return res.status(404).json({ error: 'The requested prompt was not found' })

    return res.status(200).json(prompt)

  } catch (error) {
    console.error('Error fetching prompt:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const getPromptByName = (db) => async (req, res) => {
  console.log("Fetching prompt by Name.")
  const promptName = req.params.name
  if (!promptName) return res.status(400).json({ error: 'Prompt ID is required' })

  try {
    const prompt = await db.getCollection('imagegen-prompts').findOne({ name: promptName })
    if (!prompt) return res.status(404).json({ error: 'The requested prompt was not found' })

    return res.status(200).json(prompt)

  } catch (error) {
    console.error('Error fetching prompt:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllPrompts = (db) => async (req, res) => {
  try {
    console.log("Fetching prompts.")
    const prompts = db.getCollection("imagegen-prompts").find()
    const formattedPrompts = prompts.map(({ name, prompt }) => ({ name, prompt }))

    return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json(formattedPrompts)

  } catch (error) {
    console.error("Error retrieving prompts:", error)
    res.status(500).json({ message: 'An error occurred while retrieving prompts.' })
  }
}

const deletePromptById = (db) => async (req, res) => {
  const promptId = req.params.id
  if (!promptId) {
    return res.status(400).json({ error: 'Prompt ID is required' })
  }

  try {
    const collection = db.getCollection('imagegen-prompts')
    const prompt = await collection.findOne({ id: promptId })

    if (!prompt) {
      return res.status(404).json({ error: 'The requested prompt was not found' })
    }

    await collection.findAndRemove({ id: promptId })

    db.saveDatabase((err) => {
      if (err) {
          console.error("Error saving database:", err)
          return res.status(500).json({ error: 'Cannot save the database' })
      }
      console.log("Database saved successfully")

      return res.status(204).send()
        
    })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function validatePromptInputs(body) {

  if (!body || typeof body !== 'object') {
    throw createError(400, 'The request body doesn\'t contain the expected prompt data.')
  }

  const {name, prompt, version} = body

  if (!name || !prompt || !version) {
    throw createError(400, 'The request body doesn\'t contain the expected prompt data.')
  }
  if (name === "" || prompt === "") {
    throw createError(400, 'Name and prompt cannot be empty.')
  }
  if (typeof name !== "string" || name.length > 128) {
    throw createError(400, 'The name is too long (max 128 characters).')
  }
  if (typeof name !== "string" || name.length < 4) {
    throw createError(400, 'The name is too short (min 4 characters).')
  }
  if (typeof prompt !== "string" || prompt.length > 128000) { // !!! arbitrary
    throw createError(400, 'The prompt is too long (max 128000 characters).')
  }
  if (typeof version !== "number" || version > 999) {
    throw createError(400, 'Cant have more than 999 versions for a single prompt.')
  }
}

function createError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

module.exports = { savePrompt, updatePromptById, updatePromptByName, getPromptById, getPromptByName, getAllPrompts, deletePromptById }