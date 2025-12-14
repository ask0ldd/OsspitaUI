import { ITTSService } from "./interfaces/ITTSService";

export class TTSService implements ITTSService{

    synth = window.speechSynthesis
    voices : SpeechSynthesisVoice[] = []

    populateVoiceList() : SpeechSynthesisVoice[] {
        return this.synth.getVoices().sort(function (a, b) {
            const aname = a.name.toUpperCase();
            const bname = b.name.toUpperCase();
            if (aname < bname) {
            return -1;
            } else if (aname == bname) {
            return 0;
            } else {
            return +1;
            }
        })
    }

    constructor(){
        if(window.speechSynthesis) this.voices = this.populateVoiceList()
    }

    /* c8 ignore start */
    speak(text : string) {
        if (this.synth.speaking) {
            this.synth.cancel()
            console.error("speechSynthesis.speaking")
        }
      
        if (text !== "") {
            const utterThis = new SpeechSynthesisUtterance(text);
        
            utterThis.onend = function (event) {
                console.log("SpeechSynthesisUtterance.onend : " + event);
            };
        
            utterThis.onerror = function (event) {
                console.error("SpeechSynthesisUtterance.onerror" + event);
            };
        
            this.voices.forEach((voice) => {
                console.log(voice.name)
            })
            utterThis.voice = this.voices[0];

            /*utterThis.pitch = pitch.value;
            utterThis.rate = rate.value;*/
            this.synth.speak(utterThis);
        }
    }
    /* c8 ignore stop */

    resume(){
        this.synth.resume()
    }

    pause(){
        this.synth.pause()
    }

    stop(){
        this.synth.cancel()
    }

    isPlaying(){
        return this.synth.speaking
    }
}