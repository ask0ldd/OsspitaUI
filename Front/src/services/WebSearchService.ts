/* eslint-disable no-unused-private-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import IScrapedPage from "../interfaces/IScrapedPage";
import { AIAgent } from "../models/AIAgent";
import ScrapedPage from "../models/ScrapedPage";
import AgentService from "./API/AgentService";
import { IWebSearchService } from "./interfaces/IWebSearchService";

/**
 * Service for performing web search operations, including scraping and summarizing related data.
 * Utilizes AI agents for query optimization and content summarization.
 */
export class WebSearchService implements IWebSearchService{

    #abortController : AbortController = new AbortController()
    #signal = this.#abortController.signal
    #queryOptimizer! : AIAgent
    #scrapedDatasSummarizer! : AIAgent

    #isWebSearchSummarizationActivated = false

    /**
     * Scrapes web pages related to the given query and optionally summarizes the results.
     * @param {Object} params - Parameters for scraping.
     * @param {string} params.query - The search query.
     * @param {number} [params.maxPages=3] - Maximum number of pages to scrape.
     * @param {boolean} [params.summarize] - Whether to summarize the scraped data.
     * @returns {Promise<ScrapedPage[]|undefined>} Array of scraped pages or undefined if an error occurs.
     */
    async scrapeRelatedDatas({query , maxPages = 3} : {query : string, maxPages? : number, summarize? : boolean}) : Promise<ScrapedPage[] | undefined>{
        try{
            const optimizedQuery = await this.#optimizeQuery(query)
            const trimedQuery = this.#trimQuotes(optimizedQuery)
            const scrapedPages = await this.#callExternalScraper(trimedQuery, maxPages)
            if(!this.#isWebSearchSummarizationActivated) return scrapedPages
            const summarizedScrapedPages = await this.#summarizeScrapedPages(scrapedPages, query)
            return summarizedScrapedPages
        }catch(error){
            console.error('Error while trying to scrape the needed datas :', error)
            throw error
        }
    }

    /**
     * Calls the external scraper API to fetch web pages.
     * @param {string} query - The search query.
     * @param {number} [maxPages=3] - Maximum number of pages to scrape.
     * @returns {Promise<ScrapedPage[]>} Array of scraped pages.
     * @private
     */
    // !!! should be able to abort
    async #callExternalScraper(query : string, maxPages : number = 3) : Promise<ScrapedPage[]>{ // !!! make use of maxPages
        try {
            const response = await fetch('/backend/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query : query }),
                signal : this.#signal,
            })
    
            // Check if the response is OK (status in the range 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status} : ${response.text()}`)
            }
    
            const scrapedPages : IScrapedPage[] | unknown = await response.json()
    
            // Validate the data structure
            if (!Array.isArray(scrapedPages)) {
                throw new Error('Invalid response format: Expected an array')
            }
    
            // object mapping
            return scrapedPages.map(page => new ScrapedPage(page.datas, page.source, page.mostRecentDate))

        } catch (error) {
            console.error('Error calling the scraper API :', error)
            throw error
        }
    }

    /**
     * Optimizes the user query using an AI agent.
     * @param {string} query - The original search query.
     * @returns {Promise<string>} The optimized query string.
     * @private
     */
    async #optimizeQuery(query : string) : Promise<string> {
        try{
            console.log("**Optimizing your query**")
            const dbAgent = await new AgentService().getAgentByName('searchQueryOptimizer')
            if(dbAgent == null) throw new Error('No searchQueryOptimizer agent found')
            this.#queryOptimizer = new AIAgent({...dbAgent, modelName : dbAgent.model})
            return (await this.#queryOptimizer.ask(query)).response
        } catch (error) {
            console.error("Error calling the query optimizer : " + error)
            throw error
        }
    }

    /**
     * Summarizes the content of scraped pages using an AI agent so it will take less context.
     * @param {ScrapedPage[]} scrapedPages - Array of scraped pages to summarize.
     * @param {string} query - The original search query for context.
     * @returns {Promise<ScrapedPage[]>} Array of summarized scraped pages.
     * @private
     */
    async #summarizeScrapedPages(scrapedPages : ScrapedPage[], query : string) : Promise<ScrapedPage[]> {
        try{
            console.log("**Summarizing**")
            const dbAgent = await new AgentService().getAgentByName('scrapedDatasSummarizer')
            if(dbAgent == null) return scrapedPages
            const summarizedPages = [...scrapedPages]
            this.#scrapedDatasSummarizer = new AIAgent({...dbAgent, modelName : dbAgent.model})
            // console.log(this.#scrapedDatasSummarizer.getSystemPrompt())
            for (const page of summarizedPages) {
                // console.log('INITIAL DATA : ' + page.datas)
                page.setDatas(
                    (await this.#scrapedDatasSummarizer.ask(`Produce a summary with the following context :\n
                        <SCRAPEDDATAS>${page.datas}</SCRAPEDDATAS>\n
                        <REQUEST>${query}</REQUEST>\n
                    `)).response
                )
                // console.log('SUMMARY : ' + page.datas)
            }

            return summarizedPages
        } catch (error) {
            console.error("Error calling the summarizer : " + error)
            throw error
        }
    }

    /**
     * Removes leading and trailing quotes from a string.
     * @param {string} str - The input string.
     * @returns {string} The trimmed string.
     * @private
     */
    #trimQuotes(str : string) : string {
        return str.replace(/^['"]|['"]$/g, '').replace('"', " ").replace("'", " ")
    }

    /**
     * Aborts the last ongoing request and resets the abort controller.
     * Also aborts any ongoing requests in AI agents.
     * @returns {void}
     */
    abortLastRequest() : void{
        if(this.#abortController) this.#abortController.abort("Signal aborted.")
        if(this.#scrapedDatasSummarizer) this.#scrapedDatasSummarizer.abortLastRequest()
        if(this.#queryOptimizer) this.#queryOptimizer.abortLastRequest()
        // need to create a new abort controller and a new signal
        // or subsequent request will be aborted from the get go
        this.generateNewAbortControllerAndSignal()
    }

    /**
     * Generates a new abort controller and signal for subsequent requests.
     * @returns {void}
     */
    generateNewAbortControllerAndSignal() : void{
        this.#abortController = new AbortController()
        this.#signal = this.#abortController.signal
    }

    /**
     * Gets the current status of web search summarization.
     * @returns {boolean} True if summarization is activated, otherwise false.
     */
    getWebSearchSummarizationStatus() : boolean{
        return this.#isWebSearchSummarizationActivated
    }

    /**
     * Sets the status of web search summarization.
     * @param {boolean} status - True to activate summarization, false to deactivate.
     * @returns {void}
     */
    setWebSearchSummarizationStatus(status : boolean) : void{
        this.#isWebSearchSummarizationActivated = status
    }
}