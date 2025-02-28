const uploadImage = (db) => async (req, res) => {
    try{
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        // generated images & vision images don't go into the same collection
        const imagesCollection = req.body?.generated && req.body?.prompt ? db.getCollection('generatedImages') : db.getCollection('images')
        if (!imagesCollection) {
            throw new Error('The images collection does not exist in the database.')
        }

        const image = req.body?.generated && req.body?.prompt ? await imagesCollection.insert({ filename : req.file.filename, prompt : req.body.prompt }) : await imagesCollection.insert({ filename : req.file.filename })

        db.saveDatabase((err) => {
            if (err) {
                console.error("Error saving database:", err)
                return res.status(500).json({ error: 'Cant save the database' })
            } else {
                console.log("Database saved successfully")
            }
        })

        res.json(image)
        // res.send('File uploaded successfully');
    }catch(error){
        console.error("The image can't be save into database :", error)
        res.status(500).json({ message: 'An error occurred while saving images.' })
    }
}

const getAllImages = (db) => async (req, res) => {
    try {
        return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json(db.getCollection("images").find())
    } catch (error) {
        console.error("Error retrieving images:", error)
        res.status(500).json({ message: 'An error occurred while retrieving images.' })
    }
}

const getAllGeneratedImages = (db) => async (req, res) => {
    try {
        return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json(db.getCollection("generatedImages").find())
    } catch (error) {
        console.error("Error retrieving images:", error)
        res.status(500).json({ message: 'An error occurred while retrieving images.' })
    }
}


const deleteImageById = (db) => async (req, res) => {
    const imageId = req.params.id
    if (!imageId) {
        return res.status(400).json({ error: 'image ID is required' })
    }
  
    try {
        const collection = db.getCollection('images')
        const image = await collection.get(imageId)
  
        if (!image) {
            return res.status(404).json({ error: 'The requested image was not found' })
        }
  
        await collection.remove(image)
  
        db.saveDatabase((err) => {
            if (err) {
                console.error("Error saving database:", err)
                return res.status(500).json({ error: 'Cannot save the database' })
            }
            console.log("Database saved successfully")
            return res.status(204).send()
        })
    } catch (error) {
        console.error('Error deleting image:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
 
module.exports = {
    getAllImages, uploadImage, deleteImageById, getAllGeneratedImages
}