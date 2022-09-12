import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
// eslint-disable-next-line import/named
import { IDropdownOption } from "@fluentui/react/lib/Dropdown";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SharePointService from "../../../services/SharePointService";
import useVoiceRecorder from "../../../hooks/useVoiceRecorder";
import Timer from "../Timer/Timer";
import { IRecord } from "../../../models/records/IRecord";

import styles from "./RecorderDialog.module.scss";
import Controls from "./Controls/Controls";
import Audio from "./Audio/Audio";

export interface IRecorderDialogProps {
    sharePointService: SharePointService;
    onClose: () => void;
    hideDialog: boolean;
    editableRecord?: IRecord | null;
}

const dialogContentProps = {
    type: DialogType.normal,
    showCloseButton: true
};

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

const RecorderDialog: React.FC<IRecorderDialogProps> = ({ editableRecord, sharePointService, hideDialog, onClose }) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const { status, time, onStart, onStop, onPause, onResume, onCancel } = useVoiceRecorder((recordedBlob: Blob) => dispatch({ type: "setBlob", payload: recordedBlob }));

    const onReset = () => {
        dispatch({ type: "reset" });
    };

    const uploadAudio = async () => {
        if (!editableRecord && !state.recordName) {
            dispatch({ type: "setNotification", payload: { message: strings.NotificationEmptyRecordName, status: false } });

            return;
        }
        dispatch({ type: "uploadingStart" });

        const file = new File([state.blob], editableRecord ? editableRecord.label : `${state.recordName}.${state.recordFormat?.text}`);
        const isUploaded = await sharePointService.uploadRecordFile(file, file.name, editableRecord?.id);

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

    const onRecordingStart = () => {
        try {
            onReset();
            onStart();
        } catch (ex) {
            dispatch({ type: "setNotification", payload: { message: (ex as Error).message, status: false } });
        }
    };

    const onDialogClose = () => {
        onCancel();
        onReset();
        onClose();
    };

    const onRecordNameChange = (event, newValue?: string) => dispatch({ type: "setRecordName", payload: newValue });
    const onRecordFormatChange = (event, option?: IDropdownOption) => dispatch({ type: "setRecordFormat", payload: option });
    const onShowAudio = () => (editableRecord || state.blob) && status !== "recording";
    const getAudioSrc = () => {
        return editableRecord && status !== "recorded" ? editableRecord.url : state.blob && window.URL.createObjectURL(state.blob);
    };

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
            dialogContentProps={{ ...dialogContentProps, title: editableRecord ? strings.EditRecordingDialogTitle : strings.NewRecordingDialogTitle }}
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
                            text={status === "recorded" || editableRecord ? strings.RerecordLabel : strings.StartRecordLabel}
                        />
                        <PrimaryButton
                            disabled={status === "idle" || status === "recorded"}
                            onClick={status === "paused" ? onResume : onPause}
                            text={status === "paused" ? strings.ResueRecordLabel : strings.PauseRecordLabel}
                        />
                        <DefaultButton disabled={status === "recorded" || status === "idle"} onClick={onStop} text={strings.StopRecordLabel} />
                    </div>
                    {status !== "idle" && status !== "recorded" && <Timer time={time} />}
                    {onShowAudio() && <Audio getAudioSrc={getAudioSrc} />}
                    {!editableRecord && (
                        <Controls
                            recordFormat={state.recordFormat}
                            recordName={state.recordName}
                            onRecordNameChange={onRecordNameChange}
                            onRecordFormatChange={onRecordFormatChange}
                        />
                    )}
                    {state.notification?.message && <div className={state.notification.status ? styles.success : styles.error}>{state.notification.message}</div>}
                </div>
            </div>
            <DialogFooter>
                <PrimaryButton disabled={editableRecord && status !== "recorded"} onClick={uploadAudio} text={strings.SaveRecordLabel} />
                <DefaultButton onClick={onDialogClose} text={strings.CancelRecordLabel} />
            </DialogFooter>
        </Dialog>
    );
};

export default RecorderDialog;
