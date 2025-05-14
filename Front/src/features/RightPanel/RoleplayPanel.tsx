/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react"
import './RightPanel3.css'
import './RoleplayPanel.css'
import AICharacter from "../../models/AICharacter"
import baseDirective from "../../constants/characters/baseDirective"
import defaultCharacterModelParameters from "../../constants/characters/DefaultCharacterModelParameters"
import useFetchCharactersList from "../../hooks/useFetchCharactersList"
import useFetchCharacterSettings from "../../hooks/useFetchCharacterSettings"
import { TRightMenuOptions } from "../../interfaces/TRightMenuOptions"
import { useServices } from "../../hooks/context/useServices"

function RoleplayPanel({isStreaming, activeMenuItemRef, memoizedSetModalStatus} : IProps){

    const [searchTerm, setSearchTerm] = useState<string>("")
    const [activeItemIndex, setActiveItemIndex] = useState(0)
    const {chatService} = useServices()

    const charactersList = useFetchCharactersList()
    const settings = useFetchCharacterSettings()

    function handleEmptySearchTermClick(){
        setSearchTerm("")
    }

    function handleSearchTermChange(event : React.ChangeEvent): void {
        setSearchTerm(() => ((event.target as HTMLInputElement).value))
    }

    async function handleClickCharacterItem(index : number){
        if(isStreaming) return
        setCharacterAsActive(index)
        setActiveItemIndex(index)
    }

    function handleOpenEditCharacterFormClick(){
        memoizedSetModalStatus({visibility : true, contentId : "formEditCharacter"})
    }

    function setCharacterAsActive(index : number){
        const activeCharacter = new AICharacter({
            ...defaultCharacterModelParameters, 
            modelName : settings.model,
            num_ctx : settings.num_ctx,
            num_predict : settings.num_predict,
            temperature : settings.temperature,
            name : charactersList[index].name,
            coreIdentity : charactersList[index].coreIdentity,
            mbti : charactersList[index].mbti,
            appearance : charactersList[index].appearance,
            background : "",
            socialCircle : "",
            formativeExperiences : "",
            systemPrompt : `${baseDirective}\n\n${charactersList[index].coreIdentity}\n\n${charactersList[index].mbti}\n\n${charactersList[index].appearance}`
        })
        chatService.setActiveAgent(activeCharacter)
    }

    useEffect(() => {
        if(activeMenuItemRef.current == "roleplay" && charactersList.length) {
            setCharacterAsActive(activeItemIndex)
        }
    }, [activeMenuItemRef.current, charactersList])

    return(
        <article className='roleplayContainer'>
            <h3 style={{margin:'2px 0 10px 0'}} onClick={() => console.log(chatService.getActiveAgent().getSystemPrompt())}>SPEAK WITH</h3>
            <div className="searchSettingsContainer">
                <div title="search" className="searchCharContainer active">
                    <input autoFocus type="text" value={searchTerm} placeholder="Search" onChange={handleSearchTermChange}/> {/* ref={searchInputRef} onChange={handleSearchTermChange} */ }
                    {searchTerm == "" ? 
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M2.2886 6.86317C2.2886 5.64968 2.77065 4.4859 3.62872 3.62784C4.48678 2.76978 5.65056 2.28772 6.86404 2.28772C8.07753 2.28772 9.24131 2.76978 10.0994 3.62784C10.9574 4.4859 11.4395 5.64968 11.4395 6.86317C11.4395 8.07665 10.9574 9.24043 10.0994 10.0985C9.24131 10.9566 8.07753 11.4386 6.86404 11.4386C5.65056 11.4386 4.48678 10.9566 3.62872 10.0985C2.77065 9.24043 2.2886 8.07665 2.2886 6.86317ZM6.86404 1.29784e-07C5.7839 -0.000137709 4.71897 0.254672 3.75588 0.743706C2.79278 1.23274 1.95871 1.94219 1.32149 2.81435C0.68428 3.68652 0.26192 4.69677 0.0887629 5.76294C-0.0843938 6.82911 -0.00345731 7.9211 0.32499 8.9501C0.653437 9.9791 1.22012 10.916 1.97895 11.6847C2.73778 12.4534 3.66733 13.0322 4.692 13.3739C5.71667 13.7156 6.80753 13.8106 7.87585 13.6512C8.94417 13.4918 9.95979 13.0826 10.8401 12.4566L14.0624 15.6789C14.2781 15.8873 14.567 16.0026 14.867 16C15.1669 15.9974 15.4538 15.8771 15.6658 15.665C15.8779 15.4529 15.9982 15.166 16.0008 14.8661C16.0034 14.5662 15.8881 14.2772 15.6798 14.0615L12.4587 10.8404C13.1888 9.8136 13.6222 8.60567 13.7113 7.34894C13.8005 6.09221 13.542 4.83518 12.9642 3.7156C12.3864 2.59602 11.5116 1.6571 10.4356 1.00171C9.35958 0.346316 8.12393 -0.000244844 6.86404 1.29784e-07Z" fill="#6D48C1"/>
                        </svg>
                        :<svg onClick={handleEmptySearchTermClick} width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                        </svg>
                    }
                </div>
                <div style={{width:'1px', height:'40px', borderRight:'1px dashed #35353599'}}></div>
                <button title="settings" className="settingsButton purpleShadow" onClick={handleOpenEditCharacterFormClick}>
                    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" d="M19.3501 7.92305L18.9841 7.71905L18.8711 7.65505C18.5985 7.49143 18.3688 7.26518 18.2011 6.99505C18.1831 6.96805 18.1671 6.93905 18.1351 6.88305C17.9195 6.53698 17.8148 6.13328 17.8351 5.72605L17.8411 5.30105C17.8531 4.62105 17.8591 4.27905 17.7631 3.97305C17.6781 3.70079 17.536 3.44984 17.3461 3.23705C17.1321 2.99705 16.8351 2.82505 16.2401 2.48305L15.7461 2.19805C15.1541 1.85705 14.8571 1.68605 14.5421 1.62105C14.2638 1.56346 13.9764 1.56585 13.6991 1.62805C13.3861 1.69805 13.0931 1.87405 12.5081 2.22405L12.5051 2.22605L12.1511 2.43705C12.0951 2.47105 12.0661 2.48705 12.0381 2.50305C11.7601 2.65805 11.4501 2.74305 11.1311 2.75305C11.0991 2.75505 11.0661 2.75505 11.0011 2.75505L10.8711 2.75405C10.552 2.74389 10.24 2.65748 9.96108 2.50205C9.93308 2.48705 9.90608 2.47005 9.85008 2.43605L9.49308 2.22205C8.90408 1.86805 8.60908 1.69205 8.29408 1.62105C8.01573 1.55875 7.72728 1.5567 7.44808 1.61505C7.13208 1.68105 6.83608 1.85305 6.24308 2.19705L6.24008 2.19805L5.75208 2.48105L5.74708 2.48505C5.15908 2.82505 4.86408 2.99705 4.65208 3.23605C4.46316 3.44844 4.32168 3.69867 4.23708 3.97005C4.14208 4.27705 4.14708 4.61905 4.15908 5.30305L4.16608 5.72705C4.16608 5.79205 4.16908 5.82405 4.16808 5.85505C4.1629 6.21837 4.05884 6.57341 3.86708 6.88205C3.83408 6.93805 3.81908 6.96605 3.80208 6.99205C3.63347 7.26422 3.40198 7.49193 3.12708 7.65605L3.01508 7.71905L2.65408 7.91905C2.05208 8.25205 1.75108 8.41905 1.53308 8.65705C1.33926 8.86688 1.19264 9.1158 1.10308 9.38705C1.00308 9.69405 1.00308 10.037 1.00408 10.725L1.00608 11.288C1.00708 11.971 1.00908 12.312 1.11008 12.617C1.19926 12.8866 1.34483 13.1341 1.53708 13.3431C1.75508 13.5791 2.05308 13.745 2.65008 14.077L3.00808 14.276C3.06908 14.31 3.10008 14.326 3.12908 14.344C3.44245 14.5319 3.69838 14.802 3.86908 15.125L3.93608 15.2451C4.10499 15.564 4.18447 15.9226 4.16608 16.2831L4.15908 16.6901C4.14708 17.3761 4.14208 17.7201 4.23808 18.0271C4.32308 18.2991 4.46508 18.5501 4.65508 18.7631C4.86908 19.0031 5.16708 19.174 5.76108 19.517L6.25508 19.802C6.84808 20.143 7.14408 20.314 7.45908 20.379C7.73738 20.4366 8.02477 20.4343 8.30208 20.372C8.61608 20.302 8.90908 20.126 9.49608 19.774L9.85008 19.562L9.96308 19.496C10.2411 19.342 10.5511 19.256 10.8701 19.246L11.0001 19.2451H11.1301C11.4481 19.2551 11.7601 19.342 12.0401 19.497L12.1321 19.552L12.5081 19.778C13.0981 20.132 13.3921 20.308 13.7071 20.378C13.9853 20.441 14.2737 20.4437 14.5531 20.386C14.8681 20.32 15.1661 20.147 15.7591 19.803L16.2541 19.5161C16.8421 19.1741 17.1371 19.003 17.3491 18.764C17.5391 18.551 17.6791 18.3011 17.7641 18.0301C17.8591 17.7251 17.8541 17.386 17.8421 16.712L17.8341 16.272V16.1451C17.8388 15.7815 17.9425 15.4261 18.1341 15.1171L18.1991 15.007C18.3677 14.7349 18.5992 14.5072 18.8741 14.3431L18.9841 14.282L18.9861 14.281L19.3471 14.081C19.9491 13.747 20.2501 13.5811 20.4691 13.3431C20.6631 13.1331 20.8091 12.883 20.8981 12.613C20.9981 12.308 20.9981 11.966 20.9961 11.286L20.9941 10.712C20.9931 10.029 20.9921 9.68705 20.8911 9.38205C20.8015 9.11275 20.6556 8.86561 20.4631 8.65705C20.2461 8.42105 19.9481 8.25505 19.3521 7.92405L19.3501 7.92305Z" stroke="#FFFFFFEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path fill="none" d="M7 11C7 12.0609 7.42143 13.0783 8.17157 13.8284C8.92172 14.5786 9.93913 15 11 15C12.0609 15 13.0783 14.5786 13.8284 13.8284C14.5786 13.0783 15 12.0609 15 11C15 9.93913 14.5786 8.92172 13.8284 8.17157C13.0783 7.42143 12.0609 7 11 7C9.93913 7 8.92172 7.42143 8.17157 8.17157C7.42143 8.92172 7 9.93913 7 11Z" stroke="#FFFFFFEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            <div className="characterList">
            {charactersList.filter(character => character.name.toLowerCase().includes(searchTerm.toLowerCase()) || character.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))).slice(0, 15).map((character, index) => (
                <article key={"character"+index} className={activeItemIndex == index ? "characterItem active" : "characterItem"} onClick={() => handleClickCharacterItem(index)}>
                    <img style={{filter :'saturate(0.93) contrast(0.9)'}} src={'backend/images/characters/' + character.portrait}/>
                    <span>{capitalizeFirstLetter(character.name)}</span>
                </article>
            ))}
            </div>
            <div className="buttonsContainer">
                <button title="previous page" className="prevButton">
                    <svg height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </button>
                <button title="next page" className="nextButton">
                    <svg style={{transform:'rotate(180deg)'}} height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </button>
            </div>
        </article>)
}

function capitalizeFirstLetter(string : string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default RoleplayPanel

interface IProps{
    activeMenuItemRef : React.MutableRefObject<TRightMenuOptions>
    isStreaming : boolean
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
}
