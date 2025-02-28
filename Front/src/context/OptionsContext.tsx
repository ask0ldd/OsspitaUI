// isWebSearchActivated, setWebSearchActivated, activeConversationId, setActiveConversationId
// isStreaming, activeMenuItemRef, setActiveMenuItem

import { createContext, useCallback, useRef, useState } from "react"
import { TRightMenuOptions } from "../interfaces/TRightMenuOptions"

interface IOptionsContextValue {
    isWebSearchActivated : boolean
    setWebSearchActivated : (value: boolean) => void
    isWebSearchActivatedRef : React.MutableRefObject<boolean>
    activeConversationId : { value: number }
    setActiveConversationId : React.Dispatch<React.SetStateAction<{ value: number }>>
    activeMode : TRightMenuOptions | "web" | "rag"
    setActiveMode : React.Dispatch<React.SetStateAction<TRightMenuOptions | "web" | "rag">>
    /*isStreaming : boolean
    setIsStreaming : (value: boolean) => void
    isStreamingRef : React.MutableRefObject<boolean>*/
}

export const OptionsContext = createContext<IOptionsContextValue | null> (null)

export function OptionsProvider({ children } : {children: React.ReactNode}) {
    // {value : 0} instead of a simple 0 -> replacing a {value : 0} with a {value : 0} 
    // will trigger all activeConversationId related effects
    // when replacing a 0 with a 0 won't
    // consequence : refresh the chat history when the conversation is autoswitched after a deletion
    const [activeConversationId, setActiveConversationId] = useState<{value : number}>({ value: 0 })

    const [isWebSearchActivated, _setWebSearchActivated] = useState(false)
    const isWebSearchActivatedRef = useRef<boolean>(false)

    const setWebSearchActivated = useCallback((value: boolean) => {
        isWebSearchActivatedRef.current = value
        _setWebSearchActivated(value)
    }, [])

    const [activeMode, setActiveMode] = useState<TRightMenuOptions | "web" | "rag">("agent")

    /*const [isStreaming, _setIsStreaming] = useState<boolean>(false)
    const isStreamingRef = useRef(isStreaming)
  
    function setIsStreaming(value: boolean) {
      isStreamingRef.current = value
      _setIsStreaming(value)
    }*/

    return (
        <OptionsContext.Provider value={{
            activeConversationId,
            setActiveConversationId,
            isWebSearchActivated,
            setWebSearchActivated,
            isWebSearchActivatedRef,
            activeMode, 
            setActiveMode,
            /*isStreaming,
            setIsStreaming,
            isStreamingRef,*/
        }}>
            {children}
        </OptionsContext.Provider>
    )
}