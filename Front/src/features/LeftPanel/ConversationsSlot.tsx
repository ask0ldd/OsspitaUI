/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react"
import { IConversationWithId } from "../../interfaces/IConversation"
import { ChatService } from "../../services/ChatService"
import { ActionType, TAction } from "../../hooks/useActiveConversationReducer"
import { useServices } from "../../hooks/context/useServices.ts"
import DefaultSlotButtonsGroup from "./DefaultSlotButtonsGroup.tsx"
import ConversationService from "../../services/API/ConversationService.ts"
import { useOptionsContext } from "../../hooks/context/useOptionsContext.ts"

export function ConversationsSlot({dispatch} : IProps){
    
    const [conversationsListState, setConversationsListState] = useState<IConversationWithId[]>([]) 
    const [activePage, setActivePage] = useState<number>(0)
    const [targetForDeletionId, setTargetForDeletionId] = useState<number>(-1)

    const { webSearchService, chatService } = useServices()
    const { setActiveConversationId, activeConversationId } = useOptionsContext()

    const hasBeenInit = useRef(false)
    useEffect(() => {
        const fetchConversations = async () => {
            let conversations = await ConversationService.getAll()
            if (!conversations?.length && !hasBeenInit.current) {
                hasBeenInit.current = true
                await ConversationService.save({
                    name: "Base Conversation",
                    history: [],
                    lastAgentUsed: "",
                    lastModelUsed: "",
                })
                conversations = await ConversationService.getAll()
            }
            if(conversations?.length && conversations.length > 0) {
                dispatch({type : ActionType.SET_CONVERSATION, payload : conversations[0]})
                setActiveConversationId({value : conversations[0].$loki})
            }
            setConversationsListState(conversations || [])
        }
        
        try{
            if (!hasBeenInit.current) fetchConversations()
        }catch(error){
            console.error(error)
        }
    }, [])

    async function refreshConversations(){
        try{
            const conversations = await ConversationService.getAll()
            setConversationsListState(conversations || [])
        }catch(error){
            console.error(error)
        }
    }

    function closeDeletionConfirm(){
        setTargetForDeletionId(-1)
    }

    /***
    //
    // Events Handlers
    //
    ***/

    async function handleNewConversation() : Promise<void>{
        const newConversation = await ConversationService.save({
            name: "New Conversation",
            history: [],
            lastAgentUsed: "",
            lastModelUsed: "",
        })
        await refreshConversations()
        setActivePage(0)
        if(newConversation == null) return
        setActiveConversationId({value : newConversation.$loki})
        dispatch({type : ActionType.SET_CONVERSATION, payload : newConversation})
        closeDeletionConfirm()
    }

    async function handleSetActiveConversation(id : number) : Promise<void>{
        // Abort any ongoing streaming when switching conversations
        chatService.abortAgentLastRequest()
        // setIsStreaming(false)
        // setTextareaValue("")
        refreshConversations()
        const conversation = await ConversationService.getById(id)
        if(conversation == null) return
        setActiveConversationId({value : conversation.$loki})
        dispatch({type : ActionType.SET_CONVERSATION, payload : conversation})
        closeDeletionConfirm()
        // no need to set streaming to false or update the conversation 
        // cause handled by an effect reacting to the active conversation id changing
    }
    
    function handleAskForDeletion(id : number)  : void{
        setTargetForDeletionId(id)
    }

    async function handleDeleteConversation(id : number) : Promise<void>{
        try{
            // if the conversation is the active one, abort the streaming process in case it is currently active
            if(id == activeConversationId.value) {
                chatService.abortAgentLastRequest()
                webSearchService.abortLastRequest()
            }

            const conversations = await ConversationService.getAll()
            if(conversations == null) return
            if(conversations.length > 1) {
                ConversationService.deleteById(id)
                setTargetForDeletionId(-1)
                const conversations = await ConversationService.getAll()
                await refreshConversations()
                if(conversations == null) return
                setActiveConversationId({value : conversations[0].$loki})
                dispatch({type : ActionType.SET_CONVERSATION, payload : conversations[0]})
            }
            if(conversations.length == 1){
                ConversationService.deleteById(id)
                setTargetForDeletionId(-1)
                handleNewConversation()
            }
        }catch(error){
            console.error(error)
        }

        // deleting the first one and only conversation
        /*if(id == 0 && ConversationsRepository.getConversations().length < 2){
            dispatch({type : ActionType.SET_CONVERSATION, payload : {name : "New Conversation", history : [], lastAgentUsed  : "", lastModelUsed : ""}})
            ConversationsRepository.updateConversationById(0, {name  : "New Conversation", history  : [], lastAgentUsed   : "", lastModelUsed : ""})
            refreshActivePageList()
            return
        }
        // switching id from 0 to 1 and back to 0 helps refreshing the chat history
        // when deleting the very first conversation and the next one is taking its spot
        if(id == 0 && ConversationsRepository.getConversations().length > 1) setActiveConversationId({value : 1})
        ConversationsRepository.deleteConversation(id)
        setConversationsListState(await ConversationService.getAll() || [])
        setActiveConversationId({value : id > 0 ? id - 1 : 0})
        refreshActivePageList()
        setTargetForDeletionId(-1)*/
    }

    function handlePageChange(direction: 'next' | 'prev'){
        const totalPages = Math.ceil(conversationsListState.length / 3)
        if(direction === 'next'){
            setActivePage(activePage => activePage + 1 < totalPages ? activePage+1 : 0)
        }else{
            setActivePage(activePage => activePage - 1 < 0 ? totalPages - 1 : activePage - 1)
        }
    }

    function getFilteredConversations(){
        return [...conversationsListState].slice(activePage*3, activePage*3+3)
    }

    return(
        <article>
            <h3>
                CONVERSATIONS<span className='nPages' style={{color:"#232323", fontWeight:'500'}}>{getPagination()}</span>
            </h3>
            <ul style={{minHeight : '118px'}}>
                {getFilteredConversations().map((conversation, id) => 
                    conversation.$loki != activeConversationId.value ?
                    <li title={conversation.lastModelUsed || "no model assigned yet"} onClick={() => handleSetActiveConversation(conversation.$loki)} key={"conversation" + activePage*3+id} role="button">
                        {conversation.history[0]?.question.substring(0, 45) || conversation.name}
                        <svg className="arrow" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg">
                            <path fill="none" d="M1 1L5.29289 5.29289C5.68342 5.68342 5.68342 6.31658 5.29289 6.70711L1 11" stroke="#6D48C1" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </li> : 
                    <div style={{display:'flex', columnGap:'0.25rem'}} key={"conversation" + activePage*3+id}>
                        <li title={conversation.lastModelUsed || "no model assigned yet"} className="active" role="button">
                            <span>{conversation.history[0]?.question.substring(0, 45) || conversation.name}</span>
                            <button title="delete conversation" className='conversationTrashBtn' onClick={() => handleAskForDeletion(activePage*3+id)}>
                                <svg width="14" height="16" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#ffffff" d="M188 40H152V28C152 20.5739 149.05 13.452 143.799 8.20101C138.548 2.94999 131.426 0 124 0H76C68.5739 0 61.452 2.94999 56.201 8.20101C50.95 13.452 48 20.5739 48 28V40H12C8.8174 40 5.76516 41.2643 3.51472 43.5147C1.26428 45.7652 0 48.8174 0 52C0 55.1826 1.26428 58.2348 3.51472 60.4853C5.76516 62.7357 8.8174 64 12 64H16V200C16 205.304 18.1071 210.391 21.8579 214.142C25.6086 217.893 30.6957 220 36 220H164C169.304 220 174.391 217.893 178.142 214.142C181.893 210.391 184 205.304 184 200V64H188C191.183 64 194.235 62.7357 196.485 60.4853C198.736 58.2348 200 55.1826 200 52C200 48.8174 198.736 45.7652 196.485 43.5147C194.235 41.2643 191.183 40 188 40ZM72 28C72 26.9391 72.4214 25.9217 73.1716 25.1716C73.9217 24.4214 74.9391 24 76 24H124C125.061 24 126.078 24.4214 126.828 25.1716C127.579 25.9217 128 26.9391 128 28V40H72V28ZM160 196H40V64H160V196ZM88 96V160C88 163.183 86.7357 166.235 84.4853 168.485C82.2348 170.736 79.1826 172 76 172C72.8174 172 69.7652 170.736 67.5147 168.485C65.2643 166.235 64 163.183 64 160V96C64 92.8174 65.2643 89.7652 67.5147 87.5147C69.7652 85.2643 72.8174 84 76 84C79.1826 84 82.2348 85.2643 84.4853 87.5147C86.7357 89.7652 88 92.8174 88 96ZM136 96V160C136 163.183 134.736 166.235 132.485 168.485C130.235 170.736 127.183 172 124 172C120.817 172 117.765 170.736 115.515 168.485C113.264 166.235 112 163.183 112 160V96C112 92.8174 113.264 89.7652 115.515 87.5147C117.765 85.2643 120.817 84 124 84C127.183 84 130.235 85.2643 132.485 87.5147C134.736 89.7652 136 92.8174 136 96Z"/>
                                </svg>
                            </button>
                        </li>
                        {id == targetForDeletionId && <button title="confirm deletion" className="confirmDeletion" onClick={() => handleDeleteConversation(conversation.$loki)}>
                            <svg style={{transform:'translateY(-1px)'}} viewBox='0 0 100 100'>
                                <path fill="none" stroke="#ffffff" d='M 25 50 L 43 68 L 80 32'/>
                            </svg>
                        </button>}
                    </div>
                )}
                {
                    nBlankConversationSlotsNeededAsFillers() > 0 && Array(nBlankConversationSlotsNeededAsFillers()).fill("").map((el,id) => (<li className='fillerItem' key={"blank"+id}></li>))
                }
            </ul>
            <div className='buttonsContainer'>
                {/*<span className="activePage">Page {activePage+1}&nbsp;<span>/&nbsp;{Math.ceil(conversationsListState.length/3)}</span></span>*/}
                <DefaultSlotButtonsGroup handlePageChange={handlePageChange}>
                    <button title="new conversation" className="purple purpleShadow" onClick={handleNewConversation}>
                        <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                    </button>
                </DefaultSlotButtonsGroup>
            </div>
        </article>
    )

    function nBlankConversationSlotsNeededAsFillers() : number{
        if (activePage*3+3 < conversationsListState.length) return 0
        return activePage*3+3 - conversationsListState.length
    }

    function getPagination() : string{
        return `Page ${activePage+1} on ${Math.ceil(conversationsListState.length/3) || 1}`
    }

}

interface IProps{
    /*activeConversationId : number
    setActiveConversationId : ({value} : {value : number}) => void*/
    dispatch : React.Dispatch<TAction>
    // activeConversationState : IConversation
}