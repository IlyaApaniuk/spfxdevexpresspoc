import * as React from "react";
import { Recorder } from "react-voice-recorder";
import "react-voice-recorder/dist/index.css";

import { IAudioDetails } from "../../models/IAudioDetails";

export interface IRecorderWrapperProps {
    onAudioUpload: (file: File) => void;
    onReset: () => void;
}

const RecorderWrapper: React.FC<IRecorderWrapperProps> = ({ onAudioUpload, onReset }) => {
    // predefined value needs to make Recorder works properly
    const [audioDetails, setAudioDetails] = React.useState<IAudioDetails>({
        url: null,
        blob: null,
        chunks: null,
        duration: {
            h: 0,
            m: 0,
            s: 0
        }
    });

    const handleAudioStop = (data: IAudioDetails) => {
        setAudioDetails(data);
    };

    const handleAudioUpload = (file: File) => {
        onAudioUpload(file);
    };

    const handleReset = () => {
        onReset();
        setAudioDetails({
            url: null,
            blob: null,
            chunks: null,
            duration: {
                h: 0,
                m: 0,
                s: 0
            }
        });
    };

    return (
        <Recorder
            record={true}
            hideHeader
            audioURL={audioDetails?.url}
            showUIAudio
            handleAudioStop={handleAudioStop}
            handleAudioUpload={(file: File) => handleAudioUpload(file)}
            handleReset={handleReset}
        />
    );
};

export default RecorderWrapper;
