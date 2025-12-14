export interface ITTSService {
  /** The SpeechSynthesis instance used for speaking control */
  synth: SpeechSynthesis;

  /** List of available speech synthesis voices */
  voices: SpeechSynthesisVoice[];

  /** Populates and returns a sorted list of available voices */
  populateVoiceList(): SpeechSynthesisVoice[];

  /** Speaks the provided text using the selected voice */
  speak(text: string): void;

  /** Resumes paused speech */
  resume(): void;

  /** Pauses speech output */
  pause(): void;

  /** Cancels any ongoing speech */
  stop(): void;

  /** Checks if speech synthesis is currently active */
  isPlaying(): boolean;
}
