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
import { useOptionsContext } from '../../hooks/context/useOptionsContext'

// export default function LeftPanel({activeConversation, setActiveConversation, setModalStatus, selectedPromptRef} : IProps){
const LeftPanel = React.memo(({dispatch, memoizedSetModalStatus, selectedPromptNameRef, forceLeftPanelRefresh} : IProps) => {

    // useEffect(() => {console.log("left panel render")})

    const { activeMode } = useOptionsContext()

    const [activeSlot, setActiveSlot] = useState<"documents" | "images">("documents")

    function isActiveModeRelatedToAgentMode(activeMode : string){
        if(activeMode == "agent") return true
        if(activeMode == "rag") return true
        if(activeMode == "web") return true
        if(activeMode == "vision") return true
        return false
    }

    return(
        <aside className="leftDrawer">
            <figure style={{cursor:'pointer'}} onClick={() => location.reload()}><span>OSSPITA FOR</span> <img src={ollama}/></figure>
            <ConversationsSlot 
                dispatch={dispatch}/>
            {isActiveModeRelatedToAgentMode(activeMode) && <DocumentsSlot 
                key={'ds' + forceLeftPanelRefresh} 
                active={activeSlot == "documents"} 
                setActiveSlot={setActiveSlot} 
                memoizedSetModalStatus={memoizedSetModalStatus}/>}
            {activeSlot == 'images' && <article style={{marginTop:'0.75rem', textAlign:'left', fontSize:'13px', lineHeight:'130%'}}>Due to a bug in Ollama, only one image can be sent to the llama-vision models. Use minicpm-v if you need to target multiple images at once.</article>}
            {isActiveModeRelatedToAgentMode(activeMode) && <ImagesSlot 
                active={activeSlot == "images"} 
                setActiveSlot={setActiveSlot}/>}
            <PromptsSlot 
                key={'pt' + forceLeftPanelRefresh} 
                selectedPromptNameRef={selectedPromptNameRef} 
                memoizedSetModalStatus={memoizedSetModalStatus}/>
        </aside>
    )
}, (prevProps, nextProps) => {
    return /*prevProps.activeConversationId === nextProps.activeConversationId && */prevProps.activeConversationStateRef.current === nextProps.activeConversationStateRef.current /*&& prevProps.isWebSearchActivated === nextProps.isWebSearchActivated */&& prevProps.forceLeftPanelRefresh === nextProps.forceLeftPanelRefresh;
})

LeftPanel.displayName = "LeftPanel"

export default LeftPanel

interface IProps{
    dispatch : React.Dispatch<TAction>
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId : string}) => void
    selectedPromptNameRef : React.MutableRefObject<string>
    activeConversationStateRef: React.MutableRefObject<IConversation>
    forceLeftPanelRefresh : number
}