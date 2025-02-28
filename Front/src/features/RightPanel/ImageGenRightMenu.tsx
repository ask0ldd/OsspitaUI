/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate } from 'react-router-dom'
import './RightPanel3.css'

function ImageGenRightMenu({handleMenuItemClick, isStreaming} : IProps){

    const navigate = useNavigate()

    function handleNavChatClick(e : React.MouseEvent){
        e.preventDefault()
        navigate('/chat')
    }

    return(
        <div className={isStreaming ? 'userSettingsContainer inactive' : 'userSettingsContainer'} > {/* style={isStreaming ? {opacity : '0.6', cursor: 'auto'} : {}} */}
            <button title="ComfyUI Installation" style={{columnGap:'1rem'}}>
                ComfyUI Installation Tutorial :
                <svg style={{filter:'saturate(0.90) opacity(0.9) hue-rotate(-15deg)', boxShadow:'0 2px 4pxrgba(168, 65, 65, 0.2)', borderRadius:'6px'}} xmlns="http://www.w3.org/2000/svg" height="50%" viewBox="0 0 28.57  20" focusable="false">
                    <svg viewBox="0 0 28.57 20" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"></path>
                            <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"></path>
                        </g>
                    </svg>
                </svg>
            </button>
            <button title="Image Generation" className='imageGen purpleShadow' style={{width:'48px', maxWidth:'48px'}} onClick={handleNavChatClick}>
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 3L2 1H1V2L3 4L4 3ZM5 0H6V2H5V0ZM9 5H11V6H9V5ZM10 2V1H9L7 3L8 4L10 2ZM0 5H2V6H0V5ZM5 9H6V11H5V9ZM1 9V10H2L4 8L3 7L1 9ZM15.781 13.781L5.842 3.842C5.77235 3.77231 5.68965 3.71702 5.59862 3.6793C5.5076 3.64158 5.41003 3.62216 5.3115 3.62216C5.21297 3.62216 5.1154 3.64158 5.02438 3.6793C4.93335 3.71702 4.85065 3.77231 4.781 3.842L3.842 4.781C3.77231 4.85065 3.71702 4.93335 3.6793 5.02438C3.64158 5.1154 3.62216 5.21297 3.62216 5.3115C3.62216 5.41003 3.64158 5.5076 3.6793 5.59862C3.71702 5.68965 3.77231 5.77235 3.842 5.842L13.781 15.781C13.8507 15.8507 13.9334 15.906 14.0244 15.9437C14.1154 15.9814 14.213 16.0008 14.3115 16.0008C14.41 16.0008 14.5076 15.9814 14.5986 15.9437C14.6896 15.906 14.7723 15.8507 14.842 15.781L15.781 14.842C15.8507 14.7723 15.906 14.6896 15.9437 14.5986C15.9814 14.5076 16.0008 14.41 16.0008 14.3115C16.0008 14.213 15.9814 14.1154 15.9437 14.0244C15.906 13.9334 15.8507 13.8507 15.781 13.781ZM7.5 8.5L4.5 5.5L5.5 4.5L8.5 7.5L7.5 8.5Z" fill="white"/>
                </svg>
            </button>
        </div>
    )
}

export default ImageGenRightMenu

interface IProps{
    handleMenuItemClick : (item : string) => void
    isStreaming : boolean
}