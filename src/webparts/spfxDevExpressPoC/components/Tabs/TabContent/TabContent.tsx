import * as React from "react";

import styles from "./TabContent.module.scss";

interface ITabContentProps {
    children?: JSX.Element;
}

const TabContent: React.FC<ITabContentProps> = ({ children }) => {
    return <div className={styles.tabContent}>{children}</div>;
};

export default TabContent;
