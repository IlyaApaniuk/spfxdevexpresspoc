import * as React from "react";

import styles from "./SpfxDevExpressPoC.module.scss";

export interface ISpfxDevExpressPoCProps {
    headerLabel: string;
    isDarkTheme: boolean;
    environmentMessage: string;
    hasTeamsContext: boolean;
    userDisplayName: string;
}

const SpfxDevExpressPoC: React.FC<ISpfxDevExpressPoCProps> = () => {
    return <div className={styles.spfxDevExpressWrapper}>empty space for devexpress component</div>;
};

export default SpfxDevExpressPoC;
