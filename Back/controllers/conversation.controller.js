const saveConversation = (db) => async (req, res) => {
    try {
        const conversationsCollection = db.getCollection('conversations')
        if (!conversationsCollection) {
          return res.status(500).json({ error: 'conversations collection does not exist in the database.' })
        }

        var conversation = await conversationsCollection.insert({
            name : req.body.name,
            history : req.body.history,
            lastAgentUsed : req.body.lastAgentUsed,
            lastModelUsed : req.body.lastModelUsed,
        })

        db.saveDatabase((err) => {
            if (err) {
                console.error("Error saving database:", err)
                return res.status(500).json({ error: 'Cant save the database' })
            } else {
                console.log("Database saved successfully")
            }
        })

        res.status(201).json(conversation)//.send('conversation saved successfully')

    } catch (error) {
        console.error(error)
        res.status(500).send('An error occurred while attempting to save the conversation')
    }
}

const updateConversationById = (db) => async (req, res) => {
    try {
        console.log("Attempting to update a conversation")
    
        const conversationsCollection = db.getCollection('conversations')
        if (!conversationsCollection) {
          return res.status(500).json({ error: 'conversations collection does not exist in the database.' })
        }
    
        const conversationToUpdate = await conversationsCollection.get(req.params.id)
    
        if (conversationToUpdate) {
          // Update existing agent
          Object.assign(conversationToUpdate, {...req.body})
          await conversationsCollection.update(conversationToUpdate)
    
          // applying the previous actions to the database
          db.saveDatabase((err) => {
            if (err) {
                console.error("Error saving database:", err)
                return res.status(500).json({ error: 'Cant save the database' })
            } else {
                console.log("Database saved successfully")
            }
          })
    
          // console.log(`Updated agent: ${JSON.stringify(conversationToUpdate)}`)

          return res.json({ message: 'Agent updated successfully', conversation: conversationToUpdate })

        } else {
          // Create new agent
          const newConversation = { ...req.body }
          await conversationsCollection.insertOne(newConversation)

          return res.status(201).json({ message: 'Agent created successfully', conversation: newConversation })

        }
      } catch (error) {
        console.error(error)
        res.status(500).send('An error occurred while attempting to update the agent')
      }
}
  
const getConversationById = (db) => async (req, res) => {
    const conversationId = req.params.id
    if (!conversationId) return res.status(400).json({ error: 'conversation ID is required' })
    try {
        const conversationsCollection = await db.getCollection('conversations')
        if (!conversationsCollection) {
            return res.status(500).json({ error: 'conversations collection does not exist in the database.' })
        }

        const conversation = await conversationsCollection.get(conversationId)
        if (!conversation) return res.status(404).json({ error: 'The requested conversation was not found' })
        // console.log(JSON.stringify(conversation))
        return res.status(200).json({...conversation})

    } catch (error) {
        console.error('Error fetching conversation:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

const getAllConversations = (db) => async (req, res) => {
    try {
        console.log("Fetching conversations.")
        const conversationsCollection = await db.getCollection('conversations')
        if (!conversationsCollection) {
            return res.status(500).json({ error: 'conversations collection does not exist in the database.' })
        }

        /*const test = await conversationsCollection.find() 

        console.log("conv start")
        console.table(test)
        console.log("conv end")*/

        const conversations = await conversationsCollection.find().reverse()

        return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json(conversations)
        
    } catch (error) {
        console.error("Error retrieving conversation:", error)
        res.status(500).json({ message: 'An error occurred while retrieving conversations.' })
    }
}

const deleteConversationById = (db) => async (req, res) => {
    const conversationId = req.params.id
    if (!conversationId) {
        return res.status(400).json({ error: 'conversation ID is required' })
    }

    try {
        const conversationsCollection = await db.getCollection('conversations')
        if (!conversationsCollection) {
            return res.status(500).json({ error: 'conversations collection does not exist in the database.' })
        }
        const conversation = await conversationsCollection.get(conversationId)

        if (!conversation) {
            return res.status(404).json({ error: 'The requested conversation was not found' })
        }

        await conversationsCollection.remove(conversation)

        db.saveDatabase((err) => {
            if (err) {
                console.error("Error saving database:", err)
                return res.status(500).json({ error: 'Cannot save the database' })
            }
            console.log("Database saved successfully")
            return res.status(204).send()
        })
    } catch (error) {
        console.error('Error deleting conversation:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

/*function createError(status, message) {
    const error = new Error(message)
    error.status = status
    return error
}*/

module.exports = { saveConversation, updateConversationById, getConversationById, getAllConversations, deleteConversationById }