import * as React from "react";

interface IVoiceRecorderState {
    status: "paused" | "recording" | "recorded" | "idle";
    mediaRecorder: MediaRecorder | null;
}

type Actions = { type: "start"; payload: MediaRecorder } | { type: "stop" } | { type: "pause" } | { type: "resume" } | { type: "cancel" };

const initialState: IVoiceRecorderState = {
    status: "idle",
    mediaRecorder: null
};

const reducer = (state: IVoiceRecorderState, action: Actions): IVoiceRecorderState => {
    switch (action.type) {
        case "start":
            return { ...state, status: "recording", mediaRecorder: action.payload };
        case "stop":
            return { ...state, status: "recorded", mediaRecorder: null };
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

    const finishRecording = React.useCallback(
        mimeType => {
            const audioBlob = new Blob(chunks.current, { type: mimeType });

            callback(audioBlob);
        },
        [callback]
    );

    const onStart = async (): Promise<void> => {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            return Promise.reject(new Error("mediaDevices API or getUserMedia method is not supported in this browser."));
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            dispatch({ type: "start", payload: recorder });

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
        dispatch({ type: "stop" });
        chunks.current = [];
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

    return { status: state.status, onStart, onStop, onPause, onResume, onCancel };
};

export default useVoiceRecorder;
