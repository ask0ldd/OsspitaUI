import { useEffect, useState } from 'react'
import '../style/Snackbar.css'
import { TRightMenuOptions } from '../interfaces/TRightMenuOptions'
import { createPortal } from 'react-dom'

const SNACKBAR_DURATION = 1500

const snackbarMessages = {
  agent: 'Default Mode Active',
  chain: 'Agent Chaining Mode Active',
  web: 'Web Search Mode Active',
  rag: 'RAG Mode Active',
  roleplay: 'Roleplay Mode Active',
  settings: 'Settings',
  vision: 'Vision Mode Active'
}

export default function Snackbar({mode} : {mode: TRightMenuOptions | "web" | "rag" | "vision"}){

    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (mode) {
            setIsVisible(true)
            const timeoutId = setTimeout(() => {
                setIsVisible(false)
            }, SNACKBAR_DURATION)
            return () => clearTimeout(timeoutId)
        }
    }, [mode])

    return(
        createPortal(<div className='snackbar' style={{ display: isVisible ? 'flex' : 'none'/*, top : window.scrollY+2+'px' */}}>
            {snackbarMessages[mode] || ''}
        </div>, document.body)
    )
}