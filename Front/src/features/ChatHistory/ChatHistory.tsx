/* eslint-disable @typescript-eslint/no-unused-vars */
import AnswerRow from "./AnswerRow"
import QuestionRow from "./QuestionRow"
import '../../style/ChatHistory.css'
import { useEffect, useRef } from "react"
import { IConversation } from "../../interfaces/IConversation"
import React from "react"
import { useServices } from "../../hooks/useServices.ts"

const ChatHistory = React.memo(({activeConversationState, setTextareaValue, regenerateLastAnswer, isStreaming} : IProps) => {

  // useEffect(() => console.log("chat history render"))

  const historyContainerRef = useRef(null)
  const autoScrollingObsRef = useRef<MutationObserver>()

  // const TTS = useTTS()

  const { ttsService } = useServices()

  // setting up an observer that keep scrolling to the bottom of the chat window
  // when some new streamed text is added to the conversation
  useEffect(() => {
    if(isStreaming == false) return
    if(historyContainerRef.current == null) return
    if(!autoScrollingObsRef.current) 
    {
        autoScrollingObsRef.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if(historyContainerRef.current != null && (mutation.type === 'childList' || mutation.type === 'attributes')) 
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'smooth'
            })
        })
      })
      autoScrollingObsRef.current.observe(historyContainerRef.current, { attributes : true, childList: true, subtree: true })
    }

    return () => {
      if(autoScrollingObsRef.current) autoScrollingObsRef.current.disconnect()
      autoScrollingObsRef.current = undefined
    }
  }, [isStreaming])

  // interrupts the autoscrolling if the mousewheel is used
  useEffect(() => {
    function disconnectObserver(e: WheelEvent) {
      if(autoScrollingObsRef.current && e.deltaY < 0) {
        autoScrollingObsRef.current.disconnect()
        autoScrollingObsRef.current = undefined
      }
    }
    document.addEventListener('wheel', disconnectObserver)

    return () => {
      document.removeEventListener('wheel', disconnectObserver)
    }
  }, [autoScrollingObsRef])

  /***
  //
  // Events Handlers
  //
  ***/

  function handleDownloadAsFile(text : string) : void {
    const blob = new Blob([text], {type: "text/plain;charset=utf-8"})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = "myfile.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function handleCopyToClipboard(text : string) : Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  function handleModifyQuestion(text : string){
    setTextareaValue(text)
  }

  return (
    <section ref={historyContainerRef} className="chatHistorySection">
        {activeConversationState.history?.length == 0 && 
          <div style={{padding: '2rem 0', background:'#f7f9fd', display:"flex", flexDirection:"column", justifyContent: "center"}}>
            <span>Warning : Due to some Ollama limitations, switching model during a conversation will flush the context.</span>
            <span style={{marginTop:'0.75rem'}}>Agents can be switched with no consequences as long as each of them use the same model.</span>
          </div>
        }
        {
          activeConversationState.history?.map((item, index, array) => (
            <article key={'historyItem'+index}>
              <QuestionRow key={'questionRow' + index} question={item.question} onModify={handleModifyQuestion} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index}/>
              {(index == (array.length -1)) ? 
              <AnswerRow isStreaming={isStreaming} TTS={ttsService} key={'answerRow' + index} answer={item.answer} onRegenerate={regenerateLastAnswer} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index} sources={item.sources} images={item.images}/>
              : <AnswerRow isStreaming={isStreaming} TTS={ttsService} key={'answerRow' + index} answer={item.answer} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index} sources={item.sources} images={item.images}/>}
            </article>
          ))
        }
        {activeConversationState.history?.length > 0 && <div className="modelDateContainer">{activeConversationState.lastModelUsed} / {formatToUSDateTime(activeConversationState.history[activeConversationState.history.length-1].date)}</div>}
    </section>
  )

  function formatToUSDateTime(isoString : string) : string {
    const date = new Date(isoString);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'America/New_York',
      hour12: true
    };
  
    return date.toLocaleString('en-US', options);
  }
  
}, (prevProps, nextProps) => {
  //if(prevProps.activeConversationId !== nextProps.activeConversationId) return false
  if(prevProps.activeConversationState.history.length !== nextProps.activeConversationState.history.length) return false
  if(JSON.stringify(prevProps.activeConversationState.history) != JSON.stringify(nextProps.activeConversationState.history)) return false
  // refresh when isStreaming is equal to true and props changes
  if(prevProps.regenerateLastAnswer != nextProps.regenerateLastAnswer) return false
  // refresh when isStreaming is equal to true and props changes
  if(prevProps.isStreaming == true) return false
  // refresh when isStreaming changes
  return prevProps.isStreaming === nextProps.isStreaming
})

export default ChatHistory

interface IProps{
  activeConversationState : IConversation
  setTextareaValue : (text : string) => void
  regenerateLastAnswer : () => void
  isStreaming : boolean
}