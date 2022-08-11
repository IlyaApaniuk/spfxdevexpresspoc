import * as React from "react";
import { Checkbox } from "@fluentui/react/lib/Checkbox";

import { IClientHourItem } from "../../../models/businessHours/IClientHourItem";

import styles from "./Hour.module.scss";

export interface IHourProps {
    hour: IClientHourItem;
    onCheckboxChange: (id: number, checked: boolean) => void;
    selected: boolean;
}

const Hour: React.FC<IHourProps> = ({ hour, onCheckboxChange, selected }) => {
    const onCheckboxChangeHandler = React.useCallback(
        (ev, checked: boolean) => {
            onCheckboxChange(hour.id, checked);
        },
        [hour.id, onCheckboxChange]
    );

    return (
        <div className={styles.hourWrapper}>
            <Checkbox checked={selected} onChange={onCheckboxChangeHandler} />
            <span>{hour.day}</span>
            <span>
                {hour.startTime} - {hour.endTime}
            </span>
        </div>
    );
};

export default Hour;
