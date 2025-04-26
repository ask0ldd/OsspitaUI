/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-irregular-whitespace */
import { useState, useEffect, useRef, useCallback } from 'react'
/*import { ComfyUIBaseWorkflow } from '../constants/ComfyUIBaseWorkflow'
import { basePreset } from '../features/CustomSelect/presets/basePreset'
import Select, { IOption } from '../features/CustomSelect/Select'*/
import ImageGenLeftPanel from '../features/LeftPanel/ImageGenLeftPanel'
import ImageGenRightPanel from '../features/RightPanel/ImageGenRightPanel'
import { useServices } from '../hooks/context/useServices'
import { TWSMessage, ExecutedMessage } from '../interfaces/TWSMessageType'
import '../style/Chat.css'
import '@xyflow/react/dist/style.css'
import '../style/ImageGen.css'
import ComfyUIWorkflowBuilder from '../utils/ComfyUIWorkflowBuilder'
import IGeneratedImage from '../interfaces/IGeneratedImage'
import ImagePreview from '../features/LeftPanel/ImagePreview'
import ErrorAlert from '../features/Modal/ErrorAlert'
import { FormPromptSettings } from '../features/Modal/FormPromptSettings'
import Modal from '../features/Modal/Modal'
import useModalManager from '../hooks/useModalManager'
import { ReactFlow, Background, BackgroundVariant, Controls, addEdge, Connection, Edge, useEdgesState, useNodesState, Node } from '@xyflow/react'
import ResultNode from '../models/nodes/flow/ResultNode'
import TextNode from '../models/nodes/flow/TextNode'
import UpperCaseNode from '../models/nodes/flow/UpperCaseNode'
import CheckpointLoaderNode from '../models/nodes/comfyFlow/CheckpointLoaderNode'
import CLIPTextEncodeNode from '../models/nodes/comfyFlow/CLIPTextEncodeNode'
import EmptyLatentImageNode from '../models/nodes/comfyFlow/EmptyLatentImageNode'
import KSamplerNode from '../models/nodes/comfyFlow/KSamplerNode'
import VAEDecodeNode from '../models/nodes/comfyFlow/VAEDecodeNode'
import OutputNode from '../models/nodes/comfyFlow/OutputNode'


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

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initEdges)

    const onConnect = useCallback(
      (connection : Connection) =>
          setEdges(eds =>
          addEdge<Edge>(connection, eds),
          ),
      [setEdges],
    );
    
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
                        borderRadius : '6px',
                        border: '1px solid #b4bddfaa',
                    }}>
                        <ReactFlow 
                            nodes={nodes} 
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            snapToGrid={true}
                            defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
                            fitView
                            attributionPosition="bottom-left"
                            style={{background:"#f1F3fa", outline:'none'}}
                        >
                            <Background color="#333" variant={BackgroundVariant.Dots} />
                            <Controls/>
                        </ReactFlow>
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

const nodeTypes = {
  text : TextNode,
  uppercase : UpperCaseNode,
  result : ResultNode,
  checkpointLoader : CheckpointLoaderNode,
  CLIPTextEncode : CLIPTextEncodeNode,
  EmptyLatentImage : EmptyLatentImageNode,
  KSampler : KSamplerNode,
  VAEDecode : VAEDecodeNode,
  Output : OutputNode,
}

export type TextNodeType = Node<{ text: string }, 'text'>;
export type ResultNodeType = Node<{text: string}, 'result'>;
export type UpperCaseNodeType = Node<{ text: string }, 'uppercase'>;
export type CheckpointLoaderNodeType = Node<{ activeCheckpoint: string }, 'checkpointLoader'>;
export type CLIPTextEncodeNodeType = Node<{prompt: string}, 'CLIPTextEncode'>;
export type EmptyLatentImageNodeType = Node<{width: number, height: number, batch_size: number}, 'EmptyLatentImage'>;
export type KSamplerNodeType = Node<{id : string}, 'KSampler'>;
export type VAEDecodeNodeType = Node<{id : string}, 'VAEDecode'>;
export type OutputNodeType = Node<{id : string}, 'Output'>;
export type MyNodeType = 
  | TextNodeType 
  | ResultNodeType 
  | UpperCaseNodeType 
  | CheckpointLoaderNodeType 
  | CLIPTextEncodeNodeType 
  | EmptyLatentImageNodeType 
  | KSamplerNodeType
  | VAEDecodeNodeType
  | OutputNodeType;

const dist = 250

const initNodes: MyNodeType[] = [
    {
      id: 'n1',
      type: 'checkpointLoader',
      data: { activeCheckpoint : 'FLUX1\\flux1-dev-fp8.safetensors'},
      position: { x: -2*dist, y: 0 },
    },
    {
      id: 'n2',
      type: 'CLIPTextEncode',
      data: { prompt : 'Beautiful scenery'},
      position : { x : -1*dist, y : 0}
    },
    {
      id: 'n2-2',
      type: 'CLIPTextEncode',
      data: { prompt : 'Text, watermark'},
      position : { x : -1*dist, y : 200}
    },
    {
      id: 'n3',
      type: 'EmptyLatentImage',
      data: { width : 512, height : 512, batch_size : 1},
      position : { x : -1*dist, y : 400}
    },
    {
      id: 'n4',
      type : 'KSampler',
      data : { id : ""},
      position : { x:150, y:0},
    },
    {
      id: 'n5',
      type : 'VAEDecode',
      data : { id : ""},
      position : { x:dist+200, y:0},
    },
    {
      id: 'n6',
      type : 'Output',
      data : { id : ""},
      position : { x:dist+380, y:0},
    },
]

const initEdges : Edge[] = [
    {
      id:'e1-2',
      source:'n1',
      target:'n2',
      sourceHandle: 'clip',
      targetHandle: 'clip',
    },
    {
      id:'e1-2-2',
      source:'n1',
      target:'n2-2',
      sourceHandle: 'clip',
      targetHandle: 'clip',
    },
    {
      id:'e2-4',
      source:'n2',
      target:'n4',
      sourceHandle: 'conditioning',
      targetHandle: 'positive',
    },
    {
      id:'e2-2-4',
      source:'n2-2',
      target:'n4',
      sourceHandle: 'conditioning',
      targetHandle: 'negative',
    },
    {
      id:'e3-4',
      source:'n3',
      target:'n4',
      sourceHandle: 'latent',
      targetHandle: 'latent_image',
    },
    {
      id:'e4-5',
      source:'n4',
      target:'n5',
      sourceHandle: 'latent',
      targetHandle: 'samples',
    },
    {
      id:'e1-4',
      source:'n1',
      target:'n4',
      sourceHandle: 'model',
      targetHandle: 'model',
    },
    {
      id:'e1-5',
      source:'n1',
      target:'n5',
      sourceHandle: 'vae',
      targetHandle: 'vae',
    },
    {
      id:'e5-6',
      source:'n5',
      target:'n6',
      sourceHandle: 'image',
      targetHandle: 'image',
    }
]

export default ImageGen