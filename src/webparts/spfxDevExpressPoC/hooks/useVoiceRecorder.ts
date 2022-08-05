import * as React from "react";

interface IVoiceRecorderState {
    status: "paused" | "recording" | "recorded" | "idle";
    mediaRecorder: MediaRecorder | null;
    streamBeingCaptured: MediaStream | null;
}

type Actions =
    | { type: "start"; payload: MediaRecorder }
    | { type: "stream"; payload: MediaStream }
    | { type: "stop" }
    | { type: "pause" }
    | { type: "resume" }
    | { type: "cancel" };

const initialState: IVoiceRecorderState = {
    status: "idle",
    mediaRecorder: null,
    streamBeingCaptured: null
};

const reducer = (state: IVoiceRecorderState, action: Actions): IVoiceRecorderState => {
    switch (action.type) {
        case "start":
            return { ...state, status: "recording", mediaRecorder: action.payload };
        case "stream":
            return { ...state, streamBeingCaptured: action.payload };
        case "stop":
            return { ...state, status: "recorded", mediaRecorder: null, streamBeingCaptured: null };
        case "pause":
            return { ...state, status: "paused" };
        case "resume":
            return { ...state, status: "recording" };
        case "cancel":
            return { ...state, status: "idle" };
        default:
            return { ...state };
    }
};

const useVoiceRecorder = (callback: (blob: Blob) => void) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const chunks = React.useRef<Blob[]>([]);
    // dirty workaround for timer
    const currentTime = React.useRef<number>(0);
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

    const finishRecording = React.useCallback(
        mimeType => {
            const audioBlob = new Blob(chunks.current, { type: mimeType });

            callback(audioBlob);
        },
        [callback]
    );

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

            dispatch({ type: "start", payload: recorder });
            dispatch({ type: "stream", payload: stream });

            recorder.addEventListener("dataavailable", event => {
                chunks.current.push(event.data);
            });
            recorder.start();
        }
    };

    const onStop = () => {
        const mimeType = state.mediaRecorder.mimeType;

        state.mediaRecorder.addEventListener("stop", () => finishRecording(mimeType));
        state.mediaRecorder.stop();
        state.streamBeingCaptured.getTracks().forEach(track => track.stop());
        dispatch({ type: "stop" });
        chunks.current = [];
        onTimeReset();
    };

    const onPause = () => {
        state.mediaRecorder.pause();
        dispatch({ type: "pause" });
    };

    const onResume = () => {
        state.mediaRecorder.resume();
        dispatch({ type: "resume" });
    };

    const onCancel = () => {
        dispatch({ type: "cancel" });
        chunks.current = [];
    };

    return { status: state.status, time, onStart, onStop, onPause, onResume, onCancel };
};

export default useVoiceRecorder;
