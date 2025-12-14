import IGeneratedImage from "../../interfaces/IGeneratedImage"
import { IImage } from "../../interfaces/IImage"
import { IImageService } from "./interfaces/IImageService"

export default class ImageService implements IImageService{

    /**
     * Uploads an image using a FormData object.
     * 
     * @async
     * @param {FormData} formData - The form data containing the image file to upload.
     * @returns {Promise<IImage|undefined>} Resolves with the uploaded image object or undefined if the upload fails.
     */
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

    /**
     * Retrieves all images.
     * 
     * @async
     * @returns {Promise<IImage[]|undefined>} Resolves with an array of image objects or undefined if the request fails.
     */
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

    /**
     * Fetches an image by filename and returns its Base64-encoded contents.
     * 
     * @async
     * @param {string} filename - The filename of the image to fetch.
     * @returns {Promise<string|undefined>} Resolves with the Base64 string or undefined if the request fails.
     */
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

    /**
     * Deletes an image by its numeric ID.
     * 
     * @async
     * @param {number} imageId - The ID of the image to delete.
     * @returns {Promise<void|undefined>} Resolves when deletion is complete, or undefined if the request fails.
     */
    async deleteById(imageId : number): Promise<void | undefined>{
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

    /**
     * Retrieves all generated images.
     * 
     * @async
     * @returns {Promise<IGeneratedImage[]|undefined>} Resolves with an array of generated image objects or undefined if the request fails.
     */
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