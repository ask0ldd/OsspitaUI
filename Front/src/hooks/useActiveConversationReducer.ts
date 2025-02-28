/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useReducer } from "react"
import { IConversation, IConversationElement, IInferenceStats } from "../interfaces/IConversation"
import ScrapedPage from "../models/ScrapedPage"

// deal with everything related to the active conversation
export function useActiveConversationReducer({name, history, lastAgentUsed, lastModelUsed} : IConversation) {

    const activeConversationStateRef = useRef<IConversation>({name : name, history : history, lastAgentUsed  : lastAgentUsed, lastModelUsed : lastModelUsed}) 
    // {value : 0} instead of a simple 0 -> replacing a {value : 0} with a {value : 0} 
    // will trigger all activeConversationId related effects
    // when replacing a 0 with a 0 won't
    // consequence : refresh the chat history when the conversation is autoswitched after a deletion
    // const [activeConversationId, setActiveConversationId] = useState<{value : number}>({ value: 0 })


    // now.toISOString()
    function conversationReducer(state : IConversation, action : TAction){
        switch(action.type){
            case ActionType.NEW_BLANK_HISTORY_ELEMENT : {
                const newState = {...state, 
                    history : [...state.history, {
                        question : action.payload.message, 
                        answer : {asMarkdown : "", asHTML : ""}, 
                        context : [],
                        sources : [],
                        images : [],                        
                        date : new Date().toISOString(),
                }]}
                newState.lastAgentUsed = action.payload.agentUsed
                newState.lastModelUsed = action.payload.modelUsed
                activeConversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.UPDATE_LAST_HISTORY_ELEMENT_ANSWER : {
                const newState = {...state, 
                    history : [...state.history]
                }
                const historyId = newState.history.length - 1
                newState.history[historyId].answer = {asHTML : action.payload.html, asMarkdown : action.payload.markdown}
                activeConversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.UPDATE_LAST_HISTORY_ELEMENT_CONTEXT : {
                const newState = {...state, 
                    history : [...state.history]
                }
                const historyId = newState.history.length -1
                newState.history[historyId].context = [...action.payload]
                activeConversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.UPDATE_LAST_HISTORY_ELEMENT_IMAGES : {
                const newState = {...state, 
                    history : [...state.history]
                }
                const historyId = newState.history.length -1
                newState.history[historyId].images = [...action.payload]
                activeConversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.UPDATE_LAST_HISTORY_ELEMENT_CONTEXT_NSTATS : {
                const newState = {...state, 
                    history : [...state.history]
                }
                const historyId = newState.history.length -1
                newState.history[historyId].context = [...action.payload.newContext]
                newState.inferenceStats = {...action.payload.inferenceStats}
                activeConversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.PUSH_NEW_HISTORY_ELEMENT : {
                const newState = {...state, 
                    history : [...state.history, {
                        question : action.payload.question, 
                        answer : {asMarkdown : action.payload.answer.asMarkdown, asHTML : action.payload.answer.asHTML}, 
                        context : action.payload.context,
                        sources : [],
                        images : [],
                        date : new Date().toISOString(),
                    }]
                }
                activeConversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.SET_CONVERSATION : {
                activeConversationStateRef.current = {...action.payload}
                return {...action.payload}
            }

            case ActionType.DELETE_LAST_HISTORY_ELEMENT : {
                if(state.history.length < 1 ) return {...state}
                const newState = {...state, 
                    history : [...state.history].slice(0, -1)
                }
                activeConversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.ADD_SOURCES_TO_LAST_ANSWER : {
                const newState = {...state}
                newState.history[newState.history.length -1].sources = [...action.payload].map((page) => (
                    {
                        asMarkdown : page.source, 
                        asHTML : page.sourceAsHTMLSpan(),
                    }))
                activeConversationStateRef.current = {...newState}
                return {...newState}
            }
            
            default : return {...state}
        }
    }

    const [activeConversationState, dispatch] = useReducer(conversationReducer, {name : name, history : history, lastAgentUsed : lastAgentUsed, lastModelUsed : lastModelUsed})

    return {activeConversationState, dispatch, activeConversationStateRef/*, activeConversationId, setActiveConversationId*/}
}

export type reducerDispatchType = React.Dispatch<{type: string, payload: any}>

export enum ActionType {
    NEW_BLANK_HISTORY_ELEMENT = "NEW_BLANK_HISTORY_ELEMENT",
    UPDATE_LAST_HISTORY_ELEMENT_ANSWER = "UPDATE_LAST_HISTORY_ANSWER",
    PUSH_NEW_HISTORY_ELEMENT = "PUSHNEWHISTORYELEMENT",
    SET_CONVERSATION = "SET_CONVERSATION",
    UPDATE_LAST_HISTORY_ELEMENT_CONTEXT = "UPDATE_LAST_HISTORY_CONTEXT",
    UPDATE_LAST_HISTORY_ELEMENT_IMAGES = "UPDATE_LAST_HISTORY_ELEMENT_IMAGES",
    UPDATE_LAST_HISTORY_ELEMENT_CONTEXT_NSTATS = "UPDATE_LAST_HISTORY_CONTEXT_NSTATS",
    DELETE_LAST_HISTORY_ELEMENT = "DELETE_LAST_HISTORY_ELEMENT",
    ADD_SOURCES_TO_LAST_ANSWER = "ADD_SOURCES_TO_LAST_ANSWER",
}

export type TAction = 
    | { type: ActionType.NEW_BLANK_HISTORY_ELEMENT; payload: {message : string, agentUsed : string, modelUsed : string } }
    | { type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_ANSWER; payload: { html : string, markdown : string } }
    | { type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_CONTEXT; payload: number[] }
    | { type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_IMAGES; payload: string[] }
    | { type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_CONTEXT_NSTATS; payload: { newContext : number[], inferenceStats : IInferenceStats} }
    | { type: ActionType.PUSH_NEW_HISTORY_ELEMENT; payload: IConversationElement }
    | { type: ActionType.SET_CONVERSATION; payload: IConversation }
    | { type: ActionType.DELETE_LAST_HISTORY_ELEMENT }
    | { type: ActionType.ADD_SOURCES_TO_LAST_ANSWER; payload: ScrapedPage[] }
    ;