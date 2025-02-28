/* eslint-disable @typescript-eslint/no-unused-vars */
import './GalleryPanel.css'
import { useState } from 'react'
import DefaultSlotButtonsGroup from '../LeftPanel/DefaultSlotButtonsGroup'
import IGeneratedImage from '../../interfaces/IGeneratedImage'

function GalleryPanel({images, setHoveredImage} : IProps) {

    const [searchTerm, setSearchTerm] = useState<string>("")

    /*useEffect(() => {
        console.table(images)
    }, [images])*/

    function handleMouseOverPicture(index : number){
        setHoveredImage(images[index] ?? null)
    }

    async function handleDownloadClick(e : React.MouseEvent){
        // console.log((e.target as HTMLImageElement).src)
        try {
            const response = await fetch((e.target as HTMLImageElement).src)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'image.jpg'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          } catch (error) {
            console.error('Error downloading image:', error)
          }
    }

    function handleSearchTermChange(event : React.ChangeEvent): void {
            // resetActivePage()
            setSearchTerm(() => ((event.target as HTMLInputElement).value))
        }
    
        function handleEmptySearchTermClick() : void {
            setSearchTerm("")
        }

    async function handlePageChange(){
        
    }

    return(
        <article className='galleryPanel'>
            <h3>
                GALLERY
            </h3>
            <div className="searchGalleryContainer">
                <div title="search" className="searchContainer">
                    <input autoFocus type="text" value={searchTerm} onChange={handleSearchTermChange} placeholder="Search"/>
                    {searchTerm == "" ? 
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M2.2886 6.86317C2.2886 5.64968 2.77065 4.4859 3.62872 3.62784C4.48678 2.76978 5.65056 2.28772 6.86404 2.28772C8.07753 2.28772 9.24131 2.76978 10.0994 3.62784C10.9574 4.4859 11.4395 5.64968 11.4395 6.86317C11.4395 8.07665 10.9574 9.24043 10.0994 10.0985C9.24131 10.9566 8.07753 11.4386 6.86404 11.4386C5.65056 11.4386 4.48678 10.9566 3.62872 10.0985C2.77065 9.24043 2.2886 8.07665 2.2886 6.86317ZM6.86404 1.29784e-07C5.7839 -0.000137709 4.71897 0.254672 3.75588 0.743706C2.79278 1.23274 1.95871 1.94219 1.32149 2.81435C0.68428 3.68652 0.26192 4.69677 0.0887629 5.76294C-0.0843938 6.82911 -0.00345731 7.9211 0.32499 8.9501C0.653437 9.9791 1.22012 10.916 1.97895 11.6847C2.73778 12.4534 3.66733 13.0322 4.692 13.3739C5.71667 13.7156 6.80753 13.8106 7.87585 13.6512C8.94417 13.4918 9.95979 13.0826 10.8401 12.4566L14.0624 15.6789C14.2781 15.8873 14.567 16.0026 14.867 16C15.1669 15.9974 15.4538 15.8771 15.6658 15.665C15.8779 15.4529 15.9982 15.166 16.0008 14.8661C16.0034 14.5662 15.8881 14.2772 15.6798 14.0615L12.4587 10.8404C13.1888 9.8136 13.6222 8.60567 13.7113 7.34894C13.8005 6.09221 13.542 4.83518 12.9642 3.7156C12.3864 2.59602 11.5116 1.6571 10.4356 1.00171C9.35958 0.346316 8.12393 -0.000244844 6.86404 1.29784e-07Z" fill="#6D48C1"/>
                        </svg>
                        :<svg onClick={handleEmptySearchTermClick} width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                        </svg>
                    }
                </div>
            </div>
            <div className='galleryContainer'>
                {images.filter(image => image?.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true).map((image : IGeneratedImage, index : number) => (<img onClick={handleDownloadClick} onMouseOut={() => setHoveredImage(null)} onMouseEnter={() => handleMouseOverPicture(index)} key={index + "-comfyimg"} src={'backend/images/generated/' + image.filename}/>))}
                {
                    nVignettesToFillRow(images.length) > 0 && Array(nVignettesToFillRow(images.length)).fill("").map((_,id) => (<div title="emptySlot" className='fillerMiniature' key={"blank"+id}></div>))
                }
            </div>
            <div className='buttonsContainer'>
                <div className="deleteSelected purpleShadow">
                    <svg width="14" height="16" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#ffffff" d="M188 40H152V28C152 20.5739 149.05 13.452 143.799 8.20101C138.548 2.94999 131.426 0 124 0H76C68.5739 0 61.452 2.94999 56.201 8.20101C50.95 13.452 48 20.5739 48 28V40H12C8.8174 40 5.76516 41.2643 3.51472 43.5147C1.26428 45.7652 0 48.8174 0 52C0 55.1826 1.26428 58.2348 3.51472 60.4853C5.76516 62.7357 8.8174 64 12 64H16V200C16 205.304 18.1071 210.391 21.8579 214.142C25.6086 217.893 30.6957 220 36 220H164C169.304 220 174.391 217.893 178.142 214.142C181.893 210.391 184 205.304 184 200V64H188C191.183 64 194.235 62.7357 196.485 60.4853C198.736 58.2348 200 55.1826 200 52C200 48.8174 198.736 45.7652 196.485 43.5147C194.235 41.2643 191.183 40 188 40ZM72 28C72 26.9391 72.4214 25.9217 73.1716 25.1716C73.9217 24.4214 74.9391 24 76 24H124C125.061 24 126.078 24.4214 126.828 25.1716C127.579 25.9217 128 26.9391 128 28V40H72V28ZM160 196H40V64H160V196ZM88 96V160C88 163.183 86.7357 166.235 84.4853 168.485C82.2348 170.736 79.1826 172 76 172C72.8174 172 69.7652 170.736 67.5147 168.485C65.2643 166.235 64 163.183 64 160V96C64 92.8174 65.2643 89.7652 67.5147 87.5147C69.7652 85.2643 72.8174 84 76 84C79.1826 84 82.2348 85.2643 84.4853 87.5147C86.7357 89.7652 88 92.8174 88 96ZM136 96V160C136 163.183 134.736 166.235 132.485 168.485C130.235 170.736 127.183 172 124 172C120.817 172 117.765 170.736 115.515 168.485C113.264 166.235 112 163.183 112 160V96C112 92.8174 113.264 89.7652 115.515 87.5147C117.765 85.2643 120.817 84 124 84C127.183 84 130.235 85.2643 132.485 87.5147C134.736 89.7652 136 92.8174 136 96Z"/>
                    </svg>
                    Selected images
                </div>
                <DefaultSlotButtonsGroup handlePageChange={handlePageChange}/>
            </div>
        </article>
    )
}

function nVignettesToFillRow(nImages : number){
    return 28 - ((nImages) % 4)
}

export default GalleryPanel

interface IProps{
    images : IGeneratedImage[]
    setHoveredImage : React.Dispatch<React.SetStateAction<IGeneratedImage | null | undefined>>
}