// isWebSearchActivated, setWebSearchActivated, activeConversationId, setActiveConversationId
// isStreaming, activeMenuItemRef, setActiveMenuItem

import { createContext, useRef, useState } from "react"

interface IStreamingContextValue {
    isStreaming : boolean
    setIsStreaming : (value: boolean) => void
    isStreamingRef : React.MutableRefObject<boolean>
}

export const StreamingContext = createContext<IStreamingContextValue | null> (null)

export function StreamingProvider({ children } : {children: React.ReactNode}) {

    const [isStreaming, _setIsStreaming] = useState<boolean>(false)
    const isStreamingRef = useRef(isStreaming)
  
    function setIsStreaming(value: boolean) {
      isStreamingRef.current = value
      _setIsStreaming(value)
    }

    return (
        <StreamingContext.Provider value={{
            isStreaming,
            setIsStreaming,
            isStreamingRef,
        }}>
            {children}
        </StreamingContext.Provider>
    )
}