interface ICharacterResponse {
    name: string;
    portrait: string;
    genres: string[];
    mbti: string;
    coreIdentity: string;
    appearance: string;
    socialCircle?: string;
}

export default ICharacterResponse