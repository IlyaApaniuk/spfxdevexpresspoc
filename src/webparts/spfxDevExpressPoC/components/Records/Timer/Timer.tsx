import * as React from "react";

import styles from "./Timer.module.scss";

export interface ITimerProps {
    time: number;
}

const Timer: React.FC<ITimerProps> = ({ time }) => {
    return (
        <div className={styles.timerWrapper}>
            <span className={styles.label}>Recording </span>
            <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
            <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}</span>
        </div>
    );
};

export default Timer;
