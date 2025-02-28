/* eslint-disable @typescript-eslint/no-unused-vars */
import './LeftPanel3.css'
import './ImageGenLeftPanel.css'
import ollama from '../../assets/Ollama3.png'
import ComfyWorkflowsSlot from './ComfyWorkflowsSlot'
import ComfyPromptsSlot from './ComfyPromptsSlot'

function ImageGenLeftPanel({memoizedSetModalStatus, forceLeftPanelRefresh, selectedPromptNameRef} : IProps) {

    return(
        <aside key={"aside"+forceLeftPanelRefresh} className="leftDrawer">
            <figure style={{cursor:'pointer'}} onClick={() => location.reload()}><span>OSSPITA FOR</span> <img src={ollama}/></figure>
            <ComfyWorkflowsSlot/>
            <ComfyPromptsSlot memoizedSetModalStatus={memoizedSetModalStatus} selectedPromptNameRef={selectedPromptNameRef}/>
        </aside>
    )
}

export default ImageGenLeftPanel

interface IProps{
    memoizedSetModalStatus: ({ visibility, contentId }: {
        visibility: boolean;
        contentId?: string;
    }) => void
    forceLeftPanelRefresh: number
    selectedPromptNameRef: React.MutableRefObject<string>
}