/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react"
import { ChatService } from "../../services/ChatService";
import ImagePreview from "./ImagePreview.tsx";
import {useImagesStore } from "../../hooks/stores/useImagesStore.ts";
import { useServices } from "../../hooks/context/useServices.ts";
import { useOptionsContext } from "../../hooks/context/useOptionsContext.ts";

function ImagesSlot({active, setActiveSlot} : IProps){

  const {images, setImages, hoveredImage, selectedImagesIds, deselectAllImages, getSelectedImages, /*deleteSelectedImages, */toggleImageWithId, pushImage, setHoveredImage } = useImagesStore()

  const {imageService, chatService} = useServices()
  const {isWebSearchActivated, setWebSearchActivated, setActiveMode} = useOptionsContext()

  const [isVisionModelActive, setIsVisionModelActive] = useState<boolean>(true)

  const fileInputRef = useRef<HTMLInputElement | null>(null) 

  const hasBeenInit = useRef(false)
  useEffect(()=>{
    const fetchImages = async () => {
      const imgs = await imageService.getAll()
      setImages(imgs ?? [])
    }
    if(!hasBeenInit.current) fetchImages()
  }, [])

  async function refreshImages(){
    const imgs = await imageService.getAll()
    setImages(imgs ?? [])
  }

  async function handleFileSelect(e : React.ChangeEvent<HTMLInputElement>){
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    const allowTypes = ["image/jpeg", "image/png"]
    if (!allowTypes.includes(file.type)) return console.log("The provided file is not a JPEG or a PNG.")

    /*if (file) {
      const reader = new FileReader();
      
      reader.onload = function(e : ProgressEvent<FileReader>) {
        const dataURL = e.target?.result as string
        if(dataURL != null) {
          const newId = images.length
          // pushImage({id : newId, filename : file.name, data : dataURL})
        }
      };
      
      reader.readAsDataURL(file);
    }*/

    // send a formdata with the image to the backend
    const formData = new FormData()
    formData.append('image', e.target.files[0], file.name)
    const response = await imageService.upload(formData)
    // if(response != null) console.log(response.filename)
    if(response != null) pushImage(response)

    e.target.value = ""
  }

  function handleImgClick(id : number){
    if(chatService.isAVisionModelActive() == false) {
      setIsVisionModelActive(false)
      return deselectAllImages()
    }
    setIsVisionModelActive(true)
    setWebSearchActivated(false)
    toggleImageWithId(id)
    setActiveMode("vision")
  }

  function handleUploadButtonClick(e : React.MouseEvent){
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  async function handleDeleteSelectedImgClick(e : React.MouseEvent){
    e.preventDefault()
    e.stopPropagation()
    // deleteSelectedImages()
    const images = getSelectedImages()
    for(const image of images){
      await imageService.deleteById(image.$loki)
    }
    await refreshImages()
  }

  function handleMouseOverPicture(id : number){
    if(images[id] != null) setHoveredImage(images[id])
  }

  async function handlePasteFromClipboardClick(){
    /*try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await clipboardItem.getType(imageType);
          const dataUrl = await blobToBase64(blob)
          const newId = images.length
          const img = {id : newId, filename : 'screenshot'+ newId, data : dataUrl}
          // pushImage(img)
          break;
        }
      }
    } catch (err) {
      console.error("Failed to read the clipboard content:", err);
    }*/
  }

  useEffect(() => {
    if (images || isWebSearchActivated || active === false) {
      deselectAllImages()
    }
  
    if (active === false) {
      deselectAllImages()
    }
  }, [images, isWebSearchActivated, active])

  if(active == false) return(
    <article className="closedImagesSlot" style={{marginTop:'0.75rem', cursor:'pointer'}} onClick={() => setActiveSlot("images")}>
      <h3>IMAGES
        <svg style={{marginLeft:'auto', transform:'translateY(1px)'}} width="16" height="10" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.0603 10.9405C10.4746 11.5258 9.52543 11.5258 8.93973 10.9405L1.30462 3.31105C0.359131 2.36626 1.02826 0.75 2.36489 0.75L17.6351 0.750001C18.9717 0.750002 19.6409 2.36627 18.6954 3.31105L11.0603 10.9405Z" fill="#353535"/>
        </svg>
      </h3>
    </article>
  )

  return(
    <article className="imagesSlot" style={{marginTop:'0.75rem', zIndex : 100}}>
        <h3>
          IMAGES{!isVisionModelActive && <span className='nPages' style={{color:"#870839bb", fontWeight:'500'}}>Select a Vision Agent</span>}
        </h3>
        <input ref={fileInputRef} onChange={handleFileSelect} type="file" data-testid="imageFileInput" style={{display: 'none'}}/>
        <div className="imagesContainer">
          {
            images?.map((image, index) => (<img onClick={() => handleImgClick(index)} onMouseEnter={() => handleMouseOverPicture(index)} onMouseOut={() => setHoveredImage(null)} className={selectedImagesIds.has(index) ? 'active purpleShadow' : ''} style={{width:'48px'}} src={'backend/images/' + image.filename} key={'img'+index} alt={image.filename}/>))

          }
          {
            nVignettesToFillRow(images.length) > 0 && Array(nVignettesToFillRow(images.length)).fill("").map((_,id) => (<div title="emptySlot" className='fillerMiniature' key={"blank"+id}></div>))
          }
        </div>
        <div className='buttonsContainer'>
          <div className="deleteSelected purpleShadow" onClick={handleDeleteSelectedImgClick}>
              <svg width="14" height="16" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#ffffff" d="M188 40H152V28C152 20.5739 149.05 13.452 143.799 8.20101C138.548 2.94999 131.426 0 124 0H76C68.5739 0 61.452 2.94999 56.201 8.20101C50.95 13.452 48 20.5739 48 28V40H12C8.8174 40 5.76516 41.2643 3.51472 43.5147C1.26428 45.7652 0 48.8174 0 52C0 55.1826 1.26428 58.2348 3.51472 60.4853C5.76516 62.7357 8.8174 64 12 64H16V200C16 205.304 18.1071 210.391 21.8579 214.142C25.6086 217.893 30.6957 220 36 220H164C169.304 220 174.391 217.893 178.142 214.142C181.893 210.391 184 205.304 184 200V64H188C191.183 64 194.235 62.7357 196.485 60.4853C198.736 58.2348 200 55.1826 200 52C200 48.8174 198.736 45.7652 196.485 43.5147C194.235 41.2643 191.183 40 188 40ZM72 28C72 26.9391 72.4214 25.9217 73.1716 25.1716C73.9217 24.4214 74.9391 24 76 24H124C125.061 24 126.078 24.4214 126.828 25.1716C127.579 25.9217 128 26.9391 128 28V40H72V28ZM160 196H40V64H160V196ZM88 96V160C88 163.183 86.7357 166.235 84.4853 168.485C82.2348 170.736 79.1826 172 76 172C72.8174 172 69.7652 170.736 67.5147 168.485C65.2643 166.235 64 163.183 64 160V96C64 92.8174 65.2643 89.7652 67.5147 87.5147C69.7652 85.2643 72.8174 84 76 84C79.1826 84 82.2348 85.2643 84.4853 87.5147C86.7357 89.7652 88 92.8174 88 96ZM136 96V160C136 163.183 134.736 166.235 132.485 168.485C130.235 170.736 127.183 172 124 172C120.817 172 117.765 170.736 115.515 168.485C113.264 166.235 112 163.183 112 160V96C112 92.8174 113.264 89.7652 115.515 87.5147C117.765 85.2643 120.817 84 124 84C127.183 84 130.235 85.2643 132.485 87.5147C134.736 89.7652 136 92.8174 136 96Z"/>
              </svg>
              Selected images
          </div>
          <button title="paste a screenshot from the clipboard" className="white" style={{marginLeft:'auto'}} onClick={handlePasteFromClipboardClick}>
            <svg style={{transform:'translate(-1px, 0px)'}} width="17" height="17" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 3C6 2.44772 6.44772 2 7 2H15C15.5523 2 16 2.44772 16 3V9C16 10.6569 14.6569 12 13 12H7C6.44772 12 6 11.5523 6 11V3ZM7 0C5.34315 0 4 1.34315 4 3V11C4 12.6569 5.34315 14 7 14H13C15.7614 14 18 11.7614 18 9V3C18 1.34315 16.6569 0 15 0H7ZM0 5V13C0 15.7614 2.23858 18 5 18H11V16H5C3.34315 16 2 14.6569 2 13V5H0Z" fill="#252525"/>
            </svg>
          </button>
          <button title="upload a new picture" className="purple purpleShadow" onClick={handleUploadButtonClick}>
              <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
          </button>
      </div>
      {hoveredImage && <ImagePreview imageSrc={'backend/images/' + hoveredImage.filename}/>}
    </article>
  )

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })
  }
}

function nVignettesToFillRow(nVignettes : number){
  return 5 - ((nVignettes) % 5)
}

export default ImagesSlot

interface IProps{
  active : boolean
  setActiveSlot : React.Dispatch<React.SetStateAction<"documents" | "images">>
}