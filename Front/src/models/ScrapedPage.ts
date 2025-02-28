export default class ScrapedPage{
    #datas : string
    #source : string
    readonly #mostRecentDate : string

    constructor(datas : string, source : string, mostRecentDate : string){
        this.#datas = datas
        this.#source = source
        this.#mostRecentDate = mostRecentDate
    }

    get mostRecentDate(){ return this.#mostRecentDate }

    get datas(){ return this.#datas }

    get source(){ return this.#source }

    setDatas(value : string){
        this.#datas = value
    }

    setSource(value : string) {
        this.#source = value
    }

    sourceAsHTMLSpan() : string { 
        return `<span class="source"><a target="_blank" rel="noopener noreferrer" href="${this.#source}">${this.#source}</a></span>`
    }
}
