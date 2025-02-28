import IScrapedPage from "../../interfaces/IScrapedPage";
import IAIAgentPartialParams from "../../interfaces/params/IAIAgentPartialParams";
import { IAIModelParams } from "../../interfaces/params/IAIModelParams";
import TObserver from "../../interfaces/TObservers";
import { AIAgentNew } from "./AIAgentNew";

class AISearch extends AIAgentNew{
    #observers : TObserver[] = []
    #searchRequest : string

    constructor({
        id = "",
        name, 
        modelName = "llama3.1:8b", 
        systemPrompt = "You are an helpful assistant.", 
        temperature = 0.8, 
        mirostat = 0, 
        mirostat_eta = 0.1, 
        mirostat_tau = 5.0, 
        num_ctx = 2048,
        context = [],
        repeat_last_n = 64, 
        repeat_penalty = 1.1, 
        seed = 0,
        stop = ["\n", "user:", "AI assistant:"], 
        tfs_z = 1, 
        num_predict = 1024,
        top_k = 40,
        top_p = 0.9,
        type = "user_created",
        favorite = false,
        webSearchEconomy = false,
        min_p = 0.0,
        num_keep = 5,
        typical_p = 0.7,
        presence_penalty = 1.5,
        frequency_penalty = 1.0,
        penalize_newline = true,
        numa = false,
        num_batch = 2,
        num_gpu = 1,
        main_gpu = 0,
        low_vram = false,
        vocab_only = false,
        use_mmap = true,
        use_mlock = false,
        num_thread = 8,
        targetFilesNames = [],
        onUpdate = undefined,
        searchRequest,
    } : IAIModelParams & IAIAgentPartialParams & {searchRequest : string}){
        super({
            id,
            name,
            modelName, 
            systemPrompt, 
            temperature,
            mirostat,
            mirostat_eta,
            mirostat_tau,
            context,
            num_ctx,
            repeat_last_n,
            repeat_penalty,
            seed,
            stop,
            tfs_z,
            num_predict,
            top_k,
            top_p,
            type ,
            favorite,
            webSearchEconomy,
            min_p,
            num_keep,
            typical_p,
            presence_penalty,
            frequency_penalty,
            penalize_newline,
            numa,
            num_batch,
            num_gpu,
            main_gpu,
            low_vram,
            vocab_only,
            use_mmap,
            use_mlock,
            num_thread,
            targetFilesNames,
            onUpdate,
        })
        this.#searchRequest = searchRequest
    }

    addObserver(observer : TObserver ) {
        this.#observers.push(observer);
    }

    async update(data : string){
        try{
            const scrapedPages = this.retrieveScrapedPages(this.#searchRequest, data)

            // Validate the data structure
            if (!Array.isArray(scrapedPages)) {
                throw new Error('Invalid response format: Expected an array')
            }
            // !!! should summarize
            const aggregatedDatas = scrapedPages.reduce((prevValue, currentPage) => prevValue + currentPage.datas, "")
            this.notifyObservers(aggregatedDatas)
        }catch(error){
            console.error(error)
            throw error
        }
    }

    async retrieveScrapedPages(searchRequest : string, data : string) : Promise<IScrapedPage[]> {
        try{
            const response = await fetch('/backend/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query : searchRequest + data }),
            })
            // Check if the response is OK (status in the range 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status} : ${response.text()}`)
            }

            return response.json()
        }catch(error){
            console.error(error)
            throw error
        }
    }
}

export default AISearch