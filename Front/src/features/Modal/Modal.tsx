/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, useEffect, useRef } from 'react'
import './Modal.css'
import { createPortal } from 'react-dom'

function Modal({children, modalVisibility, memoizedSetModalStatus, /*modalContent,*/ containerCSSClass, width} : IProps){

    const dialogRef = useRef<HTMLDialogElement>(null)
    const modalVisibilityRef = useRef<boolean>(modalVisibility)

    const isMouseDownInsideModal = useRef<boolean>(false)
    
    useEffect(() => {
        if(modalVisibilityRef && !dialogRef.current?.open) return dialogRef.current?.showModal()
        if(!modalVisibilityRef && dialogRef.current?.open) return dialogRef.current?.close()
    })

    // the following events handler prevent the modal from being closed by releasing the mouse button outside of it
    // useful when the user makes big gestures when selecting modal text elements
    function handleOnClick(e : React.MouseEvent) : void{
        if (isMouseDownInsideModal.current && (e.target as HTMLDialogElement).nodeName === 'DIALOG') {
            e.preventDefault()
            e.stopPropagation()
            return
        }
    }

    function handleMouseDown(e: React.MouseEvent) : void {
        const dialogElement = e.target as HTMLDialogElement

        if(dialogElement.nodeName !== 'DIALOG') {
            isMouseDownInsideModal.current = true
            return
        }
        
        const rect = dialogElement.getBoundingClientRect()
        const isInDialog = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
        )
        
        if (!isInDialog) {
            isMouseDownInsideModal.current = false
        } else {
            isMouseDownInsideModal.current = true
        }
    }

    function handleMouseUp(e : React.MouseEvent){
        if (isMouseDownInsideModal.current) return
        e.preventDefault()
        e.stopPropagation()
        isMouseDownInsideModal.current = false
        if ((e.target as HTMLDialogElement).nodeName === 'DIALOG') memoizedSetModalStatus({visibility : false})
    }
    
    return (
        createPortal(
            <dialog style={width ? {width : width} : {}} data-testid="modal" ref={dialogRef} 
                onClick={handleOnClick} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}
                onCancel={(e) => e.preventDefault()}>
                    <div className='modalHorizPadding'></div>
                    <div className='modalVertPaddingNChildrenContainer'>
                        <div className='modalVertPadding'></div>
                        {children}
                        <div className='modalVertPadding'></div>
                    </div>
                    <div className='modalHorizPadding'></div>
            </dialog>, document.body
        )
    )
}

export default Modal

interface IProps{
    children: ReactNode
    modalVisibility : boolean
    // modalContent : JSX.Element
    containerCSSClass? : string
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
    width ?: string
}