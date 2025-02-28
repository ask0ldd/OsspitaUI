import { useNavigate } from 'react-router-dom'
import './RightPanel3.css'
import GalleryPanel from './GalleryPanel'
import IGeneratedImage from '../../interfaces/IGeneratedImage'
import ImageGenRightMenu from './ImageGenRightMenu'

function ImageGenRightPanel({images, setHoveredImage} : IProps){

    const navigate = useNavigate()

    function handleMenuItemClick(item : string){
        if(item === "agent" || item === "chain" || item === "settings" || item === "roleplay") {
            navigate('/chat')
        }
    }

    return(
        <aside className="rightDrawer">
            <ImageGenRightMenu handleMenuItemClick={handleMenuItemClick} isStreaming={false}/>
            {/*<article className='settingsFormContainer'>
                <label>Active Workflow</label>
            </article>*/}
            <GalleryPanel images={images} setHoveredImage={setHoveredImage}/>
        </aside>
    )
}

export default ImageGenRightPanel

interface IProps{
    images : IGeneratedImage[]
    setHoveredImage : React.Dispatch<React.SetStateAction<IGeneratedImage | null | undefined>>
}