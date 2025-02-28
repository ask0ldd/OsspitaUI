/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import '../style/CustomTextarea.css'
// import useKeyboardListener from "../hooks/CustomTextarea/useKeyboardListener";
import { useMainTextAreaStore } from "../hooks/stores/useMainTextAreaStore";
import React from "react";

// const CustomTextarea = forwardRef(({textareaValue, setTextareaValue, currentContext, handlePressEnterKey, activeConversationId, isStreaming} : IProps, ref : ForwardedRef<ImperativeHandle>) => {

const CustomTextarea = React.memo(() => {

    // useEffect(() => console.log("textarea render"))
    
    const { textareaValue, setTextareaValue, textareaRef } = useMainTextAreaStore()

    // useKeyboardListener(textareaRef, handlePressEnterKey, activeConversationId, currentContext)

    useEffect(() => {
        if(textareaValue == "" && textareaRef.current) textareaRef.current.style.height = '100px'
    }, [textareaValue])

    function handleInput(text : string) : void{
        setTextareaValue(text)
        if(textareaRef.current) autoGrow(textareaRef.current)
        /*if(autoCompletion.current){
            // askAutoComplete(text)
            const textarea = textareaRef.current as HTMLTextAreaElement
            // updateSuggestionPosition(textarea)
        }*/
    }

    // the textarea grows automatically when new lines are inputted
    function autoGrow(textarea : HTMLTextAreaElement) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    return(
        <div className="textAreaContainer">
            <textarea ref={textareaRef} id="mainTextArea" spellCheck="false" onInput={(e) => handleInput((e.target as HTMLTextAreaElement).value)} value={textareaValue}></textarea>
        </div>
    )
})

export default CustomTextarea

/*export interface ImperativeHandle {
    focusTextarea: () => void
}*/


/*function getLastCharCoordinates(textarea: HTMLTextAreaElement) : { x: number, y: number } {
    // Create a mirrored div of the textarea
    const mirror = document.createElement('div')
    
    // Copy the textarea's style to the div
    const style = window.getComputedStyle(textarea);

    ['font-family', 'font-size', 'font-weight', 'line-height', 'text-transform', 'letter-spacing', 'word-spacing', 'padding', 'border-width', 'box-sizing', 'white-space'].forEach(property => {
        if (property in style) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mirror.style as any)[property] = (style as any)[property]
        }
    })
    
    // Set the div's dimensions and position
    mirror.style.position = 'absolute'
    mirror.style.top = '0px'
    mirror.style.left = '0px'
    mirror.style.visibility = 'hidden'
    mirror.style.width = textarea.offsetWidth + 'px'
    mirror.style.height = textarea.offsetHeight + 'px'
    
    // Preserve line breaks and spaces using <br> and &nbsp
    const content = textarea.value.slice(0, -1).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')
    const lastChar = textarea.value.slice(-1) || ' '
    
    // Set the content and append the last character
    mirror.innerHTML = content
    const span = document.createElement('span')
    span.textContent = lastChar
    mirror.appendChild(span)
    
    // Append to body
    document.body.appendChild(mirror)
    
    // Get the coordinates
    const rect = span.getBoundingClientRect()
    const coordinates = { y: rect.top + window.scrollY, x: rect.left + window.scrollX }

    if((textarea.value.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')).endsWith('<br>')){
            coordinates.x = 6;
            coordinates.y += 24;
    }
    
    // Clean up
    document.body.removeChild(mirror)
    
    return coordinates;
}*/

// the three fn below should integrate a custom completion hook
    /*async function askAutoComplete(sentence : string) : Promise<void>{
        const response = await ChatService.askTheActiveAgentForAutoComplete(sentence, currentContext || [])
        setSuggestion(response.response)
    }*/

    /*function applyAutoCompleteOnTabPress(event : KeyboardEvent) : void {
        if(document.activeElement?.id == "mainTextArea" && event.key === 'Tab') {
            event.preventDefault()
            setTextareaValue(textareaValue + suggestionRef.current)
            if(textareaRef.current) (textareaRef.current as HTMLTextAreaElement).value = textareaRef.current?.value + suggestionRef.current
            setSuggestion("")
        }
    }*/

    /*function updateSuggestionPosition(textarea : HTMLTextAreaElement) : void {
        const coordinates = getLastCharCoordinates(textarea)
        if(suggestionDivRef.current) {
            suggestionDivRef.current.style.left = coordinates.x+8+`px`
            suggestionDivRef.current.style.top = coordinates.y+`px`
        }
}*/