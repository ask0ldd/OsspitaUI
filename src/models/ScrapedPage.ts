export default class ScrapedPage{
    #datas : string
    #source : string

    constructor(datas : string, source : string){
        this.#datas = datas
        this.#source = source
    }

    get datas(){ return this.#datas }

    get source(){return this.#source }

    setDatas(value : string){
        this.#datas = value
    }

    setSource(value : string) {
        this.#source = value
    }

    sourceAsHTMLSpan() : string { 
        return `<span class="source"><a href="${this.#source}">${this.#source}</a></span>`
    }
}