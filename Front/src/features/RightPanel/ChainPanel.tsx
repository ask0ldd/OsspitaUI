/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { TRightMenuOptions } from "../../interfaces/TRightMenuOptions";
import { AIAgent } from "../../models/AIAgent";
import AIAgentChain from "../../models/AIAgentChain";
import Select, { IOption } from "../CustomSelect/Select";

function ChainPanel({AIAgentsList, activeMenuItemRef, currentChain, setCurrentChain, isStreaming, memoizedSetModalStatus} : IProps){
    function handleSwitchChainAgent(option : IOption, id : string){
        setCurrentChain(chain => chain.map(link => link.selectId == id ? {selectId : link.selectId , agentName : option.value} : link))
    }

    function handleDeleteChainAgent(index : number){
        // deleting the agent & updating the selectId for each remaining agent !!! improve?!!!
        setCurrentChain(chain => [...chain.slice(0, index), ...chain.slice(index + 1)].map((link, index) => ({...link, selectId : "chainAgent" + index})))
    }

    function handleEditChainAgent(){
        memoizedSetModalStatus({visibility : true, contentId : "formSelectChainAgent"})
    }
    
    // refresh the agents within the chain in case some of them have been modified
    // when the chain tab was inactive
    useEffect(() => {
        async function refreshAgents () {
            await AIAgentChain.refreshAgents()
        }
        if(activeMenuItemRef.current == "chain") refreshAgents()
    }, [activeMenuItemRef.current])

    return (
        <article className='chainContainer'>
            <h3 onClick={handleEditChainAgent} style={{margin:'2px 0 10px 0'}}>ACTIVE CHAIN</h3>
            <p>NB : Starting with your query, each agent will process the response of its predecessor using its own system prompt. The final response will be displayed.</p>
            <div style={{width:'100%', height:'1px', borderBottom:'1px dashed #35353599', marginBottom:'1.25rem'}}></div>
            <div className="yourQuery">Your Query</div>
            <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className={isStreaming ? "fadeAnim" : ""} fillRule="evenodd" clipRule="evenodd" d="M19.6023 20.4902L10.9602 29.5816C10.4299 30.1395 9.57009 30.1395 9.03977 29.5816L0.397739 20.4902C-0.13258 19.9323 -0.13258 19.0278 0.397739 18.4699C0.928058 17.912 1.78787 17.912 2.31819 18.4699L8.64203 25.1226L8.64204 -4.96474e-07L11.358 -3.77757e-07L11.358 25.1226L17.6818 18.4699C18.2121 17.912 19.0719 17.912 19.6023 18.4699C20.1326 19.0278 20.1326 19.9323 19.6023 20.4902Z" fill="#5CC9B9"/>
            </svg>
            {currentChain.map((link, index) => (<div key={"agentArrowGroup"+index} style={{display:'flex', flexDirection:'column', width:'100%', alignItems:'center'}}>
                <div className="chainSelectDeleteContainer">
                    {/* overrideOnClickEvent={handleEditChainAgent} */}
                    <Select 
                        width="100%"
                        options={AIAgentsList.filter(agent => agent.getType() != "system" || agent.getName().includes("COTTableGenerator"))
                            .map((agent) => ({ label: agent.getName() + (agent.getType() == 'system' ? ` [ Core ]`: ""), value: agent.getName() }))} 
                        defaultOption={link.agentName}
                        id={"chainAgent" + index}
                        onValueChange={handleSwitchChainAgent}
                    />
                    {
                        !isStreaming ? <button className='purpleShadow' onClick={() => handleDeleteChainAgent(index)}>
                            <svg style={{transform:'rotateZ(45deg) scale(1.2)'}} width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#ffffff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                        </button> : 
                        <div className="lockedButton">
                            <svg width="24px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V14Z" fill="#454545"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M7 8.12037C5.3161 8.53217 4 9.95979 4 11.7692V17.3077C4 19.973 6.31545 22 9 22H15C17.6846 22 20 19.973 20 17.3077V11.7692C20 9.95979 18.6839 8.53217 17 8.12037V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V8.12037ZM15 7V8H9V7C9 6.64936 9.06015 6.31278 9.17071 6C9.58254 4.83481 10.6938 4 12 4C13.3062 4 14.4175 4.83481 14.8293 6C14.9398 6.31278 15 6.64936 15 7ZM6 11.7692C6 10.866 6.81856 10 8 10H16C17.1814 10 18 10.866 18 11.7692V17.3077C18 18.7208 16.7337 20 15 20H9C7.26627 20 6 18.7208 6 17.3077V11.7692Z" fill="#454545"/>
                            </svg>
                        </div>
                    }
                </div>
                <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path className={isStreaming ? "fadeAnim" : ""} fillRule="evenodd" clipRule="evenodd" d="M19.6023 20.4902L10.9602 29.5816C10.4299 30.1395 9.57009 30.1395 9.03977 29.5816L0.397739 20.4902C-0.13258 19.9323 -0.13258 19.0278 0.397739 18.4699C0.928058 17.912 1.78787 17.912 2.31819 18.4699L8.64203 25.1226L8.64204 -4.96474e-07L11.358 -3.77757e-07L11.358 25.1226L17.6818 18.4699C18.2121 17.912 19.0719 17.912 19.6023 18.4699C20.1326 19.0278 20.1326 19.9323 19.6023 20.4902Z" fill="#5CC9B9"/>
                </svg>
            </div>))}
            <button className='purpleShadow' onClick={() => setCurrentChain(chain => [...chain, {selectId : "chainAgent" + chain.length, agentName : "COTTableGenerator"}])}>+ Add Agent</button>
        </article>)
}

export default ChainPanel

interface IProps{
    AIAgentsList : AIAgent[]
    currentChain : {selectId : string, agentName : string}[]
    setCurrentChain : React.Dispatch<React.SetStateAction<{selectId : string, agentName : string}[]>>
    isStreaming : boolean
    activeMenuItemRef : React.MutableRefObject<TRightMenuOptions>
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
}
