import * as React from "react";
import classNames from "classnames";

import { ITab } from "../../../models/ITab";

import styles from "./TabsHeader.module.scss";

export interface ITabsHeaderProps {
    values: ITab[];
    selectedTab: ITab;
    onTabSelected: (tab: ITab) => void;
}

const TabsHeader: React.FC<ITabsHeaderProps> = ({ values, selectedTab, onTabSelected }) => {
    return (
        <div className={styles.tabsHeaderWrapper}>
            {values.map(value => (
                <div
                    key={value.id}
                    className={classNames(styles.tabHeaderItem, selectedTab.id === value.id ? styles.selected : "")}
                    onClick={() => onTabSelected(value)}
                    role="button"
                    tabIndex={0}
                >
                    {value.label}
                </div>
            ))}
        </div>
    );
};

export default TabsHeader;
