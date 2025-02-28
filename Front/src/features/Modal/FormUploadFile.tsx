/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState } from 'react'
import DocService from '../../services/API/DocService'
import DocProcessorService from '../../services/DocProcessorService'
import './FormUploadFile.css'
import upload from '../../assets/uploadbutton3.png'
import PDFService from '../../services/PDFService'
import XLSXService from '../../services/XLSXService'

export function FormUploadFile({memoizedSetModalStatus, setForceLeftPanelRefresh} : IProps){

    const [progress, setProgress] = useState(0)
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
        const textEmbeddings : {text : string, embedding : number[]}[] = []
        for(const chunk of textChunks) {
            const chunkEmbeddings = await DocProcessorService.getEmbeddingsForChunk(chunk)
            textEmbeddings.push({...chunkEmbeddings})
            // update progress bar
            setProgress(Math.floor(textEmbeddings.reduce((acc, chunk) => chunk.text.length + acc, 0) / correctedFilesize * 100))
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

        if (event.type === "loadstart") setProgress(1)
    }

    function addFileReaderListeners(reader : FileReader, filename : string, filesize : number) : void {
        reader.addEventListener("loadstart", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("load", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("loadend", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("progress", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("error", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
        reader.addEventListener("abort", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize))
    }

    async function handleFileSelect(e : React.ChangeEvent<HTMLInputElement>){
        try{
            if (!e.target.files || e.target.files.length === 0) return
            const file = e.target.files[0]

            const allowTypes = ["text/plain", "text/markdown", "application/pdf", /*"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",*/]
            if (!allowTypes.includes(file.type)) throw new Error("Unsupported file type.")

            setProcessedFile({name : file.name, size : file.size })

            switch (file.type) {
                case "application/pdf":
                    new PDFService().convertToText(file)
                        .then(async (pdfAsText) => await processFile({ filename: file.name, content: pdfAsText, filesize: file.size }))
                        .catch((error) => {throw error});
                    break;
            
                case "text/plain":
                case "text/markdown":
                    { 
                        const reader = new FileReader();
                        addFileReaderListeners(reader, file.name, file.size);
                        reader.readAsText(file); // Or use readAsArrayBuffer(file) for binary files
                        const events = ["loadstart", "load", "loadend", "progress", "error", "abort"];
                        events.forEach(eventType => {
                            reader.removeEventListener(eventType, (e) => handleEvent(e as ProgressEvent<FileReader>, file.name, file.size));
                        });
                        break; 
                    }
                
                case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
                case "application/msexcel" :
                case "application/x-msexcel" :
                case "application/x-ms-excel" :
                case "application/x-excel" :
                case "application/x-dos_ms_excel" :
                case "application/xls" :
                case "application/x-xls" :
                    {
                        const reader = new FileReader()
                        reader.onloadend = function(event : ProgressEvent<FileReader>) {
                            const data = new Uint8Array(event.target?.result as ArrayBuffer)
                            const sheet = new XLSXService().parseToString(data)
                            processFile({filename : file.name, content : sheet, filesize : file.size})
                            console.log(sheet)
                        }
                        reader.onloadstart = () => setProgress(1)
                        reader.readAsArrayBuffer(file);
                        break;
                    }
            
                default:
                    // Handle any other file types or add a default behavior
                    console.error("Unsupported file type.");
                    break;
            }
        }catch(e){
            console.error(e)
            // !!! should open an error modale or display a message within the current modale
        }
    }

    function handleUploadContainerClick(e : React.MouseEvent){
        e.preventDefault()
        e.stopPropagation()
        fileInputRef.current?.click()
    }

    function handleFileDrop(e : React.DragEvent){
        e.preventDefault()
        e.stopPropagation()
        const file = e.dataTransfer.files[0];
  
        if (fileInputRef.current) {
            // create a new fileList containing the droped file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            // assign it to the fileInput
            fileInputRef.current.files = dataTransfer.files;
            
            // trigger the change event
            const changeEvent = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(changeEvent);
        }
    }

    function handleDragOver(e : React.DragEvent){
        e.preventDefault()
        e.stopPropagation()
    }

    return(
    <div className="formUploadFileContainer">
        <form className='fileUploadForm'>
            <h3>UPLOAD A DOCUMENT</h3>
            <p style={{fontSize:'14px', marginTop:'0.5rem'}}>Supported file formats : txt, pdf, markdown.</p>
            {!processedFile && <div className='uploadImageNTextContainer' onClick={handleUploadContainerClick} onDrop={handleFileDrop} onDragOver={handleDragOver}>
                <div className='imageContainer'>
                    <img className='purpleShadow' style={{width:'40px', cursor:'pointer'}} src={upload}/>
                </div>
                <h4 style={{fontSize:'16px', fontWeight:'500', marginTop:'1.5rem'}}><span>Click to upload</span> or drag & drop.</h4>
                <p style={{marginTop:'0.30rem'}}> Maximum file size : 25MB.</p>
            </div>}
            <input ref={fileInputRef} onChange={handleFileSelect} type="file" id="fileInput" style={{display: 'none'}}/>
            {processedFile && <article className='fileRow'>
                <div style={{width:'100%', display:'flex'}}>
                    <span className='filename'>{processedFile.name}</span>
                    <span style={{marginLeft:'auto', fontSize:'14px'}}>{
                        // so that the approximation don't get past the max file size
                        Math.floor(processedFile.size/1000*progress/100) < Math.floor(processedFile.size/1024) ? 
                            Math.floor(processedFile.size/1000*progress/100) + '/' + Math.floor(processedFile.size/1024) + 'KB' : 
                            Math.floor(processedFile.size/1024) + '/' + Math.floor(processedFile.size/1024) + 'KB'}
                    </span>
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