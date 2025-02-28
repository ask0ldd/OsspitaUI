const multer = require('multer')
const path = require('path')

function initImageStorage(){
    // images
    const storage = multer.diskStorage({
        destination: determineDestination,
        filename: generateFilename
    })
    // Create upload middleware
    return multer({ storage })
}

function determineDestination(req, file, cb) {
    console.log(JSON.stringify(req.body))
    const baseDir = 'images';
    const isGenerated = file.originalname.includes('generated');
    const subDir = isGenerated ? 'generated' : '';
    cb(null, path.join(baseDir, subDir));
}

function generateFilename(req, file, cb) {
    const uniqueSuffix = Date.now()
    const extension = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${extension}`)
}

module.exports = {
    initImageStorage,
};