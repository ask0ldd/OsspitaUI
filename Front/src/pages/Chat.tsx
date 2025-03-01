/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatService } from "../services/ChatService";
import ChatHistory from "../features/ChatHistory/ChatHistory";
import '../style/Chat.css'
import FollowUpQuestions from "../components/FollowUpQuestions";
import CustomTextarea from "../components/CustomTextarea";
import { ActionType, useActiveConversationReducer } from "../hooks/useActiveConversationReducer";
import Modal from "../features/Modal/Modal";
import FormAgentSettings from "../features/Modal/FormAgentSettings";
import LeftPanel from "../features/LeftPanel/LeftPanel";
import RightPanel from "../features/RightPanel/RightPanel";
import LoadedModelInfosBar from "../components/LoadedModelInfosBar";
import useModalManager from "../hooks/useModalManager";
import { FormPromptSettings } from "../features/Modal/FormPromptSettings";
import { IInferenceStats } from "../interfaces/IConversation";
import ErrorAlert from "../features/Modal/ErrorAlert";
import useFetchAgentsList from "../hooks/useFetchAgentsList";
import { FormUploadFile } from "../features/Modal/FormUploadFile";
import DocService from "../services/API/DocService";
import DocProcessorService from "../services/DocProcessorService";
import IRAGChunkResponse from "../interfaces/responses/IRAGChunkResponse";
import AIAgentChain from "../models/AIAgentChain";
import AnswerFormatingService from "../services/AnswerFormatingService";
import InferenceStatsFormatingService from "../services/InferenceStatsFormatingService";
import { FormSelectChainAgent } from "../features/Modal/FormSelectChainAgent";
import { useServices } from "../hooks/useServices";
import useRightMenu from "../hooks/useRightMenu";
import { useImagesStore } from "../hooks/stores/useImagesStore";
import { useMainTextAreaStore } from "../hooks/stores/useMainTextAreaStore";
import useKeyboardListener from "../hooks/useKeyboardListener";
import { useScrollbar } from "../hooks/useScrollbar";
import ConversationService from "../services/API/ConversationService";
import ScrapedPage from "../models/ScrapedPage";
import Snackbar from "../components/Snackbar";
import FormCharacterSettings from "../features/Modal/FormCharacterSettings";
import { isAbortError } from "../utils/typeguards";
import { useOptionsContext } from "../hooks/context/useOptionsContext";
import { useStreamingContext } from "../hooks/context/useStreamingContext";

function Chat() {

    // useEffect(() => console.log("chat render"))

    useScrollbar()

    const { getSelectedImages } = useImagesStore()
    const { webSearchService, imageService } = useServices();
    const { activeConversationId, activeMode, setActiveMode } = useOptionsContext()
    const { isStreaming, setIsStreaming, isStreamingRef } = useStreamingContext()

    const { AIAgentsList, triggerAIAgentsListRefresh } = useFetchAgentsList()

    // Active Conversation Management
    // Manages the state and context of the current active conversation
    // Used for displaying chat history and handling conversation selection
    const { dispatch, activeConversationStateRef } = useActiveConversationReducer({name : "First Conversation", history : [], lastAgentUsed  : "", lastModelUsed : ""});

    // Auto-scroll Reference
    // Ref used to enable auto-scrolling feature during response streaming
    const historyContainerRef = useRef<HTMLDivElement>(null)

    // Panel Refresh Triggers
    // State variables to force re-renders left panels
    const [forceLeftPanelRefresh, setForceLeftPanelRefresh] = useState(0);

    // Main textarea management
    const { setTextareaValue, textareaRef } = useMainTextAreaStore()
    function isConversationsHistoryEmpty(){
        return !(activeConversationStateRef.current.history?.length > 0)
    }
    useKeyboardListener(textareaRef, handlePressEnterKey, activeConversationId.value, isConversationsHistoryEmpty() ? activeConversationStateRef.current.history[activeConversationStateRef.current.history.length - 1]?.context : [])

    // Modal management
    // Handles modal visibility and content switching
    const {modalVisibility, modalContentId, memoizedSetModalStatus, showErrorModal, errorMessageRef} = useModalManager({initialVisibility : false, initialModalContentId : "formAgentSettings"})

    // Ref to store the name of the selected prompt in the left panel
    // Used by the modal to populate the prompt form
    const selectedPromptNameRef = useRef("")

    // !!!ddd const {isWebSearchActivated, isWebSearchActivatedRef, setWebSearchActivated} = useWebSearchState()
    const {isWebSearchActivated, isWebSearchActivatedRef, setWebSearchActivated} = useOptionsContext()
    const [isFollowUpQuestionsClosed, setIsFollowUpQuestionsClosed] = useState<boolean>(false)

    const {activeMenuItem, setActiveMenuItem, activeMenuItemRef} = useRightMenu()

    // Handling conversation switches
    // Aborts ongoing streaming, resets UI state, and loads the selected conversation
    useEffect(() => {
        // Abort any ongoing streaming when switching conversations
        if (isStreaming) ChatService.abortAgentLastRequest()
        // Reset UI state
        setIsStreaming(false)
        setTextareaValue("")
    }, [activeConversationId])

    const lastRAGResultsRef = useRef<IRAGChunkResponse[] | null>(null)

    // !!! move to context
    useEffect(() => {
        if(activeMenuItemRef.current == "agent" && !isWebSearchActivated) {
            setActiveMode("agent")
            return
        }
        if(isWebSearchActivated && activeMenuItemRef.current == "agent") {
            setActiveMode("web")
            return
        }
        if(activeMenuItemRef.current == "chain") {
            setWebSearchActivated(false)
            setActiveMode("chain")
            return
        }
        if(activeMenuItemRef.current == "roleplay") {
            setWebSearchActivated(false)
            setActiveMode("roleplay")
            return
        }
        if(activeMenuItemRef.current == "settings") {
            setWebSearchActivated(false)
            setActiveMode("settings")
            return
        }
    }, [activeMenuItemRef.current, isWebSearchActivated])

    /***
    //
    // LLM Requests
    //
    ***/

    useEffect(() => {
        if(activeConversationStateRef.current.history[activeConversationStateRef.current.history.length-1]?.answer.asMarkdown == "") scrollToBottom();
    }, [activeConversationStateRef.current]);

    /**
     * Request a streamed response from the active chatService agent
     * @param query The user's input query
     * @returns A Promise that resolves when the streaming is complete
     */
    async function askActiveAgent_Streaming(query: string): Promise<void> {
        try {
            // Prevent empty query and multiple concurrent streams
            if (query == "" || isStreamingRef.current) return
            // if the active conversation model has been changed since the last request -> reset the context
            const currentContext = (ChatService.getActiveAgent().getModelName() != activeConversationStateRef.current.lastModelUsed) 
                ? [] : activeConversationStateRef.current.history[activeConversationStateRef.current.history.length - 1]?.context
            setIsStreaming(true)
            // Create a new blank conversation Q&A pair in the active conversation state
            dispatch({ 
                type: ActionType.NEW_BLANK_HISTORY_ELEMENT, 
                payload: { message : query, 
                agentUsed : ChatService.getActiveAgent().asString(), 
                modelUsed : ChatService.getActiveAgent().getModelName(),}
            })
            let newContext = []
            let inferenceStats : IInferenceStats
            let scrapedPages : ScrapedPage[] = []

            // Handle web search if activated, otherwise use internal knowledge
            if (isWebSearchActivatedRef.current == true && activeMenuItemRef.current == "agent") {
                // web search unavailable when a vision model is active
                if(ChatService.isAVisionModelActive()) throw new Error("Web search not available when a vision model is selected.")
                console.log("___Web Search___")
                scrapedPages = await webSearchService.scrapeRelatedDatas({query, maxPages : 3}) || (() => { throw new Error("No results found for your query") })()
                console.log("___LLM Loading___")
                // format YYYY/MM/DD
                const currentDate = "Current date : " + new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate() + ". "
                const finalDatas = await ChatService.askTheActiveAgentForAStreamedResponse({
                    question : currentDate + query, 
                    chunkProcessorCallback : onStreamedChunkReceived_Callback, 
                    context : currentContext, 
                    scrapedPages
                }) // convert to object and add : showErrorModal : (errorMessage: string) => void
                newContext = finalDatas.newContext
                inferenceStats = finalDatas.inferenceStats
                // If streaming was aborted, exit early
                if(isStreamingRef.current == false) return
                dispatch({ 
                    type: ActionType.ADD_SOURCES_TO_LAST_ANSWER, 
                    payload: scrapedPages 
                })
            } else {
                // Use internal knowledge without web search
                console.log("___LLM Loading___")

                const isVisionModelActive = ChatService.isAVisionModelActive()
                
                // If any document is selected, extract the relevant datas for RAG
                const ragContext = ChatService.getRAGTargetsFilenames().length > 0 && activeMenuItemRef.current == "agent" ? await buildRAGContext(query) : ""

                const selectedImagesAsBase64 : string[] = []
                if(isVisionModelActive != false) {
                    const selectedImages = getSelectedImages()
                    // selectedImagesAsBase64 = selectedImages.map(image => (image.data.split(',')[1]))
                    for(const image of selectedImages){
                        console.log(image.filename)
                        const imageAsB64 = await imageService.getImageAsBase64(image.filename)
                        if(imageAsB64 != null) selectedImagesAsBase64.push(imageAsB64.split(',')[1])
                    }
                    const historyImage = selectedImagesAsBase64.length > 0 
                        ? selectedImages.map(image => image.filename) 
                        : null
                    if(historyImage != null) dispatch({ type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_IMAGES, payload : historyImage })
                }
                console.log(JSON.stringify(currentContext))
                const finalDatas = await ChatService.askTheActiveAgentForAStreamedResponse(
                {
                    question : isVisionModelActive ? query : ragContext + query, 
                    chunkProcessorCallback : onStreamedChunkReceived_Callback, 
                    context : ragContext == "" ? currentContext : [], 
                    images : selectedImagesAsBase64.length > 0 ? [...selectedImagesAsBase64] : []
                    // images : selectedImage != null ? [selectedImage] : []
                })
                newContext = finalDatas.newContext
                inferenceStats = finalDatas.inferenceStats
            }

            // If streaming was aborted, exit early
            if(isStreamingRef.current == false) return
            // Update the conversation history with new context and inference stats
            dispatch({ 
                type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_CONTEXT_NSTATS, 
                payload: {newContext : newContext || [], inferenceStats} 
            })
            // Clear textarea if user hasn't modified it during streaming
            if((textareaRef.current as HTMLTextAreaElement).value == activeConversationStateRef.current.history.slice(-1)[0].question) setTextareaValue("")
            // activeConversationStateRef.current is not directly used to update the DB since this value may not be updated due to the async nature of : dispatch({ type: ActionType.UPDATE_SOURCES...
            const activeConv = {...activeConversationStateRef.current}
            if(scrapedPages.length > 0) activeConv.history[activeConv.history.length-1].sources = scrapedPages.map(page => ({asHTML : page.sourceAsHTMLSpan(), asMarkdown : page.source}))
            await ConversationService.updateById(activeConversationId.value, activeConv)
        }
        catch (error : unknown) {
            dispatch({ type: ActionType.DELETE_LAST_HISTORY_ELEMENT })

            if(isWebSearchActivatedRef.current) webSearchService.abortLastRequest()
            console.error(error)

            // Abort requests shouldn't display any error modale
            if((JSON.stringify(error)).includes("abort")) return 
            // if(error instanceof Error && (error.name === "AbortError" || error.name.includes("abort") || error.message.includes("Signal"))) return 
            if(isAbortError(error)) return

            ChatService.abortAgentLastRequest()
            showErrorModal("Stream failed. " + (error instanceof Error ? error.message : error))
        }finally{
            setIsStreaming(false)
        }
    }

    // query the active chain
    async function sendRequestThroughActiveChain(query : string): Promise<void>{
        try{
            if (query == "" || AIAgentChain.isEmpty()) return

            // used to refresh chatHistory
            setIsStreaming(true)
            
            dispatch({ 
                type: ActionType.NEW_BLANK_HISTORY_ELEMENT, 
                payload: { message : query, 
                agentUsed : AIAgentChain.getLastAgent().getName(),
                modelUsed : AIAgentChain.getLastAgent().getModelName()}
            })
            const response = await AIAgentChain.process(query) 
            if(response == null) throw new Error("The chain failed to produce a response.")
            const answerAsHTML = await AnswerFormatingService.format(response.response)
            dispatch({ type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_ANSWER, payload : {html : answerAsHTML, markdown : response.response}})
            if((textareaRef.current as HTMLTextAreaElement).value == activeConversationStateRef.current.history.slice(-1)[0].question) setTextareaValue("")
            const stats = InferenceStatsFormatingService.extractStats(response)
            dispatch({ 
                type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_CONTEXT_NSTATS, 
                payload: {newContext : [], inferenceStats: stats} 
            })
            // activeConversationStateRef.current is not directly used to update the DB since this value may not be updated due to the async nature of : dispatch({ type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_ANSWER...
            const activeConv = {...activeConversationStateRef.current}
            activeConv.history[activeConv.history.length-1].answer = {asHTML : answerAsHTML, asMarkdown : response.response}
            await ConversationService.updateById(activeConversationId.value, activeConv)
            return
        }catch(error : unknown) {
            dispatch({ type: ActionType.DELETE_LAST_HISTORY_ELEMENT })
            AIAgentChain.abortProcess()
            console.error(error)
            showErrorModal("Stream failed : " + error)
        }finally{
            setIsStreaming(false)
        }
    }

    // callback passed to the chatService so it can display the streamed answer
    function onStreamedChunkReceived_Callback({markdown , html} : {markdown : string, html : string}): void {
        dispatch({ 
            type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_ANSWER, 
            payload: { html, markdown } 
        })
    }

    // retrieve the ragDatas to pour into the context
    async function buildRAGContext(message : string) : Promise<string> {
        const RAGChunks = await DocService.getRAGResults(message, ChatService.getRAGTargetsFilenames())
        lastRAGResultsRef.current = RAGChunks
        return RAGChunks.length == 0 ? "" : DocProcessorService.formatRAGDatas(RAGChunks)
    }

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight)
    }

    // so it updates at the end of the stream, not each time a token is rendered
    // since it is passed as a prop to the answer component
    const regenerateLastAnswer = useCallback(() => {
        if(isStreamingRef.current) return
        const retrievedQuestion = activeConversationStateRef.current.history[activeConversationStateRef.current.history.length-1].question
        // ConversationsRepository.updateConversationHistoryById(activeConversationId.value, activeConversationStateRef.current.history.slice(0, -1))
        dispatch({ type: ActionType.DELETE_LAST_HISTORY_ELEMENT })
        if(activeMenuItem === "chain") return sendRequestThroughActiveChain(retrievedQuestion)
        askActiveAgent_Streaming(retrievedQuestion)
    }, [
        isStreamingRef.current
    ])

    function nanosecondsToSeconds(nanoseconds : number) {
        return nanoseconds / 1e9;
    }

    /***
    //
    // Events Handlers
    //
    ***/

    async function handlePressEnterKey(query : string) : Promise<void>{
        if(activeMenuItemRef.current == "chain") {
            await sendRequestThroughActiveChain(query)
            return
        }
        await askActiveAgent_Streaming(query)
        return
    }

    function handleAbortStreamingClick() {
        ChatService.abortAgentLastRequest()
        if(isWebSearchActivatedRef.current) webSearchService.abortLastRequest()
        AIAgentChain.abortProcess()
    }

    function handleSearchWebClick(e: React.MouseEvent<HTMLDivElement>) {
        if(activeMenuItemRef.current != "agent") return
        e.preventDefault()
        setWebSearchActivated(!isWebSearchActivatedRef.current)
    }

    function handleScrollToTopClick(){
        document.getElementById("globalContainer")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
    <div id="globalContainer" className="globalContainer">
        {/* key={"lp-" + forceLeftPanelRefresh} */}
        <LeftPanel 
            forceLeftPanelRefresh={forceLeftPanelRefresh} 
            activeConversationStateRef={activeConversationStateRef} 
            dispatch={dispatch} 
            memoizedSetModalStatus={memoizedSetModalStatus} 
            selectedPromptNameRef={selectedPromptNameRef}/>
        
        <main style={{position:'relative'}}>

            <LoadedModelInfosBar hasStreamingEnded={!isStreaming}/>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} ref={historyContainerRef}> {/* element needed for scrolling*/}
                {<ChatHistory 
                    activeConversationState={activeConversationStateRef.current} 
                    setTextareaValue={setTextareaValue} 
                    regenerateLastAnswer={regenerateLastAnswer}
                    isStreaming={isStreaming}
                />}
            </div>

            <div className="stickyBottomContainer">
                <CustomTextarea/>
                {!isFollowUpQuestionsClosed && <FollowUpQuestions historyElement={isConversationsHistoryEmpty() ? activeConversationStateRef.current.history[activeConversationStateRef.current.history.length - 1] : undefined}
                    selfClose={setIsFollowUpQuestionsClosed} isFollowUpQuestionsClosed={isFollowUpQuestionsClosed}/>}
                
                <div className="sendStatsWebSearchContainer">
                    <div title="active the web search / context length of 10000 recommended" style={{opacity : '1'}} className={isWebSearchActivated ? "searchWebCheck activated" : "searchWebCheck"} role="button" onClick={handleSearchWebClick}>
                        <span className="label">Web Search</span>
                        <div className='switchContainer' role='button'>
                            <div className={isWebSearchActivated ? 'switch active' : 'switch'}></div>
                        </div>
                    </div>
                    <div className="infosBottomContainer" onClick={() => console.log(JSON.stringify(lastRAGResultsRef.current))}>
                        <div>Model Loading : { (nanosecondsToSeconds(activeConversationStateRef.current.inferenceStats?.modelLoadingDuration ?? 0)).toFixed(2) } s</div>
                        <div className="infoItemDisappearLowWidth">Prompt : { Math.min(100, ((activeConversationStateRef.current.inferenceStats?.promptTokensEval ?? 0) / nanosecondsToSeconds((activeConversationStateRef.current.inferenceStats?.promptEvalDuration ?? 1)))).toFixed(2) } tk/s</div>
                        <div className="infoItemDisappearLowWidth">Inference : { ((activeConversationStateRef.current.inferenceStats?.tokensGenerated ?? 0) / nanosecondsToSeconds((activeConversationStateRef.current.inferenceStats?.inferenceDuration ?? 1))).toFixed(2) } tk/s</div>
                        <div>Full Process : { (nanosecondsToSeconds(activeConversationStateRef.current.inferenceStats?.wholeProcessDuration ?? 0)).toFixed(2) } s</div>
                    </div>
                    <button title="top of the page" className="goTopButton purpleShadow" onClick={handleScrollToTopClick}>
                        <svg style={{transform:'translateY(1px)'}} height="20" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M27.2975 2.5233C27.2975 3.91688 26.1678 5.04659 24.7742 5.04659H2.5233C1.12972 5.04659 0 3.91688 0 2.5233V2.5233C0 1.12972 1.12972 0 2.5233 0H24.7742C26.1678 0 27.2975 1.12972 27.2975 2.5233V2.5233ZM11.4127 8.16757C12.5843 6.996 14.4838 6.996 15.6554 8.16757L23.6272 16.1394C24.5231 17.0353 24.5231 18.4877 23.6272 19.3835V19.3835C22.7314 20.2793 21.279 20.2793 20.3832 19.3835L15.828 14.8283V29.7061C15.828 30.973 14.8009 32 13.5341 32V32C12.2672 32 11.2401 30.973 11.2401 29.7061V14.8283L6.79963 19.2688C5.9038 20.1646 4.45138 20.1646 3.55556 19.2688V19.2688C2.65973 18.373 2.65973 16.9206 3.55556 16.0247L11.4127 8.16757Z" fill="#6D48C1"/>
                        </svg>
                    </button>
                    {isStreaming ? 
                        <button title="cancel the request" className="cancelSendButton purpleShadow" onClick={handleAbortStreamingClick}>
                            <svg style={{width:'22px', flexShrink:0}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>
                        </button> : 
                        <>
                            {(activeMenuItem == "agent" || activeMenuItem == "roleplay") && <button className="sendButton purpleShadow" onClick={() => askActiveAgent_Streaming((textareaRef.current as HTMLTextAreaElement).value)}>Send</button>}
                            {activeMenuItem == "chain" && <button className="sendButton purpleShadow" onClick={() => sendRequestThroughActiveChain((textareaRef.current as HTMLTextAreaElement).value)}>Send&nbsp;<span style={{fontWeight:'400'}}>(to Chain)</span></button>}
                        </>
                    }
                </div>

            </div>
        </main>

        <RightPanel 
            memoizedSetModalStatus={memoizedSetModalStatus} 
            AIAgentsList={AIAgentsList} 
            activeMenuItemRef={activeMenuItemRef} 
            setActiveMenuItem={setActiveMenuItem}
        />
        
        {modalVisibility && 
            <Modal 
                modalVisibility={modalVisibility} 
                memoizedSetModalStatus={memoizedSetModalStatus} 
                width= { modalContentId != "formUploadFile" ? "100%" : "560px"}
            >
                {{
                    'formEditAgent' : <FormAgentSettings role={"edit"} memoizedSetModalStatus={memoizedSetModalStatus} triggerAIAgentsListRefresh={triggerAIAgentsListRefresh}/>,
                    'formEditCharacter' : <FormCharacterSettings memoizedSetModalStatus={memoizedSetModalStatus}/>,
                    'formNewAgent' : <FormAgentSettings role={"create"} memoizedSetModalStatus={memoizedSetModalStatus} triggerAIAgentsListRefresh={triggerAIAgentsListRefresh}/>,
                    'formEditPrompt' : <FormPromptSettings role={"edit"} setForceLeftPanelRefresh={setForceLeftPanelRefresh} memoizedSetModalStatus={memoizedSetModalStatus} selectedPromptNameRef={selectedPromptNameRef}/>,
                    'formNewPrompt' : <FormPromptSettings role={"create"} setForceLeftPanelRefresh={setForceLeftPanelRefresh} memoizedSetModalStatus={memoizedSetModalStatus}/>,
                    'formUploadFile' : <FormUploadFile setForceLeftPanelRefresh={setForceLeftPanelRefresh} memoizedSetModalStatus={memoizedSetModalStatus}/>,
                    'formSelectChainAgent' : <FormSelectChainAgent memoizedSetModalStatus={memoizedSetModalStatus} AIAgentsList={AIAgentsList}/>,
                    'error' : <ErrorAlert errorMessage={errorMessageRef.current}/>,
                } [modalContentId]}
            </Modal>
        }
        <Snackbar mode={activeMode}/>
    </div>
    )
}

export default Chat

/*
Valid Parameters and Values
Parameter	Description	Value Type	Example Usage
mirostat	Enable Mirostat sampling for controlling perplexity. (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)	int	mirostat 0
mirostat_eta	Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive. (Default: 0.1)	float	mirostat_eta 0.1
mirostat_tau	Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text. (Default: 5.0)	float	mirostat_tau 5.0
num_ctx	Sets the size of the context window used to generate the next token. (Default: 2048)	int	num_ctx 4096
repeat_last_n	Sets how far back for the model to look back to prevent repetition. (Default: 64, 0 = disabled, -1 = num_ctx)	int	repeat_last_n 64
repeat_penalty	Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (Default: 1.1)	float	repeat_penalty 1.1
temperature	The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)	float	temperature 0.7
seed	Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt. (Default: 0)	int	seed 42
stop	Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return. Multiple stop patterns may be set by specifying multiple separate stop parameters in a modelfile.	string	stop "AI assistant:"
tfs_z	Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting. (default: 1)	float	tfs_z 1
num_predict	Maximum number of tokens to predict when generating text. (Default: 128, -1 = infinite generation, -2 = fill context)	int	num_predict 42
top_k	Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (Default: 40)	int	top_k 40
top_p	Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)	float	top_p 0.9
min_p	Alternative to the top_p, and aims to ensure a balance of quality and variety. The parameter p represents the minimum probability for a token to be considered, relative to the probability of the most likely token. For example, with p=0.05 and the most likely token having a probability of 0.9, logits with a value less than 0.045 are filtered out. (Default: 0.0)
*/