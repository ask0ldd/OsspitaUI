/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react"
import { useServices } from "../../hooks/context/useServices"
import { IImage } from "../../interfaces/IImage"

function SettingsPanel(){

    const firstLoad = useRef(true)

    const { comfyUIService, imageService } = useServices()
    // const [imagesFilename, setImagesFilename] = useState<string[]>([])
    const [images, setImages] = useState<IImage[]>([])
    const [hoveredImage, setHoveredImage] = useState<IImage | null>()

    useEffect(()=>{
        if(!firstLoad.current) return
        refreshImages()
    }, [])

    async function refreshImages(){
        const imgs = await imageService.getAllGeneratedImages()
        setImages(imgs ?? [])
    }

    // !!! testing agent chain
    /*useEffect(() => {
        if(firstLoad.current == false) return

        async function effect(){

            const agentWriter = new AIAgentNew({name : "agentWriter", modelName : 'llama3.2:3b', systemPrompt : 'write a 50 lines short story with this theme : '})
            const agentSummarizer = new AIAgentNew({name : "agentSummarizer", modelName : 'llama3.2:3b', systemPrompt : 'summarize the following story in 5 lines : '})
            agentWriter.addObserver(agentSummarizer)
            const agentsChain = new AINodesChain({startNode : agentWriter, endNode : agentSummarizer})
            const result = agentsChain.process("heroic fantasy")
           
            // const semanticChunks = await DocProcessorService.semanticChunking(text, 0.7)

            // console.log(JSON.stringify(semanticChunks))
            // console.log(semanticChunks.length)
        }

        effect()

        firstLoad.current = false
    }, [])*/

    return(
        <article className='comingSoonContainer'>
            <span className='comingSoon' style={{textAlign:'center', width:'100%'}}>
                Coming Soon
            </span>
        </article>
    )
}

export default SettingsPanel

/*const startingRequest = `name of random langage of programmation. strict rule : provide only the name.`
// initiate the agents line
const agentLine = new AIAgentsLine([
    new AIAgent({name : "agentLg1", modelName : 'llama3.2:3b'}),
    new AIAgent({name : "agentLg2", modelName : 'llama3.2:3b'}),
    new AIAgent({name : "agentLg3", modelName : 'llama3.2:3b'}),
    new AIAgent({name : "agentLg4", modelName : 'llama3.2:3b'}),
])
const agentRank = new AIAgent({name : "agentRank", modelName : 'llama3.2:3b'})
const agentLove = new AIAgent({name : "agentLove", modelName : 'llama3.2:3b'})
// add the next agent as a line observer
agentLine.addObserver(agentRank)
// define the action of the agent once the line has produced a result
agentRank.onUpdate(async function (this : AIAgent, state) {
    console.log(JSON.stringify(state))
    const response = await this.ask("only reply to the question. which langage listed here is prefered by the average user : " + state)
    return response.response
})
agentRank.addObserver(agentLove)
agentLove.onUpdate(async function (this : AIAgent, state) {
    console.log(JSON.stringify(state))
    const response = await this.ask("say that you love this langage : " + state)
    console.log(response.response)
})
// ask the line to act
agentLine.update(startingRequest) // executing the whole line*/