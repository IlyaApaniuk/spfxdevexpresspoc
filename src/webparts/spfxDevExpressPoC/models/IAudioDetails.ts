export interface IAudioDetails {
    url: string | null;
    blob: unknown | null;
    chunks: unknown | null;
    duration: IDuration;
}

export interface IDuration {
    h: number;
    m: number;
    s: number;
}
