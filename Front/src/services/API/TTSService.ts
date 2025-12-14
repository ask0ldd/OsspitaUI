/* c8 ignore start */

export default class TTSService{

    /**
     * Generates audio from the provided text using a backend TTS service.
     *
     * @async
     * @param {string} text - The text to convert to speech.
     * @returns {Promise<string|undefined>} A promise that resolves with the audio URL or data as a string,
     * or `undefined` if an error occurs.
     */
    static async generateAudio(text : string) : Promise<string | undefined>{
        try{
            const reponse = await fetch('/backend/tts/generate', {
                method : 'POST',
                body : JSON.stringify({text}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) return reponse.text()
        }catch(e){
            console.error(e)
        }
    }
}

/* c8 ignore stop */