/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState } from 'react'
import DocService from '../../services/API/DocService'
import DocProcessorService from '../../services/DocProcessorService'
import './FormUploadFile.css'
import upload from '../../assets/uploadbutton3.png'
import pdfToText from "react-pdftotext";

export function FormUploadFile({memoizedSetModalStatus, setForceLeftPanelRefresh} : IProps){

    const [progress, SetProgress] = useState(0)
    const [processedFile, setProcessedFile] = useState<{name : string, size : number} | null>(null)

    const fileInputRef = useRef<HTMLInputElement | null>(null)
   
    function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        memoizedSetModalStatus({visibility : false})
    }

    async function processFile({filename, content, filesize}: {filename : string, content : string, filesize : number}) {
        const correctedFilesize = filesize * 1000 / 1100 // taking into account the fact that some spaces are lost
        // file splitting then embedding each chunk of text
        const textChunks = DocProcessorService.splitTextIntoChunks(content, 600)
        const textEmbeddings : {text : string, embeddings : number[]}[] = []
        for(const chunk of textChunks) {
            const chunkEmbeddings = await DocProcessorService.getEmbeddingsForChunk(chunk)
            textEmbeddings.push({...chunkEmbeddings})
            // update progress bar
            SetProgress(Math.floor(textEmbeddings.reduce((acc, chunk) => chunk.text.length + acc, 0) / correctedFilesize * 100))
        }
        // add metadatas to each embedding chunk
        await DocService.saveDocWithEmbeddings(textEmbeddings.map((chunkEmbedding) => (
            {...chunkEmbedding, metadatas : {filename, filesize}}
        )))
        setForceLeftPanelRefresh(prevValue => prevValue + 1)
        memoizedSetModalStatus({visibility : false})
    }

    function handleEvent(event: ProgressEvent<FileReader>, filename: string, filesize : number) {    
        if (event.type === "loadend") {
            const result = event.target?.result
            if (typeof result === "string") {
                processFile({ filename: filename, content: result, filesize : filesize })
            }
        }
    }

    function addFileReaderListeners(reader : FileReader, filename : string, filesize : number) : void {
        reader.addEventListener("loadstart", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("load", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("loadend", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("progress", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("error", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("abort", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
    }

    // !!! add check file format
    async function handleFileSelect(e : React.ChangeEvent<HTMLInputElement>){
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]

        const allowTypes = ["text/plain", "text/markdown", "application/pdf"]
        if (!allowTypes.includes(file.type)) return // !!! should display error message

        setProcessedFile({name : file.name, size : file.size })

        if(file.type == "application/pdf"){
            pdfToText(file)
            .then(async (pdfAsText) => await processFile({ filename: file.name, content:pdfAsText, filesize : file.size }))
            .catch((error) => console.error("Failed to extract text from pdf"))
        }

        if(file.type == "text/plain" || file.type == "text/markdown"){
            const reader = new FileReader()
            addFileReaderListeners(reader, file.name, file.size)
            reader.readAsText(file) // Or use readAsArrayBuffer(file) for binary files
            const events = ["loadstart", "load", "loadend", "progress", "error", "abort"]
            events.forEach(eventType => {
                reader.removeEventListener(eventType, (e) => handleEvent(e as ProgressEvent<FileReader>, file.name, file.size))
            })
        }

        // setProcessedFile(null)
    }

    function handleImageClick(e : React.MouseEvent){
        e.preventDefault()
        fileInputRef.current?.click()
    }

    return(
    <div className="formUploadFileContainer">
        <form className='fileUploadForm'>
            <h3>UPLOAD A DOCUMENT</h3>
            <p style={{fontSize:'14px', marginTop:'0.5rem'}}>Supported file formats : txt, pdf, markdown.</p>
            <div className='uploadImageNTextContainer' onClick={handleImageClick}>
                {/*<img style={{width:'60px', cursor:'pointer'}} src={upload} onClick={handleImageClick}/>*/}
                <div className='imageContainer'>
                    <img className='purpleShadow' style={{width:'40px', cursor:'pointer'}} src={upload} onClick={handleImageClick}/>
                </div>
                {/*<svg style={{width:'40px', cursor:'pointer'}} xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 441 512.02">
                    <path d="M324.87 279.77c32.01 0 61.01 13.01 82.03 34.02 21.09 21 34.1 50.05 34.1 82.1 0 32.06-13.01 61.11-34.02 82.11l-1.32 1.22c-20.92 20.29-49.41 32.8-80.79 32.8-32.06 0-61.1-13.01-82.1-34.02-21.01-21-34.02-50.05-34.02-82.11s13.01-61.1 34.02-82.1c21-21.01 50.04-34.02 82.1-34.02zM243.11 38.08v54.18c.99 12.93 5.5 23.09 13.42 29.85 8.2 7.01 20.46 10.94 36.69 11.23l37.92-.04-88.03-95.22zm91.21 120.49-41.3-.04c-22.49-.35-40.21-6.4-52.9-17.24-13.23-11.31-20.68-27.35-22.19-47.23l-.11-1.74V25.29H62.87c-10.34 0-19.75 4.23-26.55 11.03-6.8 6.8-11.03 16.21-11.03 26.55v336.49c0 10.3 4.25 19.71 11.06 26.52 6.8 6.8 16.22 11.05 26.52 11.05h119.41c2.54 8.79 5.87 17.25 9.92 25.29H62.87c-17.28 0-33.02-7.08-44.41-18.46C7.08 432.37 0 416.64 0 399.36V62.87c0-17.26 7.08-32.98 18.45-44.36C29.89 7.08 45.61 0 62.87 0h173.88c4.11 0 7.76 1.96 10.07 5l109.39 118.34c2.24 2.43 3.34 5.49 3.34 8.55l.03 119.72c-8.18-1.97-16.62-3.25-25.26-3.79v-89.25zm-229.76 54.49c-6.98 0-12.64-5.66-12.64-12.64 0-6.99 5.66-12.65 12.64-12.65h150.49c6.98 0 12.65 5.66 12.65 12.65 0 6.98-5.67 12.64-12.65 12.64H104.56zm0 72.3c-6.98 0-12.64-5.66-12.64-12.65 0-6.98 5.66-12.64 12.64-12.64h142.52c3.71 0 7.05 1.6 9.37 4.15a149.03 149.03 0 0 0-30.54 21.14H104.56zm0 72.3c-6.98 0-12.64-5.66-12.64-12.65 0-6.98 5.66-12.64 12.64-12.64h86.2c-3.82 8.05-6.95 16.51-9.29 25.29h-76.91zm264.81 47.03c3.56-.14 6.09-1.33 7.54-3.55 3.98-5.94-1.44-11.81-5.19-15.94l-40.04-40.71c-4.32-4.26-9.32-4.31-13.64 0l-41.01 41.82c-3.51 3.96-7.86 9.36-4.19 14.83 1.49 2.22 4 3.41 7.56 3.55h19.74v30.69c0 5.84 4.81 10.69 10.7 10.69h28.06c5.9 0 10.71-4.81 10.71-10.69v-30.69h19.76z"/>
                </svg>*/}
                <h4 style={{fontSize:'16px', fontWeight:'500', marginTop:'1.5rem'}}><span>Click to upload</span> or drag & drop.</h4>
                <p style={{marginTop:'0.30rem'}}> Maximum file size : 25MB.</p>
            </div>
            <input ref={fileInputRef} onChange={handleFileSelect} type="file" id="fileInput" style={{display: 'none'}}/>
            {processedFile && <article className='fileRow'>
                <div style={{width:'100%', display:'flex'}}>
                    <span className='filename'>{processedFile.name}</span>
                    <span style={{marginLeft:'auto', fontSize:'14px'}}>{Math.floor(processedFile.size/1000*progress/100) + '/' + Math.floor(processedFile.size/1024) + 'KB'}</span>
                </div>
                <div className='progressBarContainer'>
                    <div className='progressBar' style={{width : progress+'%'}}></div>
                </div>
            </article>}
            <div style={{display:'flex', columnGap:'12px', marginTop:'24px', width:'100%', justifySelf:'flex-end'}}>
                <button style={{width:'50%', margin:'0 auto'}} onClick={handleCancelClick} className="cancel-button purpleShadow">Close</button>
            </div>
        </form>
    </div>
    )
}

interface IProps{
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
    setForceLeftPanelRefresh : React.Dispatch<React.SetStateAction<number>>
}