import * as React from "react";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import { ITab } from "../../models/ITab";
import SharePointService from "../../services/SharePointService";
import RecordsWrapper from "../Records/RecordsWrapper/RecordsWrapper";
import BusinessHours from "../BusinessHours/BusinessHours";
import SkillsPerAgentWrapper from "../SkillsPerAgent/SkillsPerAgentWrapper/SkillsPerAgentWrapper";

import TabsHeader from "./TabsHeader/TabsHeader";
import TabContent from "./TabContent/TabContent";
import styles from "./Tabs.module.scss";

export interface ITabsProps {
    activeSiteKey: string | number | null;
    sharePointService: SharePointService;
    disableCreateNewRecord: boolean;
    recordsTabLabel: string;
}

const tabs: ITab[] = [
    {
        id: 0,
        label: strings.RecordsTabLabel
    },
    {
        id: 1,
        label: strings.BusinessHoursTabLabel
    },
    {
        id: 2,
        label: strings.SkillPerAgentTabLabel
    }
];

const Tabs: React.FC<ITabsProps> = ({ activeSiteKey, sharePointService, disableCreateNewRecord, recordsTabLabel }) => {
    const [selectedTab, setSelectedTab] = React.useState<ITab>(tabs[0]);

    const onTabSelectedHandler = React.useCallback(tab => {
        setSelectedTab(tab);
    }, []);

    return (
        <div className={styles.tabsWrapper}>
            <TabsHeader
                values={tabs.map(tab => (tab.id === 0 ? { ...tab, label: recordsTabLabel || tab.label } : tab))}
                selectedTab={selectedTab}
                onTabSelected={onTabSelectedHandler}
            />
            {selectedTab.id === 0 && (
                <TabContent>
                    <RecordsWrapper activeSiteKey={activeSiteKey} sharePointService={sharePointService} disableCreateNewRecord={disableCreateNewRecord} />
                </TabContent>
            )}
            {selectedTab.id === 1 && (
                <TabContent>
                    <BusinessHours activeSiteKey={activeSiteKey} sharePointService={sharePointService} />
                </TabContent>
            )}
            {selectedTab.id === 2 && (
                <TabContent>
                    <SkillsPerAgentWrapper sharePointService={sharePointService} />
                </TabContent>
            )}
        </div>
    );
};

export default Tabs;
