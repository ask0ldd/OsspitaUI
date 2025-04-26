import { useState, useRef, useEffect } from "react";
import usePagination from "../../hooks/usePagination";
import { useServices } from "../../hooks/context/useServices";
import IPromptResponse from "../../interfaces/responses/IPromptResponse";
import DefaultSlotButtonsGroup from "./DefaultSlotButtonsGroup";

/* eslint-disable @typescript-eslint/no-unused-vars */
function ComfyPromptsSlot({memoizedSetModalStatus, selectedPromptNameRef} : IProps){

    const { imagePromptService } = useServices()

    const [promptsList, setPromptsList] = useState<IPromptResponse[]>([])

    const hasBeenInit = useRef(false)
    useEffect(() => {
        async function getWorkflows(){
            try {
                const prompts = await imagePromptService.getAll()
                setPromptsList(prompts || [])
            } catch (error) {
                console.error('Error fetching workflows list:', error)
                setPromptsList([])
            } finally{
                hasBeenInit.current = true
            }
        }

        if(hasBeenInit.current == false) getWorkflows()
    }, [hasBeenInit.current])

    const itemsPerPage = 5;

    const { handlePageChange, activePage } = usePagination(itemsPerPage, () => promptsList.length)

    function nBlankConversationSlotsNeededAsFillers() : number{
        if (activePage * itemsPerPage + itemsPerPage < promptsList.length) return 0
        return activePage * itemsPerPage + itemsPerPage - promptsList.length
    }

    function handleOpenEditPromptFormClick(promptName : string) : void {
        selectedPromptNameRef.current = promptName
        memoizedSetModalStatus({visibility : true, contentId : "formEditImageGenPrompt"})
    }

    function handleOpenNewPromptFormClick() : void {
        memoizedSetModalStatus({visibility : true, contentId : "formNewImageGenPrompt"})
    }
    
    return(
        <article style={{marginTop:'0.75rem'}}>
            <h3>
                PROMPTS<span className='nPages' style={{color:"#232323", fontWeight:'500'}}>{/*getPagination()*/}Coming Soon</span>
            </h3>
            <ul>
                {promptsList.slice(activePage * itemsPerPage, activePage * itemsPerPage + itemsPerPage).map((prompt, index) => (<li key={"prompt" + index + activePage * itemsPerPage} onClick={() => handleOpenEditPromptFormClick(prompt.name)}>{prompt.name}</li>))}
                {
                    nBlankConversationSlotsNeededAsFillers() > 0 && Array(nBlankConversationSlotsNeededAsFillers()).fill("").map((_,id) => (<li className='fillerItem' key={"blankprompt-"+id}></li>))
                }
            </ul>
            <div className='buttonsContainer'>
                {/*<span className="activePage">Page {activePage+1}&nbsp;<span>/&nbsp;{Math.ceil(promptsList.length/3)}</span></span>*/}
                <DefaultSlotButtonsGroup handlePageChange={handlePageChange}>
                    <button title="new prompt" className="purple purpleShadow" onClick={handleOpenNewPromptFormClick}>
                        <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                    </button>
                </DefaultSlotButtonsGroup>
            </div>
        </article>
    )

    function getPagination() : string{
        return `Page ${activePage+1} on ${Math.ceil(promptsList.length/3) || 1}`
    }
}

function nVignettesToFillRow(nImages : number){
    return 28 - ((nImages) % 4)
}

export default ComfyPromptsSlot

interface IProps{
    memoizedSetModalStatus: ({ visibility, contentId }: {
        visibility: boolean;
        contentId?: string;
    }) => void
    selectedPromptNameRef: React.MutableRefObject<string>
}