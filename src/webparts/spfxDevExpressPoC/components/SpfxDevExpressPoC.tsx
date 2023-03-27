import * as React from "react";
// eslint-disable-next-line import/named
import { ITag, TagPicker } from "@fluentui/react/lib/Pickers";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SharePointService from "../services/SharePointService";

import Tabs from "./Tabs/Tabs";
import styles from "./SpfxDevExpressPoC.module.scss";

export interface ISpfxDevExpressPoCProps {
    libraryName: string;
    sourceSite: string;
    sharePointService: SharePointService;
    disableCreateNewRecord: boolean;
    recordsTabLabel: string;
    userEmail: string;
    shouldCheckSupervisor: boolean;
    useEscalatedSecurity: boolean;
    spfxToken: string;
    isEditMode: boolean;
    powerAutomateUrl: string;
}

const SpfxDevExpressPoC: React.FC<ISpfxDevExpressPoCProps> = ({
    libraryName,
    sourceSite,
    sharePointService,
    disableCreateNewRecord,
    recordsTabLabel,
    userEmail,
    shouldCheckSupervisor,
    useEscalatedSecurity,
    spfxToken,
    isEditMode,
    powerAutomateUrl
}) => {
    const [activeSites, setActiveSites] = React.useState<ITag[]>([]);
    const [activeSiteKey, setActiveSiteKey] = React.useState<string | number>();
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const pullActiveSites = async () => {
            try {
                const sites = await sharePointService.getActiveSites(userEmail);

                setActiveSites(sites);
                setLoading(false);
            } catch (ex) {
                setLoading(false);
            }
        };

        !isEditMode && userEmail ? pullActiveSites() : setLoading(false);
    }, [isEditMode, userEmail, sharePointService]);

    React.useEffect(() => {
        sharePointService.activeSitesLibraryName = libraryName;
        sharePointService.activeSitesSiteUrl = sourceSite;
        sharePointService.shouldCheckSupervisor = shouldCheckSupervisor;
        sharePointService.useEscalatedSecurity = useEscalatedSecurity;
        sharePointService.spfxToken = spfxToken;
        sharePointService.powerAutomateUrl = powerAutomateUrl;
    }, [sharePointService, libraryName, sourceSite, shouldCheckSupervisor, useEscalatedSecurity, spfxToken, powerAutomateUrl]);

    const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
        if (!tagList || !tagList.length || tagList.length === 0) {
            return false;
        }

        return tagList.some(compareTag => compareTag.key === tag.key);
    };

    const filterSuggestedTags = (filterText: string, tagList: ITag[]): ITag[] => {
        return filterText ? activeSites.filter(tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0 && !listContainsTagList(tag, tagList)) : activeSites;
    };

    const onActiveSiteChange = (items: ITag[]) => {
        if (items.length > 0) {
            setActiveSiteKey(items[0].key);
            sharePointService.activeSiteUrl = items[0].key.toString();
        } else {
            setActiveSiteKey(null);
        }
    };

    const getTextFromItem = (item: ITag) => item.name;

    const onEmptyPickerClick = (): ITag[] => activeSites;

    return (
        <div className={styles.wrapper}>
            {userEmail && <label htmlFor="tag-list-id">{strings.ActiveSitesDropdownLabel}</label>}
            {loading ? (
                <Spinner size={SpinnerSize.medium} />
            ) : (
                <>
                    <TagPicker
                        className={userEmail ? "" : styles.sitePickerHidden}
                        onChange={onActiveSiteChange}
                        itemLimit={1}
                        onEmptyResolveSuggestions={onEmptyPickerClick}
                        onResolveSuggestions={filterSuggestedTags}
                        getTextFromItem={getTextFromItem}
                        pickerSuggestionsProps={{ noResultsFoundText: "No sites found" }}
                        inputProps={{
                            id: "tag-list-id"
                        }}
                    />
                    {!userEmail && <div className={styles.userEmailEmptyError}>Your account is returning no username.</div>}
                </>
            )}
            {activeSiteKey && (
                <Tabs activeSiteKey={activeSiteKey} sharePointService={sharePointService} disableCreateNewRecord={disableCreateNewRecord} recordsTabLabel={recordsTabLabel} />
            )}
        </div>
    );
};

export default SpfxDevExpressPoC;
