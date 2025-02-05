/* eslint-disable @typescript-eslint/no-unused-vars */
import './LeftPanel3.css'
import ollama from '../../assets/Ollama3.png'
import DocumentsSlot from './DocumentsSlot'
import { ConversationsSlot } from './ConversationsSlot'
import { PromptsSlot } from './PromptsSlot'
import React, { useState } from 'react'
import { IConversation } from '../../interfaces/IConversation'
import { TAction } from '../../hooks/useActiveConversationReducer'
import ImagesSlot from './ImagesSlot'

// export default function LeftPanel({activeConversation, setActiveConversation, setModalStatus, selectedPromptRef} : IProps){
const LeftPanel = React.memo(({isWebSearchActivated, setWebSearchActivated, activeConversationId, setActiveConversationId, dispatch, memoizedSetModalStatus, selectedPromptNameRef, forceLeftPanelRefresh} : IProps) => {

    // useEffect(() => {console.log("left panel render")})

    const [activeSlot, setActiveSlot] = useState<"documents" | "images">("documents")

    return(
        <aside className="leftDrawer">
            <figure style={{cursor:'pointer'}} onClick={() => location.reload()}><span>OSSPITA FOR</span> <img src={ollama}/></figure>
            <ConversationsSlot activeConversationId={activeConversationId} setActiveConversationId={setActiveConversationId} dispatch={dispatch}/>
            <DocumentsSlot key={'ds' + forceLeftPanelRefresh} active={activeSlot == "documents"} setActiveSlot={setActiveSlot} isWebSearchActivated={isWebSearchActivated} setWebSearchActivated={setWebSearchActivated} memoizedSetModalStatus={memoizedSetModalStatus}/>
            {activeSlot == 'images' && <article style={{marginTop:'0.75rem', textAlign:'left', fontSize:'13px', lineHeight:'130%'}}>Due to a bug in Ollama, only one image can be sent to the llama-vision models. Use minicpm-v if you need to target multiple images at once.</article>}
            <ImagesSlot active={activeSlot == "images"} setActiveSlot={setActiveSlot} isWebSearchActivated={isWebSearchActivated} setWebSearchActivated={setWebSearchActivated}/>
            <PromptsSlot key={'pt' + forceLeftPanelRefresh} selectedPromptNameRef={selectedPromptNameRef} memoizedSetModalStatus={memoizedSetModalStatus}/>
        </aside>
    )
}, (prevProps, nextProps) => {
    return prevProps.activeConversationId === nextProps.activeConversationId && prevProps.activeConversationStateRef.current === nextProps.activeConversationStateRef.current && prevProps.isWebSearchActivated === nextProps.isWebSearchActivated && prevProps.forceLeftPanelRefresh === nextProps.forceLeftPanelRefresh;
})

export default LeftPanel

interface IProps{
    activeConversationId : number
    setActiveConversationId : ({value} : {value : number}) => void
    dispatch : React.Dispatch<TAction>
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId : string}) => void
    selectedPromptNameRef : React.MutableRefObject<string>
    activeConversationStateRef: React.MutableRefObject<IConversation>
    isWebSearchActivated : boolean
    setWebSearchActivated: (value: boolean) => void
    forceLeftPanelRefresh : number
}