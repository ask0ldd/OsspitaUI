const getDefault = (db) => async (req, res) => {
  try {
    const workflow = await db.getCollection('imagegen-workflows').findOne({ name: "default" })
    if (!workflow) return res.status(404).json({ error: 'The requested workflow was not found' })

    return res.status(200).json(workflow)

  } catch (error) {
    console.error('Error fetching workflow:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const getAll = (db) => async (req, res) => {
  try {
    console.log("all")
    return res.setHeader("Access-Control-Allow-Origin", "*").status(200).json(db.getCollection("imagegen-workflows").find())
  } catch (error) {
      console.error("Error retrieving workflows:", error)
      res.status(500).json({ message: 'An error occurred while retrieving workflows.' })
  }
}

module.exports = { getDefault, getAll }