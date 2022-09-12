import * as React from "react";
import { TextField } from "@fluentui/react/lib/TextField";
// eslint-disable-next-line import/named
import { Dropdown, IDropdownOption } from "@fluentui/react/lib/Dropdown";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import styles from "./Controls.module.scss";

export interface IControlsProps {
    recordName: string | null;
    recordFormat: IDropdownOption | null;
    onRecordNameChange: (event, newValue?: string) => void;
    onRecordFormatChange: (event, option?: IDropdownOption) => void;
}

const audioTypes: IDropdownOption[] = [
    { key: "wav", text: "wav" },
    { key: "mp3", text: "mp3" }
];

const Controls: React.FC<IControlsProps> = ({ onRecordFormatChange, onRecordNameChange, recordFormat, recordName }) => {
    return (
        <div className={styles.recordName}>
            <TextField className={styles.recordNameTextField} label={strings.RecordNameTextFieldLabel} value={recordName} onChange={onRecordNameChange} />
            <Dropdown options={audioTypes} selectedKey={recordFormat?.key} label={strings.RecordFormatDropdownLabel} onChange={onRecordFormatChange} />
        </div>
    );
};

export default Controls;
