import * as React from "react";

interface IVoiceRecorderState {
    status: "paused" | "recording" | "recorded" | "idle";
}

type Actions = { type: "start" } | { type: "stop" } | { type: "pause" } | { type: "resume" } | { type: "cancel" };

const initialState: IVoiceRecorderState = {
    status: "idle"
};

const reducer = (state: IVoiceRecorderState, action: Actions): IVoiceRecorderState => {
    switch (action.type) {
        case "start":
            return { status: "recording" };
        case "stop":
            return { status: "recorded" };
        case "pause":
            return { status: "paused" };
        case "resume":
            return { status: "recording" };
        case "cancel":
            return { status: "idle" };
        default:
            return { ...state };
    }
};

const useVoiceRecorder = (callback: (blob: Blob) => void) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const chunks = React.useRef<Blob[]>([]);
    // dirty workaround
    const currentTime = React.useRef<number>(0);
    const currentRecorder = React.useRef<MediaRecorder | null>(null);
    const currentStream = React.useRef<MediaStream | null>(null);
    const [time, setTime] = React.useState<number>(currentTime.current);

    React.useEffect(() => {
        let interval = null;

        if (state.status === "recording") {
            interval = setInterval(() => {
                currentTime.current = currentTime.current + 10;
                setTime(currentTime.current);
            }, 10);
        } else {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval);
        };
    }, [state.status]);

    const finishRecording = mimeType => {
        const audioBlob = new Blob(chunks.current, { type: mimeType });

        callback(audioBlob);
    };

    const onTimeReset = () => {
        setTime(0);
        currentTime.current = 0;
    };

    const onStart = async (): Promise<void> => {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            return Promise.reject(new Error("mediaDevices API or getUserMedia method is not supported in this browser."));
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            dispatch({ type: "start" });
            currentRecorder.current = recorder;
            currentStream.current = stream;

            currentRecorder.current.addEventListener("dataavailable", event => {
                chunks.current.push(event.data);
            });
            currentRecorder.current.start();
        }
    };

    const onStop = () => {
        const mimeType = currentRecorder.current.mimeType;

        currentRecorder.current.addEventListener("stop", () => finishRecording(mimeType));
        currentRecorder.current.stop();
        currentStream.current.getTracks().forEach(track => track.stop());
        dispatch({ type: "stop" });
        chunks.current = [];
        onTimeReset();
    };

    const onPause = () => {
        currentRecorder.current.pause();
        dispatch({ type: "pause" });
    };

    const onResume = () => {
        currentRecorder.current.resume();
        dispatch({ type: "resume" });
    };

    const onCancel = () => {
        dispatch({ type: "cancel" });
        chunks.current = [];
        currentRecorder.current = null;
        currentStream.current = null;
    };

    return { status: state.status, time, onStart, onStop, onPause, onResume, onCancel };
};

export default useVoiceRecorder;
