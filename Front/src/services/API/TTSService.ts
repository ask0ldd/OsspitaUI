/* c8 ignore start */

export default class TTSService{

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