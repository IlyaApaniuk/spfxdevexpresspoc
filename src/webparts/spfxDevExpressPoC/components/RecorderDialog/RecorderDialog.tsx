import * as React from "react";
import { Dialog, DialogType } from "@fluentui/react/lib/Dialog";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { TextField } from "@fluentui/react/lib/TextField";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SharePointService from "../../services/SharePointService";
import RecorderWrapper from "../RecorderWrapper/RecorderWrapper";

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
    const [uploading, setUploading] = React.useState<boolean>(false);
    const [notification, setNotification] = React.useState<{ message: string; status?: boolean }>();
    const [recordName, setRecordName] = React.useState<string | null>(null);

    const uploadAudio = async (file: File) => {
        if (!recordName) {
            setNotification({ message: strings.NotificationEmptyRecordName, status: false });

            return;
        }
        setUploading(true);
        setNotification({ message: "" });

        const isUploaded = await uploadService.uploadFile(file, `${recordName}.mp3`);

        setNotification({
            message: isUploaded ? strings.NotificationUploadedSuccessfully : strings.NotificationUploadedFailed,
            status: isUploaded
        });

        setUploading(false);
    };

    const onReset = () => {
        setNotification({ message: "" });
        setRecordName(null);
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
            dialogContentProps={dialogContentProps}
            onDismiss={() => {
                onClose();
                onReset();
            }}
        >
            <div className={styles.recorderDialogWrapper}>
                {uploading && (
                    <div className={styles.uploading}>
                        <Spinner size={SpinnerSize.large} />
                    </div>
                )}
                <div className={styles.recordName}>
                    <TextField label={strings.RecordNameTextFieldLabel} value={recordName} onChange={(e, newValue: string) => setRecordName(newValue)} />
                </div>
                <RecorderWrapper onAudioUpload={uploadAudio} onReset={onReset} />
                {notification?.message && <div className={notification.status ? styles.success : styles.error}>{notification.message}</div>}
            </div>
        </Dialog>
    );
};

export default RecorderDialog;
