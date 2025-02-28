import IGeneratedImage from "../../interfaces/IGeneratedImage"
import { IImage } from "../../interfaces/IImage"

export default class ImageService{
    async upload(formData : FormData): Promise<IImage | undefined>{
        try{
            // !!!!!!! check formdata content
            const response = await fetch('backend/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        }catch(e){
            console.error(e)
        }
    }

    async getAll() : Promise<IImage[] | undefined>{
        try {
            const response = await fetch("/backend/images", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching images list : ", error)
            return undefined
        }
    }

    async getImageAsBase64(filename : string) : Promise<string | undefined>{
        try{
        const response = await fetch('/backend/images/' + filename)
        const imageBlob = await response.blob()
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Failed to convert image to base64'));
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
          });
        } catch (error) {
            console.error("Error fetching image : ", error)
            return undefined
        }
    }

    async deleteById(imageId : number){
        try {
            const response = await fetch("/backend/image/byId/" + imageId, {
                method:"DELETE"
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

        } catch (error) {
            console.error("Error deleting the target image : ", error)
            return undefined
        }
    }

    async getAllGeneratedImages() : Promise<IGeneratedImage[] | undefined>{
        try {
            const response = await fetch("/backend/generated", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching images list : ", error)
            return undefined
        }
    }

}