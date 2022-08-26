import * as React from "react";
import { TextField } from "@fluentui/react/lib/TextField";
import { Slider } from "@fluentui/react/lib/Slider";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import styles from "./ScoreSlider.module.scss";

export interface IScoreSliderProps {
    initValue?: number;
    onChange: (value: number) => void;
}

const ScoreSlider: React.FC<IScoreSliderProps> = ({ initValue, onChange }) => {
    const [value, setValue] = React.useState<number>(initValue !== undefined ? initValue : 0);

    const onCustomValueChangeHandler = (event, newValue: string) => {
        setValue(parseInt(newValue));
        onChange(parseInt(newValue));
    };

    const onSliderChangeHandler = (data: number) => {
        onChange(data);
        setValue(data);
    };

    return (
        <div className={styles.scoreSliderWrapper}>
            <TextField
                className={styles.textBox}
                type="number"
                max={100}
                min={0}
                label={strings.SkillPerAgentScoreSliderLabel}
                value={value.toString()}
                onChange={onCustomValueChangeHandler}
            />
            <Slider className={styles.slider} snapToStep showValue={false} min={0} max={100} value={value} step={5} onChange={onSliderChangeHandler} />
        </div>
    );
};

export default ScoreSlider;
