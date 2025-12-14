/* eslint-disable no-unused-private-class-members */
import { marked } from "marked"
import { IAnswerFormattingService } from "./interfaces/IAnswerFormatingService"

/**
 * Service for formatting answer strings.
 * - Strips unnecessary code block syntax.
 * - Converts Markdown to HTML.
 * - Transforms code blocks and emojis to custom HTML/SVG.
 */
class AnswerFormatingService implements IAnswerFormattingService{

    /**
     * Formats an answer string.
     * @param {string} answer - The answer text in Markdown.
     * @returns {Promise<string>} - The formatted HTML string.
     */
    async format(answer : string) : Promise<string>{
        const answerWithCodeBlockSyntaxStriped = this.#stripCodeBlockSyntax(answer)
        const answerWithMarkdownConvertedToHTML = await marked(answerWithCodeBlockSyntaxStriped)
        const answerWithCodeFormated = this.#codetransformer(answerWithMarkdownConvertedToHTML)
        return this.#emojitransformer(answerWithCodeFormated)
    }

    /**
     * Transforms code blocks in HTML to custom HTML structure.
     * @private
     * @param {string} text - The HTML text containing code blocks.
     * @returns {string} - The HTML with code blocks transformed.
     */
    #codetransformer(text : string) : string {
        const formatedText = text.replace(/(<pre><code([\s\S]*?)>[\s\S]*?<\/code><\/pre>)/g, (_, codeContent, languageNJunk) => {
            const language = languageNJunk ? this.#capitalizeFirstLetter(languageNJunk.split('-')[1]).replace('"', "") : undefined
            if(language === undefined || language === 'Markdown') {
                return `<div class="textBlock">
                            <div class="body">${codeContent}</div>
                        </div>`
            } 
            return `<div class="codeBlock">
                        <div class="title">Code<span style="margin-left:auto; padding-right:0.5rem">${language}</span></div>
                        <div class="body" onClick="((event) => {if(event.currentTarget) navigator.clipboard.writeText(event.currentTarget.innerText)})(event)">${codeContent}</div>
                    </div>`
        })
        return formatedText
    }

    /**
     * Removes specific Markdown code block syntax from the text.
     * @private
     * @param {string} text - The input text.
     * @returns {string} - The cleaned text.
     */
    #stripCodeBlockSyntax(text : string) : string {
        return text.replace(/```markdown/g, "").replace(/```\n\n/g, "```\n")
    }

    #emojisReplacementSVG = {
        check : `<svg class="check" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>`,
        xmark : `<svg class="xmark" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`,
        star : `<svg class="star" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>`,
        emptystar : `<svg class="emptystar" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"/></svg>`,
        exclamation : `<svg class="exclamation" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512"><path d="M96 64c0-17.7-14.3-32-32-32S32 46.3 32 64l0 256c0 17.7 14.3 32 32 32s32-14.3 32-32L96 64zM64 480a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/></svg>`,
        questionmark : `<svg class="questionmark" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M80 160c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74l0 1.4c0 17.7 14.3 32 32 32s32-14.3 32-32l0-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7l0-3.6c0-70.7-57.3-128-128-128l-32 0C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/></svg>`,
    }

    /**
     * Replaces emoji characters in text with SVG HTML.
     * @private
     * @param {string} text - The input HTML/text.
     * @returns {string} - The text with emojis replaced by SVG.
     */
    #emojitransformer(text : string) : string {
        
        const charMap: CharMap = {
        '✅': this.#emojisReplacementSVG.check,
        '★': this.#emojisReplacementSVG.star,
        '❌': this.#emojisReplacementSVG.xmark,
        '⭐': this.#emojisReplacementSVG.star,
        '☆': this.#emojisReplacementSVG.emptystar,
        '❗': this.#emojisReplacementSVG.exclamation,
        '⚠️': '!',
        '❓': this.#emojisReplacementSVG.questionmark
        };
        
        const regex: RegExp = new RegExp(Object.keys(charMap).join('|'), 'g')
          
        return text.replace(regex, (match: string): string => charMap[match] || match)
    }

    /**
     * Capitalizes the first letter of the input string.
     * @private
     * @param {string} text - The input string.
     * @returns {string} - The capitalized string.
     */
    #capitalizeFirstLetter(text : string) : string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

}

export default AnswerFormatingService

interface CharMap {
    [key: string]: string;
}

// code regex (?:^|\n)(?:\s*(?:[\w.]+\s*(?:\(.*?\))?\s*(?:->|=>)?\s*(?:\{|\:)|\b(?:function|def|class|if|for|while|switch)\b|\#|\$|\/\/|\/\*|\*\/|<\?php|\?>|import\s+[\w.]+|from\s+[\w.]+\s+import))
// static regexRepository = new Map<string, string>().set("incomplete code block", "/<code>.*$/").set("complete code block", "/<code>.*?</code>/")