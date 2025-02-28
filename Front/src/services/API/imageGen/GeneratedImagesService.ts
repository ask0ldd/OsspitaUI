import { IImage } from "../../../interfaces/IImage"

class GeneratedImagesService{
    async getAll() : Promise<IImage[] | undefined>{
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

    async upload(formData : FormData): Promise<IImage | undefined>{
        try{
            // !!!!!!! check formdata content
            // formData.append("generated", "true")
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
}

export default GeneratedImagesService