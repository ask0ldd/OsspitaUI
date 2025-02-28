export default interface IEmbedChunkedDoc{
    text : string
    embedding : number[]
    metadatas : IDocMetadatas
}

interface IDocMetadatas {
    filename : string
    filesize : number
}