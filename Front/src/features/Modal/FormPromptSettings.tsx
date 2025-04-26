/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react"
import './FormPromptSettings.css'
import useFetchPrompt from "../../hooks/useFetchPrompt.ts"
import { useServices } from "../../hooks/context/useServices.ts"

export function FormPromptSettings({memoizedSetModalStatus, selectedPromptNameRef, setForceLeftPanelRefresh, role} : TProps){

    const {promptService, imagePromptService} = useServices()

    const { prompt, setPrompt } = role == "edit" ? useFetchPrompt(selectedPromptNameRef?.current, "edit") : useFetchPrompt(selectedPromptNameRef?.current, "editImageGen")
    const [error, setError] = useState("")

    useEffect(() => {
        setFormValues({name : prompt.name, prompt : prompt.prompts[prompt.prompts.length - 1 ].text, currentVersion : prompt.currentVersion})
    }, [prompt])

    const [formValues, setFormValues] = useState<IFormStructure>({name : prompt.name, prompt : prompt.prompts[prompt.prompts.length - 1 ].text, currentVersion : prompt.currentVersion})
    
    function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        memoizedSetModalStatus({visibility : false})
    }

    function isEditMode(){
        return role == "edit" || role == "editImageGen"
    }

    function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        if(!isFormValid()) return // !!! error message missing
        if(role == "edit") {
            promptService.updateByName(prompt.name, { newName : formValues.name, prompt : formValues.prompt, version : formValues.currentVersion })
        }
        if(role == "create") {
            promptService.save(formValues.name, formValues.prompt)
        }
        if(role == "createImageGen") {
            imagePromptService.save(formValues.name, formValues.prompt)
        }
        if(role == "editImageGen"){
            imagePromptService.updateByName(prompt.name, { newName : formValues.name, prompt : formValues.prompt, version : formValues.currentVersion })
        }
        if(setForceLeftPanelRefresh) setForceLeftPanelRefresh(prev => prev + 1)
        memoizedSetModalStatus({visibility  : false})
    }

    function handleDeleteClick(e : React.MouseEvent){
        e.preventDefault()
        if(role == "edit") {
            if(prompt.id) promptService.deleteById(prompt.id)
        }
        if(role == "editImageGen") {
            if(prompt.id) imagePromptService.deleteById(prompt.id)
        }
        if(setForceLeftPanelRefresh) setForceLeftPanelRefresh(prev => prev + 1)
        memoizedSetModalStatus({visibility  : false})
    }

    async function handleCopyToClipboardClick(e : React.MouseEvent){
        e.preventDefault()
        try {
            await navigator.clipboard.writeText(formValues.prompt);
            console.log('Text copied to clipboard.');
          } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    function isFormValid(){
        const {name, prompt } = formValues
        setError("")
        if(!name || name == "") { 
            setError("Prompt name is required.")
            return false
        }
        if(!prompt || prompt == "") { 
            setError("A prompt is required.")
            return false
        }
        return true
    }

    return(
    <div className="formNHistoryContainer">
        {isEditMode() && <div className="historyContainer">
            <h3>Prompt History <span style={{fontWeight:'400'}}>(Coming soon)</span></h3>
            <div className="historyTable">
                <div className="historyHeader">
                    <div>Prompt Name</div><div>Version</div>
                </div>
                <div className="historyBody">
                    <div className="historyRow"><div>{prompt.name}</div><div>1.0.0</div></div>
                    <div className="historyRow"><div>{prompt.name}</div><div>0.1.4</div></div>
                    <div className="historyRow"><div>{prompt.name}</div><div>0.0.3</div></div>
                    <div className="historyRow"><div>{prompt.name}</div><div>0.0.2</div></div>
                    <div className="historyRow"><div>{prompt.name}</div><div>0.0.1</div></div>
                </div>
            </div>
        </div>}
        <form className="prompt-form">
        <div style={{marginBottom:"14px", width:"100%", display:"flex", justifyContent:"space-between"}}>
            <div className="labelErrorContainer"><label id="label-name" style={{margin:0}}>Name</label>{error.includes("name") && <span>{error}</span>}</div>
            {isEditMode() && <span style={{marginLeft:'auto', fontWeight:'500', width:'calc(40px * 4 + 8px * 3)', textAlign:'left'}}>Actions</span>}
        </div>
        <div className="nameNOptionsWrapper">
            <input aria-labelledby="label-name" 
                style={error.includes("name") ? {maxWidth:'50%', borderColor: 'hsla(337, 89%, 28%, 0.733)'} : {maxWidth:'50%'}}
                type="text" 
                spellCheck="false" 
                value={formValues.name} 
                onChange={(e) => setFormValues(formValues => ({...formValues, name : e.target?.value}))}
            />
            {isEditMode() && 
            <>
                <button onClick={(e) => e.preventDefault()} style={{marginLeft:'auto', opacity:'0.4', cursor:'auto'}} title="coming soon">
                    <svg style={{transform:'translateY(1px)'}} width="20" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.84728 6.90413C5.97584 7.44143 5.64183 7.98059 5.10124 8.10837C3.32931 8.5272 2.01224 10.1119 2.01224 12C2.01224 14.2091 3.81406 16 6.03671 16C6.41966 16 6.78845 15.9471 7.13692 15.849C7.67152 15.6983 8.22776 16.007 8.3793 16.5383C8.53085 17.0697 8.22032 17.6225 7.68572 17.7731C7.16038 17.9212 6.60696 18 6.03671 18C2.70272 18 0 15.3137 0 12C0 9.16466 1.97773 6.7909 4.63568 6.16263C5.17627 6.03485 5.71872 6.36683 5.84728 6.90413Z" fill="#373737"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.1527 6.90414C16.2813 6.36684 16.8237 6.03485 17.3643 6.16263C20.0223 6.7909 22 9.16467 22 12C22 15.3137 19.2973 18 15.9633 18C15.393 18 14.8396 17.9212 14.3143 17.7731C13.7797 17.6225 13.4692 17.0697 13.6207 16.5383C13.7722 16.007 14.3285 15.6983 14.8631 15.849C15.2115 15.9471 15.5803 16 15.9633 16C18.186 16 19.9878 14.2091 19.9878 12C19.9878 10.1119 18.6707 8.5272 16.8988 8.10837C16.3582 7.98059 16.0242 7.44144 16.1527 6.90414Z" fill="#373737"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.02448 7C4.02448 3.13402 7.17767 0 11.0673 0C14.957 0 18.1101 3.13402 18.1101 7C18.1101 7.55228 17.6597 8 17.104 8C16.5484 8 16.0979 7.55228 16.0979 7C16.0979 4.23858 13.8456 2 11.0673 2C8.289 2 6.03671 4.23858 6.03671 7C6.03671 7.55228 5.58626 8 5.03059 8C4.47493 8 4.02448 7.55228 4.02448 7Z" fill="#373737"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.8792 15.706C11.4875 16.0965 10.8517 16.0983 10.4579 15.7099L6.87014 12.1717C6.4757 11.7827 6.47321 11.1496 6.86458 10.7575C7.25596 10.3655 7.893 10.363 8.28744 10.752L11.1626 13.5874L13.9424 10.8154C14.3347 10.4242 14.9717 10.4232 15.3653 10.8131C15.7588 11.203 15.7599 11.8361 15.3676 12.2273L11.8792 15.706Z" fill="#373737"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.1665 14.231C10.6108 14.231 10.1604 13.7833 10.1604 13.231V6.4619C10.1604 5.90962 10.6108 5.4619 11.1665 5.4619C11.7222 5.4619 12.1726 5.90962 12.1726 6.4619V13.231C12.1726 13.7833 11.7222 14.231 11.1665 14.231Z" fill="#373737"/>
                    </svg>
                </button>
                <button onClick={(e) => e.preventDefault()} style={{marginLeft:'0.5rem', opacity:'0.4', cursor:'auto'}} title="coming soon">
                    <svg style={{transform:'translateY(1px)'}} width="20" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.84728 6.90413C5.97584 7.44143 5.64183 7.98059 5.10124 8.10837C3.32931 8.5272 2.01224 10.1119 2.01224 12C2.01224 14.2091 3.81406 16 6.03671 16C6.41966 16 6.78845 15.9471 7.13692 15.849C7.67152 15.6983 8.22775 16.007 8.3793 16.5383C8.53085 17.0697 8.22032 17.6225 7.68572 17.7731C7.16038 17.9212 6.60696 18 6.03671 18C2.70272 18 0 15.3137 0 12C0 9.16466 1.97773 6.7909 4.63568 6.16263C5.17626 6.03485 5.71872 6.36683 5.84728 6.90413Z" fill="#373737"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.1527 6.90414C16.2813 6.36684 16.8237 6.03485 17.3643 6.16263C20.0223 6.7909 22 9.16467 22 12C22 15.3137 19.2973 18 15.9633 18C15.393 18 14.8396 17.9212 14.3143 17.7731C13.7797 17.6225 13.4692 17.0697 13.6207 16.5383C13.7722 16.007 14.3285 15.6983 14.8631 15.849C15.2115 15.9471 15.5803 16 15.9633 16C18.186 16 19.9878 14.2091 19.9878 12C19.9878 10.1119 18.6707 8.5272 16.8988 8.10837C16.3582 7.98059 16.0242 7.44144 16.1527 6.90414Z" fill="#373737"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.02448 7C4.02448 3.13402 7.17767 0 11.0673 0C14.957 0 18.1101 3.13402 18.1101 7C18.1101 7.55228 17.6597 8 17.104 8C16.5484 8 16.0979 7.55228 16.0979 7C16.0979 4.23858 13.8456 2 11.0673 2C8.289 2 6.03671 4.23858 6.03671 7C6.03671 7.55228 5.58626 8 5.0306 8C4.47493 8 4.02448 7.55228 4.02448 7Z" fill="#373737"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.3547 6.75596C10.7463 6.36542 11.3821 6.36366 11.7759 6.75204L15.3637 10.2902C15.7581 10.6792 15.7606 11.3124 15.3692 11.7044C14.9779 12.0965 14.3408 12.099 13.9464 11.71L11.0712 8.87451L8.2914 11.6465C7.89913 12.0377 7.26209 12.0388 6.86853 11.6489C6.47497 11.259 6.47392 10.6258 6.86619 10.2347L10.3547 6.75596Z" fill="#373737"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.0673 8.23095C11.623 8.23095 12.0734 8.67867 12.0734 9.23095V16C12.0734 16.5523 11.623 17 11.0673 17C10.5116 17 10.0612 16.5523 10.0612 16V9.23095C10.0612 8.67867 10.5116 8.23095 11.0673 8.23095Z" fill="#373737"/>
                    </svg>
                </button>
                <button className="hover" onClick={handleCopyToClipboardClick} style={{marginLeft:'0.5rem'}} title="copy prompt to clipboard">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6 3C6 2.44772 6.44772 2 7 2H15C15.5523 2 16 2.44772 16 3V9C16 10.6569 14.6569 12 13 12H7C6.44772 12 6 11.5523 6 11V3ZM7 0C5.34315 0 4 1.34315 4 3V11C4 12.6569 5.34315 14 7 14H13C15.7614 14 18 11.7614 18 9V3C18 1.34315 16.6569 0 15 0H7ZM0 5V13C0 15.7614 2.23858 18 5 18H11V16H5C3.34315 16 2 14.6569 2 13V5H0ZM10 8H8V6H10V4H12V6H14V8H12V10H10V8Z" fill="#373737"/>
                    </svg>
                </button>
                <button onClick={handleDeleteClick} className="purpleShadow" style={{marginLeft:'0.5rem'}} title="delete">
                    <svg width="16" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#373737" d="M188 40H152V28C152 20.5739 149.05 13.452 143.799 8.20101C138.548 2.94999 131.426 0 124 0H76C68.5739 0 61.452 2.94999 56.201 8.20101C50.95 13.452 48 20.5739 48 28V40H12C8.8174 40 5.76516 41.2643 3.51472 43.5147C1.26428 45.7652 0 48.8174 0 52C0 55.1826 1.26428 58.2348 3.51472 60.4853C5.76516 62.7357 8.8174 64 12 64H16V200C16 205.304 18.1071 210.391 21.8579 214.142C25.6086 217.893 30.6957 220 36 220H164C169.304 220 174.391 217.893 178.142 214.142C181.893 210.391 184 205.304 184 200V64H188C191.183 64 194.235 62.7357 196.485 60.4853C198.736 58.2348 200 55.1826 200 52C200 48.8174 198.736 45.7652 196.485 43.5147C194.235 41.2643 191.183 40 188 40ZM72 28C72 26.9391 72.4214 25.9217 73.1716 25.1716C73.9217 24.4214 74.9391 24 76 24H124C125.061 24 126.078 24.4214 126.828 25.1716C127.579 25.9217 128 26.9391 128 28V40H72V28ZM160 196H40V64H160V196ZM88 96V160C88 163.183 86.7357 166.235 84.4853 168.485C82.2348 170.736 79.1826 172 76 172C72.8174 172 69.7652 170.736 67.5147 168.485C65.2643 166.235 64 163.183 64 160V96C64 92.8174 65.2643 89.7652 67.5147 87.5147C69.7652 85.2643 72.8174 84 76 84C79.1826 84 82.2348 85.2643 84.4853 87.5147C86.7357 89.7652 88 92.8174 88 96ZM136 96V160C136 163.183 134.736 166.235 132.485 168.485C130.235 170.736 127.183 172 124 172C120.817 172 117.765 170.736 115.515 168.485C113.264 166.235 112 163.183 112 160V96C112 92.8174 113.264 89.7652 115.515 87.5147C117.765 85.2643 120.817 84 124 84C127.183 84 130.235 85.2643 132.485 87.5147C134.736 89.7652 136 92.8174 136 96Z"/>
                    </svg>
                </button>
            </>}
        </div>
        <div className="labelErrorContainer" style={{maxWidth:'100%'}}><label id="label-prompt">Prompt</label>{error.includes("A prompt") && <span style={{marginTop: '1.5rem'}}>{error}</span>}</div>
        <textarea
            aria-labelledby="label-prompt"
            spellCheck="false"
            className="form-textarea" 
            rows={12} 
            value={formValues.prompt}
            style={error.includes("A prompt") ? {position:"relative", outlineColor: 'hsla(337, 89%, 28%, 0.733)'} : {position:"relative"}}
            onChange={(e) => setFormValues(formValues => ({...formValues, prompt : e.target?.value}))}
        />
            {/*<button className="purpleShadow">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M6 3C6 2.44772 6.44772 2 7 2H15C15.5523 2 16 2.44772 16 3V9C16 10.6569 14.6569 12 13 12H7C6.44772 12 6 11.5523 6 11V3ZM7 0C5.34315 0 4 1.34315 4 3V11C4 12.6569 5.34315 14 7 14H13C15.7614 14 18 11.7614 18 9V3C18 1.34315 16.6569 0 15 0H7ZM0 5V13C0 15.7614 2.23858 18 5 18H11V16H5C3.34315 16 2 14.6569 2 13V5H0ZM10 8H8V6H10V4H12V6H14V8H12V10H10V8Z" fill="#8490b3ee"/>
                </svg>
            </button>*/}
        <div style={{display:'flex', columnGap:'12px', marginTop:'24px', width:'50%', justifySelf:'flex-end'}}>
            <button onClick={handleCancelClick} className="cancel-button purpleShadow">Cancel</button>
            <button onClick={handleSaveClick} className="save-button purpleShadow">Save</button>
        </div>
        </form>
    </div>
    )
}

interface IProps{
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
    selectedPromptNameRef? : React.MutableRefObject<string>
    setForceLeftPanelRefresh : React.Dispatch<React.SetStateAction<number>>
    role : "edit" | "create" | "createImageGen" | "editImageGen"
}

type TProps = {
    memoizedSetModalStatus: ({ visibility, contentId }: { visibility: boolean; contentId?: string }) => void;
    setForceLeftPanelRefresh: React.Dispatch<React.SetStateAction<number>>;
  } & (
    | {
        role: "edit" | "editImageGen";
        selectedPromptNameRef: React.MutableRefObject<string>;
      }
    | {
        role: "create" | "createImageGen";
        selectedPromptNameRef?: never;
      }
  );

interface IFormStructure {
    name : string
    prompt : string
    currentVersion : number
}