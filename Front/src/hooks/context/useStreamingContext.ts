import { useContext } from "react"
import { StreamingContext } from "../../context/StreamingContext"

export const useStreamingContext = () => {
    const context = useContext(StreamingContext)
    if (!context) {
      throw new Error('useStreamingContext must be used within a StreamingProvider')
    }
    return context
}