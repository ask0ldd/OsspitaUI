/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import '../style/FollowUpQuestions.css'
import { ChatService } from '../services/ChatService'
import { IConversationElement } from '../interfaces/IConversation'
import React from 'react'
import { useMainTextAreaStore } from '../hooks/stores/useMainTextAreaStore'
import { useStreamingContext } from '../hooks/context/useStreamingContext'

const FollowUpQuestions = React.memo(({historyElement, selfClose, isFollowUpQuestionsClosed} : IProps) => {

    // useEffect(() => {console.log("fup questions render")})

    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])

    const { textareaRef, setTextareaValue} = useMainTextAreaStore()
    const { isStreaming } = useStreamingContext()

    function handleFollowUpQuestionClick(text : string){
        textareaRef.current?.focus()
        setTextareaValue(text)
    }

    function handleSelfCloseClick(){
        selfClose(true)
    }

    function handleRefreshFUpClick(){
        if(historyElement == null) return
        if(ChatService.isAVisionModelActive()) return
        ChatService.abortAgentLastRequest()
        generateFollowUpQuestions(historyElement.question)
    }

    useEffect(() => {
        // if(visionModelsClues.some(clue => ChatService.getActiveAgent().getModelName().toLowerCase().includes(clue))) return
        if(ChatService.isAVisionModelActive()) return
        if(historyElement?.question && historyElement.question != "" && historyElement?.context?.length && !isStreaming && !isFollowUpQuestionsClosed) {
            generateFollowUpQuestions(historyElement.question)
        }
    }, [historyElement?.context])

    async function generateFollowUpQuestions(question: string, iter: number = 0): Promise<void> {

        const prompt = 
`Ignore all previous directives. You are a state-of-the-art language model trained to adhere strongly to a specified output format.

### Directives
1. Given the following question, generate three insightful follow-up questions (max 50 words each) that explore related concepts and encourage deeper understanding. 
2. Prioritize relevance, quality, and potential for knowledge discovery in your responses.

### Output format
1. Output a single array of strings structured like this example : ["question1", "question2", "question3"].
2. Don't add any commentary or any annotation.

### Question
${question}`
    
        let response: string[] = [];
    
        try {
            if(historyElement == null) return
            const threeQuestions = await ChatService.askForFollowUpQuestions(prompt, historyElement.context || []);
            response = JSON.parse(threeQuestions);
        } catch (error) {
            console.error(error);
            if (iter + 1 > 4) {
                setFollowUpQuestions([]);
                return;
            }
            return generateFollowUpQuestions(question, iter + 1);
        }
    
        if (response?.length === 3) {
            setFollowUpQuestions(response);
        } else {
            setFollowUpQuestions([]);
        }
    }

    return (
        followUpQuestions.length > 2 && <div className="followUpQuestionsContainer">
            {followUpQuestions.map((question, id) => (
                <span className={id == 2 ? 'infoItemDisappearLowWidth' : ''} role="button" key={'fupquestion' + id} onClick={(e) => handleFollowUpQuestionClick((e.target as HTMLSpanElement).innerText)}>{question}</span>
            ))}
            <div style={{display:'flex', flexDirection:'column', rowGap:'0.75rem', justifyContent:'center'}}>
                <button title="refresh" onClick={handleRefreshFUpClick}>
                    <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/>
                    </svg>
                </button>
                <button onClick={handleSelfCloseClick}>
                    <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                </button>
            </div>
        </div>
    )
})

export default FollowUpQuestions;

interface IProps{
    historyElement : IConversationElement | undefined
    selfClose : (bool : boolean) => void
    isFollowUpQuestionsClosed : boolean
}