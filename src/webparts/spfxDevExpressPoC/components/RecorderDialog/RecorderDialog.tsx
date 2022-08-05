import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { TextField } from "@fluentui/react/lib/TextField";
// eslint-disable-next-line import/named
import { Dropdown, IDropdownOption } from "@fluentui/react/lib/Dropdown";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SharePointService from "../../services/SharePointService";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import Timer from "../Timer/Timer";

import styles from "./RecorderDialog.module.scss";

export interface IRecorderDialogProps {
    uploadService: SharePointService;
    onClose: () => void;
    hideDialog: boolean;
}

const dialogContentProps = {
    type: DialogType.normal,
    title: strings.DialogTitle,
    showCloseButton: true
};

const audioTypes: IDropdownOption[] = [
    { key: "wav", text: "wav" },
    { key: "mp3", text: "mp3" }
];

interface IRecorderDialogState {
    blob: Blob | null;
    uploading: boolean;
    notification: { message: string; status?: boolean } | null;
    recordName: string | null;
    recordFormat: IDropdownOption | null;
}

type Actions =
    | { type: "setUploading"; payload: boolean }
    | { type: "setBlob"; payload: Blob | null }
    | { type: "setNotification"; payload: { message: string; status?: boolean } | null }
    | { type: "setRecordName"; payload: string | null }
    | { type: "setRecordFormat"; payload: IDropdownOption | null }
    | { type: "reset" }
    | { type: "uploadingStart" }
    | { type: "uploadingFinished"; payload: { message: string; status?: boolean } };

const initialState: IRecorderDialogState = {
    blob: null,
    uploading: false,
    notification: null,
    recordName: null,
    recordFormat: null
};

const reducer = (state: IRecorderDialogState, action: Actions): IRecorderDialogState => {
    switch (action.type) {
        case "setBlob":
            return { ...state, blob: action.payload };
        case "setUploading":
            return { ...state, uploading: action.payload };
        case "setNotification":
            return { ...state, notification: action.payload };
        case "setRecordName":
            return { ...state, recordName: action.payload };
        case "setRecordFormat":
            return { ...state, recordFormat: action.payload };
        case "reset":
            return { ...state, blob: null, uploading: false, notification: null, recordName: null, recordFormat: null };
        case "uploadingStart":
            return { ...state, uploading: true, notification: null };
        case "uploadingFinished":
            return { ...state, uploading: false, notification: action.payload };
        default:
            return { ...state };
    }
};

const RecorderDialog: React.FC<IRecorderDialogProps> = ({ uploadService, hideDialog, onClose }) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const { status, time, onStart, onStop, onPause, onResume, onCancel } = useVoiceRecorder((recordedBlob: Blob) => dispatch({ type: "setBlob", payload: recordedBlob }));

    const onReset = () => {
        dispatch({ type: "reset" });
    };

    const uploadAudio = async () => {
        if (!state.recordName) {
            dispatch({ type: "setNotification", payload: { message: strings.NotificationEmptyRecordName, status: false } });

            return;
        }
        dispatch({ type: "uploadingStart" });

        const file = new File([state.blob], state.recordName);
        const isUploaded = await uploadService.uploadFile(file, `${file.name}.${state.recordFormat?.text}`);

        dispatch({
            type: "uploadingFinished",
            payload: {
                message: isUploaded ? strings.NotificationUploadedSuccessfully : strings.NotificationUploadedFailed,
                status: isUploaded
            }
        });

        if (isUploaded) {
            onReset();
            onClose();
        }
    };

    const onRecordingStart = React.useCallback(() => {
        try {
            onReset();
            onStart();
        } catch (ex) {
            dispatch({ type: "setNotification", payload: { message: (ex as Error).message, status: false } });
        }
    }, [onStart]);

    const onDialogClose = React.useCallback(() => {
        onCancel();
        onReset();
        onClose();
    }, [onClose, onCancel]);

    const onRecordNameChange = React.useCallback((event, newValue?: string) => dispatch({ type: "setRecordName", payload: newValue }), []);
    const onRecordFormatChange = React.useCallback((event, option?: IDropdownOption) => dispatch({ type: "setRecordFormat", payload: option }), []);

    return (
        <Dialog
            styles={{
                main: {
                    ["@media (min-width: 640px)"]: {
                        width: 450,
                        minWidth: 450
                    },
                    ["@media (min-width: 1007px"]: {
                        width: 500,
                        minWidth: 500
                    }
                }
            }}
            minWidth={600}
            hidden={hideDialog}
            dialogContentProps={dialogContentProps}
            onDismiss={onDialogClose}
        >
            <div className={styles.recorderDialogWrapper}>
                {state.uploading && (
                    <div className={styles.uploading}>
                        <Spinner size={SpinnerSize.large} />
                    </div>
                )}
                <div className={styles.recorderControlsWrapper}>
                    <div className={styles.recorderControls}>
                        <PrimaryButton
                            disabled={status === "recording" || status === "paused"}
                            onClick={onRecordingStart}
                            text={status === "recorded" ? strings.RerecordLabel : strings.StartRecordLabel}
                        />
                        <PrimaryButton
                            disabled={status === "idle" || status === "recorded"}
                            onClick={status === "paused" ? onResume : onPause}
                            text={status === "paused" ? strings.ResueRecordLabel : strings.PauseRecordLabel}
                        />
                        <DefaultButton disabled={status === "recorded" || status === "idle"} onClick={onStop} text={strings.StopRecordLabel} />
                    </div>
                    {status !== "idle" && status !== "recorded" && <Timer time={time} />}
                    {state.blob && (
                        <audio src={window.URL.createObjectURL(state.blob)} controls preload="auto">
                            <track kind="captions" />
                        </audio>
                    )}
                    <div className={styles.recordName}>
                        <TextField className={styles.recordNameTextField} label={strings.RecordNameTextFieldLabel} value={state.recordName} onChange={onRecordNameChange} />
                        <Dropdown options={audioTypes} selectedKey={state.recordFormat?.key} label={strings.RecordFormatDropdownLabel} onChange={onRecordFormatChange} />
                    </div>
                    {state.notification?.message && <div className={state.notification.status ? styles.success : styles.error}>{state.notification.message}</div>}
                </div>
            </div>
            <DialogFooter>
                <PrimaryButton onClick={uploadAudio} text={strings.SaveRecordLabel} />
                <DefaultButton onClick={onDialogClose} text={strings.CancelRecordLabel} />
            </DialogFooter>
        </Dialog>
    );
};

export default RecorderDialog;
