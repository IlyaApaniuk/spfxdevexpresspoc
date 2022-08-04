import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { TextField } from "@fluentui/react/lib/TextField";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SharePointService from "../../services/SharePointService";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";

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

const RecorderDialog: React.FC<IRecorderDialogProps> = ({ uploadService, hideDialog, onClose }) => {
    const [blob, setBlob] = React.useState<Blob | null>(null);
    const { status, onStart, onStop, onPause, onResume, onCancel } = useVoiceRecorder((recordedBlob: Blob) => setBlob(recordedBlob));
    const [uploading, setUploading] = React.useState<boolean>(false);
    const [notification, setNotification] = React.useState<{ message: string; status?: boolean }>();
    const [recordName, setRecordName] = React.useState<string | null>(null);

    const onReset = () => {
        setNotification({ message: "" });
        setRecordName(null);
        setBlob(null);
    };

    const uploadAudio = async () => {
        if (!recordName) {
            setNotification({ message: strings.NotificationEmptyRecordName, status: false });

            return;
        }
        setUploading(true);
        setNotification({ message: "" });

        const file = new File([blob], recordName);
        const isUploaded = await uploadService.uploadFile(file, `${file.name}.mp3`);

        setNotification({
            message: isUploaded ? strings.NotificationUploadedSuccessfully : strings.NotificationUploadedFailed,
            status: isUploaded
        });

        setUploading(false);
        onReset();
        onClose();
    };

    const onRecordingStart = React.useCallback(() => {
        try {
            onStart();
        } catch (ex) {
            setNotification({ message: (ex as Error).message, status: false });
        }
    }, [onStart]);

    const onDialogClose = React.useCallback(() => {
        onCancel();
        onReset();
        onClose();
    }, [onClose, onCancel]);

    const onRecordNameChange = React.useCallback((e, newValue: string) => setRecordName(newValue), []);

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
                {uploading && (
                    <div className={styles.uploading}>
                        <Spinner size={SpinnerSize.large} />
                    </div>
                )}
                <div className={styles.recorderControlsWrapper}>
                    <div className={styles.recorderControls}>
                        <PrimaryButton
                            disabled={status === "recording" || status === "paused"}
                            onClick={onRecordingStart}
                            text={status === "recording" ? strings.RecordingLabel : strings.StartRecordLabel}
                        />
                        <PrimaryButton
                            disabled={status === "idle" || status === "recorded"}
                            onClick={status === "paused" ? onResume : onPause}
                            text={status === "paused" ? strings.ResueRecordLabel : strings.PauseRecordLabel}
                        />
                        <DefaultButton disabled={status === "recorded" || status === "idle"} onClick={onStop} text={strings.StopRecordLabel} />
                    </div>
                    {blob && (
                        <audio src={window.URL.createObjectURL(blob)} controls>
                            <track kind="captions" />
                        </audio>
                    )}
                    <TextField className={styles.recordNameTextField} label={strings.RecordNameTextFieldLabel} value={recordName} onChange={onRecordNameChange} />
                    {notification?.message && <div className={notification.status ? styles.success : styles.error}>{notification.message}</div>}
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
