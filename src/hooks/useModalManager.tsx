/* eslint-disable react-hooks/exhaustive-deps */
/* c8 ignore start */
import { useState, useEffect } from "react"

function useModalManager({initialVisibility, initialModalContentId} : IModalObject) {

    const [modalVisibility, setModalVisibility] = useState<boolean>(initialVisibility)
    const [modalContentId, setModalContentId] = useState<string>(initialModalContentId)

    useEffect(() => {
  
        function keyboardListener(e : KeyboardEvent){
            if(e.code == "Escape" && modalVisibility) {
                e.preventDefault(); 
                e.stopPropagation(); 
                setModalVisibility(false)
            }
        }

        window.addEventListener('keydown', keyboardListener)

        // clean up to avoid having two listeners active => since useEffect is triggered twice in strict mode
        return () => {
            window.removeEventListener('keydown', keyboardListener)
        }

    }, [modalVisibility, setModalVisibility])

    useEffect(() => {

        if(modalVisibility) {
            scrollLock(true)
        } else { 
            scrollLock(false)
        }

    }, [modalVisibility])

    return { modalVisibility, setModalVisibility, modalContentId, setModalContentId }
}

export default useModalManager

interface IModalObject{
    initialVisibility : boolean
    initialModalContentId : string
}

function scrollLock(bool : boolean)
{
    if(bool === true)
    {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft
        window.onscroll = () => {
            window.scrollTo(scrollLeft, scrollTop)
        }
    }else{
        window.onscroll = () => {}
    }
}