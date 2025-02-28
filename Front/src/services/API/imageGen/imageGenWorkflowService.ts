import { IComfyWorklowResponse } from "../../../interfaces/responses/IComfyWorklowResponse"

export default class ImageGenWorkflowService{
    async getDefault() : Promise<IComfyWorklowResponse | undefined>{
        try {
            const response = await fetch("/backend/imagegen/workflow", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching the target prompt : ", error)
            return undefined
        }
    }

    async getAll() : Promise<IComfyWorklowResponse[] | undefined>{
        try {
            const response = await fetch("/backend/imagegen/workflows", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching the target prompt : ", error)
            return undefined
        }
    }
}