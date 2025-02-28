/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-irregular-whitespace */
import { useState, useEffect, useRef } from 'react'
import { ComfyUIBaseWorkflow } from '../constants/ComfyUIBaseWorkflow'
import { basePreset } from '../features/CustomSelect/presets/basePreset'
import Select, { IOption } from '../features/CustomSelect/Select'
import ImageGenLeftPanel from '../features/LeftPanel/ImageGenLeftPanel'
import ImageGenRightPanel from '../features/RightPanel/ImageGenRightPanel'
import { useServices } from '../hooks/useServices'
import { TWSMessage, ExecutedMessage } from '../interfaces/TWSMessageType'
import '../style/Chat.css'
import '../style/ImageGen.css'
import ComfyUIWorkflowBuilder from '../utils/ComfyUIWorkflowBuilder'
import IGeneratedImage from '../interfaces/IGeneratedImage'
import ImagePreview from '../features/LeftPanel/ImagePreview'
import ErrorAlert from '../features/Modal/ErrorAlert'
import { FormPromptSettings } from '../features/Modal/FormPromptSettings'
import Modal from '../features/Modal/Modal'
import useModalManager from '../hooks/useModalManager'


function ImageGen(){

    const { comfyUIService, imageService } = useServices()

    const [forceLeftPanelRefresh, setForceLeftPanelRefresh] = useState(0);
    const {modalVisibility, modalContentId, memoizedSetModalStatus, showErrorModal, errorMessageRef} = useModalManager({initialVisibility : false, initialModalContentId : "formNewImageGenPrompt"})

    const [images, setImages] = useState<IGeneratedImage[]>([])
    const [hoveredImage, setHoveredImage] = useState<IGeneratedImage | null>()
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [textareaValue, setTextareaValue] = useState("")
    const [progress, setProgress] = useState(0)

    const selectedPromptNameRef = useRef("")

    useEffect(()=>{
        refreshImages()
    }, [])

    async function refreshImages(){
        const imgs = await imageService.getAllGeneratedImages()
        setImages(imgs || [])
    }

    function createImageFormData(blob : Blob, filename : string) : FormData{
        const formData = new FormData()
        formData.append("image", blob, "generated_" + filename)
        formData.append("generated", "true")
        formData.append("prompt", textareaRef.current?.value ?? "")
        return formData
    }

    async function handleClick(){
        comfyUIService.initSocket()
        comfyUIService.on("execution_start", (message : TWSMessage) => {
            setProgress(1)
        })
        comfyUIService.on("progress", (message : TWSMessage) => {
            if("data" in message && "value" in message.data && "max" in message.data){
                setProgress(Math.round(message.data.value / message.data.max * 100))
            }
        })
        comfyUIService.onWorkflowExecuted(async (message : TWSMessage) => {
            // comfyUIService.getPrompt((message as ExecutedMessage).data.prompt_id)
            const filename = (message as ExecutedMessage).data.output.images[0].filename
            const imageBlob = await comfyUIService.fetchGeneratedImage(filename)
            if(!imageBlob) return
            // const formData = createImageFormData(imageBlob, filename)
            const formData = new FormData()
            formData.append("image", imageBlob, "generated_" + filename)
            formData.append("generated", "true")
            formData.append("prompt", textareaRef.current?.value ?? "")
            await imageService.upload(formData)
            comfyUIService.disconnect()
            refreshImages()
            setProgress(0)
            setTextareaValue("")
        })
        // const workflow = new ComfyUIWorkflowBuilder().setPrompt("an abstract 3d logo rendered with cinema 4d containing a sphere and particles effects"/*"a 3d top isometric view of the eiffel tower with red grass"*/).setBatchSize(1).setResolution(256, 256).setRandomSeed().build()
        if(textareaRef.current && textareaRef.current?.value) {
            const workflow = new ComfyUIWorkflowBuilder().setPrompt(textareaRef.current.value).setBatchSize(1).setResolution(256, 256).setRandomSeed().build()
            await comfyUIService.queuePrompt(workflow.get())
        }
        // setTextareaValue("")
        // comfyUIService.WSSendWorkflow(new ComfyUIWorkflowBuilder().setPrompt("a 3d top isometric view of the eiffel tower").setResolution(512, 512).build())
        /*const img = await comfyUIService.viewImage({
            "filename": "ComfyUI_00022_.png",
            "subfolder": "",
            "type": "output"
        })
        console.log(img)*/
    }
    
    return(
        <div id="globalContainer" className="globalContainer">
            <ImageGenLeftPanel memoizedSetModalStatus={memoizedSetModalStatus} forceLeftPanelRefresh={forceLeftPanelRefresh} selectedPromptNameRef={selectedPromptNameRef}/>
            <main style={{height:'100vh', maxHeight:'100vh', overflow:'hidden'}}>
                <div className='topIGContainer'>
                    <div className='topBar' style={progress > 0 ? {border:'1px solid red'} : {}}>At the beginning of each session, loading the model can take 5 to 10 minutes. Please be patient...</div>
                </div>
                <div className='bodyTextBotBarContainer'>
                    <div id="workflowContainer" style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        flex: 1,
                        overflow: 'hidden',
                    }}>
                        <div className='workflowJSONnTitleContainer'>
                            <div className='leftTitle'>Active Workflow</div>
                            <div className='workflowJSONContainer'>
                                <pre>{JSON.stringify(ComfyUIBaseWorkflow, null, '  ')}</pre>
                            </div>
                        </div>
                        <div className='workflowTablenTitleContainer'>
                            <div className='rightTitle'>Customize Workflow (Coming Soon)</div>
                            <div className='workflowTableContainer'>
                                <Select 
                                    options={['Coming Soon', ...extractProperties(ComfyUIBaseWorkflow)].splice(0, 10).map<IOption>(prop => ({label : prop, value : prop}))} 
                                    id={'workflowSelect'} 
                                    width={"100%"}
                                    preset={{...basePreset.get(), selectBackgroundColor : '#fcfcfe'}}
                                />
                            </div>
                        </div>
                    </div>
                    <textarea ref={textareaRef} className='positivePrompt' style={{ flex: '0 0 auto'}} rows={5} onInput={(e) => setTextareaValue((e.target as HTMLTextAreaElement).value)} value={textareaValue}/>
                    <div className='progressSendContainer'>
                        <div className='progressBarContainer'>
                            <div className='progressBar' style={{width:progress+'%'}}>
                                {progress > 1 ? progress + ' %' : ''}
                            </div>
                        </div>
                        <button className="sendButton purpleShadow" onClick={handleClick}>Generate Image</button>
                    </div>
                </div>
            </main>
            <ImageGenRightPanel images={images} setHoveredImage={setHoveredImage}/>
            {hoveredImage && <ImagePreview imageSrc={'backend/images/generated/' + hoveredImage.filename}/>}
            {modalVisibility && 
                <Modal modalVisibility={modalVisibility} memoizedSetModalStatus={memoizedSetModalStatus} width= { modalContentId != "formUploadFile" ? "100%" : "560px"}>
                    {{
                        'formNewImageGenPrompt' : <FormPromptSettings role={"createImageGen"} setForceLeftPanelRefresh={setForceLeftPanelRefresh} memoizedSetModalStatus={memoizedSetModalStatus}/>,
                        'formEditImageGenPrompt' : <FormPromptSettings role={"editImageGen"} setForceLeftPanelRefresh={setForceLeftPanelRefresh} memoizedSetModalStatus={memoizedSetModalStatus} selectedPromptNameRef={selectedPromptNameRef}/>,
                        'error' : <ErrorAlert errorMessage={errorMessageRef.current}/>,
                    } [modalContentId]}
                </Modal>
            }
        </div>
    )
}

function extractProperties(obj : object, prefix = '') {
    let properties : string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      properties.push(fullKey);
      if (typeof value === 'object' && value !== null) {
        properties = properties.concat(extractProperties(value, fullKey));
      }
    }
    return properties.filter(prop => prop.includes("inputs") && !prop.includes("clip") && !endsWithNumber(prop) && !prop.endsWith("inputs"));
}

function setNestedProperty<T extends Record<string, any>>(obj: T, keys: string[], value: string): T {
    const lastKey = keys.pop()
    const target = keys.reduce((acc: any, key: string) => {
        if (!acc[key]) acc[key] = {}
        return acc[key]
    }, obj)

    if (lastKey) {
        target[lastKey] = value
    }
    return obj
}

const endsWithNumber = (text : string) => {
    return /\d$/.test(text)
}

export default ImageGen