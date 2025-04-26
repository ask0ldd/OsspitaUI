/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Select, { IOption } from "../features/CustomSelect/Select";
import useFetchModelsList from "../hooks/useFetchModelsList.ts";
import '../style/Installation.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react";
import useFetchAgentsList from "../hooks/useFetchAgentsList.ts";
import { useServices } from "../hooks/context/useServices.ts";

export default function Installation(){

    const navigate = useNavigate()
    const { agentService, characterService } = useServices();
    const modelsList = useFetchModelsList("includes-embedding-models")
    const { AIAgentsList } = useFetchAgentsList()

    const [visibleSection, setVisibleSection] = useState(0)

    const [selectedStep2Model, setSelectedStep2Model] = useState("aya-expanse:8b")
    const [selectedModels, setSelectedModels] = useState({complex : "", trivial : "", embedding : "nomic-embed-text:v1.5"})
    useEffect(() => {
        setSelectedModels({
            complex : AIAgentsList.find(agent => agent.getName() == "baseAssistant")?.getModelName() || modelsList[0], 
            trivial : AIAgentsList.find(agent => agent.getName() == "searchQueryOptimizer")?.getModelName() || modelsList[0], 
            embedding : "nomic-embed-text:v1.5"
        })
    }, [AIAgentsList])

    useEffect(() => {
        if(visibleSection == 3) setSelectedModels(currentModels => ({...currentModels, trivial : modelsList.includes(currentModels.trivial) ? currentModels.trivial : modelsList[0], complex : modelsList.includes(currentModels.complex) ? currentModels.complex : modelsList[0]}))   
    }, [visibleSection])

    /***
    //
    // Events Handlers
    //
    ***/

    function handleSwitchModel(targetModel : "trivial" | "complex", option : IOption){
        setSelectedModels(prevModels => ({...prevModels, [targetModel] : option.value}))
    }

    function handleSelectModelOnStep2(modelName : string){
        setSelectedStep2Model(modelName)
        setSelectedModels(currentModels => ({...currentModels, complex : modelName}))
    }

    async function handleNextClick(){
        setVisibleSection(currentSection => currentSection + 1)
    }
    
    async function handleSaveClick(e : React.MouseEvent){
        e.preventDefault();
        await agentService.updateAgentsConfig({advancedModel : selectedModels.complex, basicModel : selectedModels.trivial, embeddingModel : selectedModels.embedding})
        await characterService.updateModel(selectedModels.complex)
        navigate('/chat')
    }

    return(
        <main className="selectPage">
            <div style={{textAlign:'left', marginTop:'2rem'}} className="container">
                {{
                    0 : <><h1>Welcome to OSSPITA !</h1><Step1Section handleNextClick={handleNextClick}/></>,
                    1 : <><h1>Step 2 on 4</h1><Step2Section handleNextClick={handleNextClick}/></>,
                    2 : <><h1>Step 3 on 4</h1><Step3Section selectedStep2Model={selectedStep2Model} 
                        handleSelectModelOnStep2={handleSelectModelOnStep2} 
                        handleNextClick={handleNextClick}/></>,
                    3 : <><h1>Step 4 on 4</h1><Step4Section modelsList={modelsList} 
                        selectedModels={selectedModels} 
                        handleNextClick={handleNextClick} 
                        handleSwitchModel={handleSwitchModel}
                        handleSaveClick={handleSaveClick}/></>,
                } [visibleSection]}
            </div>
        </main>
    )
}

function Step1Section({handleNextClick} : {handleNextClick : () => void}) {

    const navigate = useNavigate()

    async function handleSkipClick(e : React.MouseEvent){
        e.preventDefault();
        navigate('/chat')
    }

    return(
        <section>
            <h3 style={{textAlign:'left', opacity:'0.9'}}>Backend Installation</h3>
            <p style={{textAlign:'left'}}>I - First, install our backend using the following commands :</p>
            <div className="pullCommands">
                        &gt; cd back<br/>
                        &gt; npm install<br/>
            </div>
            <hr/>
            <p style={{textAlign:'left', marginTop:'0.5rem'}}>II - Now run it by executing (from the back folder) :</p>
            <div className="pullCommands">
                        &gt; node osspita.js<br/>
                        &gt; server should run on port 5174
            </div>
            <hr/>
            <div style={{ marginTop:'1rem', width:'100%', display: 'flex', height:'40px', flexDirection:'row', columnGap:'0.75rem'}}>
                <button className="skipButton purpleShadow" onClick={handleSkipClick}>skip</button>
                <button className="purpleShadow" onClick={handleNextClick} style={{width:'25%', margin:'0'}}>next</button>
            </div>
        </section>
    )
}

function Step2Section({handleNextClick} : {handleNextClick : () => void}) {
    return(
        <section>
            <h3 style={{textAlign:'left', opacity:'0.9'}}>Ollama Installation</h3>
            <p style={{textAlign:'left'}}>I - Visit the official Ollama website :</p>
            <div className="pullCommands">
                <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">https://ollama.com/download</a>
                <span style={{marginTop:'0.75rem'}}>& Install the version of the application matching your OS.</span>
            </div>
            <hr/>
            <p style={{textAlign:'left', marginTop:'0.5rem'}}>II - If Ollama isn't running after this process, execute :</p>
            <div className="pullCommands">
                        &gt; ollama serve<br/>
            </div>
            <hr/>
            <button className="purpleShadow" onClick={handleNextClick} style={{width:'33%', marginLeft:'auto', marginTop:'1rem'}}>next</button>
        </section>
    )
}

function Step3Section({selectedStep2Model, handleSelectModelOnStep2, handleNextClick} : {selectedStep2Model : string, handleSelectModelOnStep2 : (model : string) => void, handleNextClick : () => void}) {
    return(
        <section>
            <h3 style={{textAlign:'left', opacity:'0.9'}}>Models Installation</h3>
            <p>I - Click on the main model fitting your hardware :</p>
            <table style={{marginTop:'0.25rem'}}>
                <thead><tr><th>GPU VRAM</th><th>Model</th><th>Description</th><th>Link</th></tr></thead>
                <tbody>
                    <tr className={selectedStep2Model == "llama3.2:3b" ? "modelRow active" : "modelRow"} onClick={() => handleSelectModelOnStep2("llama3.2:3b")}><td>4GB</td><td>Llama 3.2 3b</td><td>Fast (even on CPU) but limited</td><td><a target="_blank" href="https://ollama.com/library/llama3.2">Ollama page</a></td></tr>
                    <tr className={selectedStep2Model == "aya-expanse:8b" ? "modelRow active" : "modelRow"} onClick={() => handleSelectModelOnStep2("aya-expanse:8b")}><td>8GB</td><td>Aya Expanse 8b</td><td>Decent overall quality</td><td><a target="_blank" href="https://ollama.com/library/aya-expanse:8b">Ollama page</a></td></tr>
                    <tr className={selectedStep2Model == "mistral-nemo:12b" ? "modelRow active" : "modelRow"} onClick={() => handleSelectModelOnStep2("mistral-nemo:12b")}><td>12GB</td><td>Mistral Nemo 12b</td><td>Great for most tasks</td><td><a target="_blank" href="https://ollama.com/library/mistral-nemo">Ollama page</a></td></tr>
                </tbody>
            </table>
            <hr/>
            <p style={{marginTop:'0.25rem'}}>II - With Ollama installed, run those commands to pull the required models :</p>
            <div className="pullCommands">
                &gt; ollama pull llama3.2:3b<br/>
                &gt; ollama pull nomic-embed-text<br/>
                {selectedStep2Model == "mistral-nemo:12b" && <>&gt; ollama pull mistral-nemo:12b</>}
                {selectedStep2Model == "aya-expanse:8b" && <>&gt; ollama pull aya-expanse:8b</>}
                <br/><br/>
                &gt; ollama pull llama3.2-vision:11b (only if you want vision capabilities)
            </div>
            <hr/>
            <button className="purpleShadow" onClick={handleNextClick} style={{width:'33%', marginLeft:'auto', marginTop:'1rem'}}>next</button>
        </section>
    )
}

function Step4Section({modelsList, selectedModels, handleNextClick, handleSwitchModel, handleSaveClick} : {
    modelsList : string[],
    selectedModels: {
        complex: string;
        trivial: string;
        embedding: string;
    },
    handleNextClick : () => void,
    handleSwitchModel : (targetModel : "trivial" | "complex", option : IOption) => void,
    handleSaveClick : (e : React.MouseEvent) => void})
{    
    return(
        <section>
            <h3 style={{textAlign:'left', opacity:'0.9'}} onClick={() => console.log(selectedModels)}>Confirm your Selection</h3>
            <p style={{marginBottom:'0.25rem'}}>I - The most complex tasks will be handled by this model you previously selected :</p>
            <Select 
                width="100%"
                options={modelsList.map((model) => ({ label: model, value: model }))} 
                defaultOption={selectedModels.complex}
                labelledBy="labelComplexModelName" 
                id="complexModelName"
                onValueChange={(option : IOption) => handleSwitchModel("complex", option)}
            />
            <hr style={{marginTop:'1rem'}}/>
            <p style={{marginTop:'0.5rem', marginBottom:'0.25rem'}}>II - The trivial tasks will be handled by this required model :</p>
            <Select 
                width="100%"
                options={modelsList.map((model) => ({ label: model, value: model }))} 
                defaultOption={selectedModels.trivial}
                labelledBy="labelTrivialModelName" 
                id="trivialModelName"
                onValueChange={(option : IOption) => handleSwitchModel("trivial", option)}
            />
            <hr/>
            <p style={{marginTop:'0.5rem'}}><b>Important</b> : These choices are not definitive. The chat interface will let you select different models at any time.</p>
            <hr style={{marginTop:'0.5rem'}}/>
            <button className="purpleShadow" onClick={handleSaveClick} style={{width:'33%', marginLeft:'auto', marginTop:'1rem'}}>Save</button>
        </section>
    )
}