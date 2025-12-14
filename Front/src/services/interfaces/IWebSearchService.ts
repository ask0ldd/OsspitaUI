import ScrapedPage from "../../models/ScrapedPage";

export interface IWebSearchService {
  /**
   * Scrapes web pages related to the given query and optionally summarizes the results.
   * @param params - Parameters for scraping.
   * @param params.query - The search query.
   * @param params.maxPages - Maximum number of pages to scrape.
   * @param params.summarize - Whether to summarize the scraped data.
   * @returns A promise resolving to an array of scraped pages or undefined if an error occurs.
   */
  scrapeRelatedDatas(params: {
    query: string;
    maxPages?: number;
    summarize?: boolean;
  }): Promise<ScrapedPage[] | undefined>;

  /**
   * Aborts the last ongoing request and resets the abort controller.
   */
  abortLastRequest(): void;

  /**
   * Generates a new abort controller and signal for subsequent requests.
   */
  generateNewAbortControllerAndSignal(): void;

  /**
   * Gets the current status of web search summarization.
   * @returns True if summarization is activated, otherwise false.
   */
  getWebSearchSummarizationStatus(): boolean;

  /**
   * Sets the status of web search summarization.
   * @param status - True to activate summarization, false to deactivate.
   */
  setWebSearchSummarizationStatus(status: boolean): void;
}
