import * as React from "react";

export interface IAudioProps {
    getAudioSrc: () => string;
}

const Audio: React.FC<IAudioProps> = ({ getAudioSrc }) => {
    return (
        <audio src={getAudioSrc()} controls preload="auto">
            <track kind="captions" />
        </audio>
    );
};

export default Audio;
