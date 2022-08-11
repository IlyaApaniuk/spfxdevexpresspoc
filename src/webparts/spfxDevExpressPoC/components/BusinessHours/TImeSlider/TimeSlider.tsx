import * as React from "react";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { MaskedTextField } from "@fluentui/react/lib/TextField";
import { Slider } from "@fluentui/react/lib/Slider";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import { parseNumberToTime } from "../../../utils/time/parseTime";

import styles from "./TimeSlider.module.scss";

export interface ITimeSliderProps {
    startTime?: number;
    endTime?: number;
    disableUploadButton: boolean;
    onTimeChange: (startTime: string, endTime: string, isAllday?: boolean) => void;
    onUploadChanges: () => void;
    onClose: () => void;
}

const TimeSlider: React.FC<ITimeSliderProps> = ({ startTime, endTime, disableUploadButton, onTimeChange, onUploadChanges, onClose }) => {
    const [value, setValue] = React.useState<[number, number]>([startTime || 540, endTime || 1080]);

    const onTimeChangeHandler = React.useCallback(
        (data: number, range?: [number, number]) => {
            setValue([...range]);
            onTimeChange(parseNumberToTime(range[0]), parseNumberToTime(range[1]));
        },
        [onTimeChange]
    );

    // Removed for currnt iteration
    // const onAllDayClickHandler = React.useCallback(() => {
    //     setValue([0, 1440]);
    //     onTimeChange(parseNumberToTime(0), parseNumberToTime(1440), true);
    // }, [onTimeChange]);

    // const onClosedHandler = () => {
    //     setValue([0, 1440]);
    //     onTimeChange(parseNumberToTime(0), parseNumberToTime(1440, true), true);
    // };

    const onCustomStartTimeChangeHandler = React.useCallback(
        (event, newValue: string) => {
            onTimeChange(newValue, parseNumberToTime(value[1]));
        },
        [onTimeChange, value]
    );

    const onCustomEndTimeChangeHandler = React.useCallback(
        (event, newValue: string) => {
            onTimeChange(parseNumberToTime(value[0]), newValue);
        },
        [onTimeChange, value]
    );

    return (
        <div className={styles.timeSliderWrapper}>
            <div className={styles.time}>
                <MaskedTextField className={styles.timeTextBox} mask="99:99" label="Start time" value={parseNumberToTime(value[0])} onChange={onCustomStartTimeChangeHandler} />
                <MaskedTextField className={styles.timeTextBox} mask="99:99" label="End time" value={parseNumberToTime(value[1])} onChange={onCustomEndTimeChangeHandler} />
            </div>
            <Slider className={styles.slider} ranged showValue={false} min={0} max={1440} value={value[1]} lowerValue={value[0]} step={15} onChange={onTimeChangeHandler} />
            <div className={styles.buttonsGroup}>
                {
                    // Removed for current iteration
                    /* <div className={styles.row}>
                    <PrimaryButton onClick={onAllDayClickHandler} text={strings.BusinessHoursAllDayButtonLabel} />
                    <DefaultButton onClick={onClosedHandler} text={strings.BusinessHoursClosedButtonLabel} />
                </div> */
                }
                <div className={styles.row}>
                    <PrimaryButton disabled={disableUploadButton} text={strings.BusinessHoursUpdateChangesButtonLabel} onClick={onUploadChanges} />
                    <DefaultButton text={strings.BusinessHoursCancelButtonLabel} onClick={onClose} />
                </div>
            </div>
        </div>
    );
};

export default TimeSlider;
