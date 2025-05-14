/* eslint-disable @typescript-eslint/no-unused-vars */
import Select, { IOption } from "../CustomSelect/Select.tsx";
import './FormAgentSettings.css'
import useFetchModelsList from "../../hooks/useFetchModelsList.ts";
import { useEffect, useState } from "react";
import picots from '../../assets/sliderpicots.png'
import ICharacterSettings from "../../interfaces/ICharacterSettings.ts";
import useFetchCharacterSettings from "../../hooks/useFetchCharacterSettings.ts";
import { useServices } from "../../hooks/context/useServices.ts";

export default function FormCharacterSettings({memoizedSetModalStatus} : IProps){

    const modelsList = useFetchModelsList()
    const settings = useFetchCharacterSettings()
    const {characterService, chatService} = useServices()

    const [characterSettings, setCharacterSettings] = useState<ICharacterSettings>(settings)

    useEffect(() => {
        setCharacterSettings(settings)
    }, [settings])

    function handleSwitchModel(option : IOption){
        setCharacterSettings(settings => ({...settings, model : option.value}))
    }

    function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        memoizedSetModalStatus({visibility : false})
    }

    function setOptionsToActiveCharacter(){
        const agent = chatService.getActiveAgent().clone()
        agent.setNumCtx(characterSettings.num_ctx)
        agent.setModel(characterSettings.model)
        agent.setTemperature(characterSettings.temperature)
        agent.setNumPredict(characterSettings.num_predict)
        chatService.setActiveAgent(agent)
    }

    async function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        // update active agent
        setOptionsToActiveCharacter()
        // update backend settings file
        await characterService.saveSettings({...characterSettings})
        memoizedSetModalStatus({visibility : false})
    }
    
    return (
        <form className="characterForm" onSubmit={() => false}>
            <h3>CHARACTER AGENT SETTINGS</h3><div/><div/>
            <label style={{marginTop:0}} id="labelModelName" className="formLabel">Model</label>
            <div/>
            <label style={{marginTop:0}} id="labelContextSize" className="formLabel">Context Size</label>

            <Select 
                width="100%"
                options={modelsList.map((model) => ({ label: model, value: model }))} 
                defaultOption={characterSettings.model}
                labelledBy="labelModelName" 
                id="settingsSelectAgent"
                onValueChange={handleSwitchModel}
            />
            <div/>
            <div className="inputNSliderContainer">
                <input
                    aria-labelledby="labelContextSize"
                    type="number"
                    className="formInput" 
                    spellCheck="false"
                    value={characterSettings.num_ctx}
                    onChange={(e) => setCharacterSettings(settings => ({...settings, num_ctx : parseInt(e.target.value)}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider" style={{marginLeft:'180px'}}>
                                <img src={picots} alt="picots" className="sliderPicots"/>
                            </div>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'10px', fontSize:'14px'}}>
                            <span>Context Size</span><span>{characterSettings.num_ctx}</span>
                        </div>
                    </div>
                </div>
            </div>

            <label id="labelTemperature" className="formLabel">Temperature</label>
            <div/>
            <label id="labelMaxTokensPerReply" className="formLabel">Max Tokens Per Reply</label>

            <div className="inputNSliderContainer">
                <input
                aria-labelledby="labelTemperature"
                className="formInput"
                spellCheck="false"
                type="number"
                step="0.01" min="0.01" max="1" 
                value={characterSettings.temperature}
                onChange={(e) => setCharacterSettings(settings => ({...settings, temperature : parseFloat(e.target.value)}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider" style={{marginLeft:'180px'}}>
                                <img src={picots} alt="picots" className="sliderPicots"/>
                            </div>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'10px', fontSize:'14px'}}>
                            <span>Temperature</span><span>{characterSettings.temperature}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div/>
            <div className="inputNSliderContainer">
                <input 
                    aria-labelledby="labelMaxTokensPerReply"
                    spellCheck="false"
                    type="number"
                    className="formInput"
                    value={characterSettings.num_predict}
                    onChange={(e) => setCharacterSettings(settings => ({...settings, num_predict : parseInt(e.target.value)}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider" style={{marginLeft:'110px'}}>
                                <img src={picots} alt="picots" className="sliderPicots"/>
                            </div>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'10px', fontSize:'14px'}}>
                            <span>Max Tokens</span><span>{characterSettings.num_predict}</span>
                        </div>
                    </div>
                </div>
            </div>
            <hr style={{gridArea : 'advancedBar', marginTop:'2rem', marginBottom:'0.25rem', border:'none', borderBottom:'1px dashed #37373766'}}/>

            <div style={{gridArea:'y', display:'flex', columnGap:'12px', marginTop:'1rem'}}>
            </div>

            <div style={{gridArea:'z', display:'flex', columnGap:'12px', marginTop:'1rem'}}>
                <button className="cancelButton purpleShadow" onClick={(e) => handleCancelClick(e)}>Cancel</button>
                <button onClick={(e) => handleSaveClick(e)} className="saveButton purpleShadow">Save</button>
            </div>
        </form>
    )
}

interface IProps{
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
}