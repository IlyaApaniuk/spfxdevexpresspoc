import * as React from "react";
// eslint-disable-next-line import/named
import { ITag, TagPicker } from "@fluentui/react/lib/Pickers";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SharePointService from "../services/SharePointService";
import parseActiveSitesRespose from "../utils/parsers/parseActiveSitesResponse";

import Tabs from "./Tabs/Tabs";
import styles from "./SpfxDevExpressPoC.module.scss";

export interface ISpfxDevExpressPoCProps {
    libraryName: string;
    sourceSite: string;
    sharePointService: SharePointService;
    disableCreateNewRecord: boolean;
}

const SpfxDevExpressPoC: React.FC<ISpfxDevExpressPoCProps> = ({ libraryName, sourceSite, sharePointService, disableCreateNewRecord }) => {
    const [activeSites, setActiveSites] = React.useState<ITag[]>([]);
    const [activeSiteKey, setActiveSiteKey] = React.useState<string | number>();

    React.useEffect(() => {
        sharePointService.activeSitesLibraryName = libraryName;
        sharePointService.activeSitesSiteUrl = sourceSite;
        const pullActiveSites = async () => {
            const sites = await sharePointService.getActiveSites(parseActiveSitesRespose);

            setActiveSites(sites);
        };

        pullActiveSites();
    }, [sharePointService, libraryName, sourceSite]);

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
            <label htmlFor="tag-list-id">{strings.ActiveSitesDropdownLabel}</label>
            <TagPicker
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
            {activeSiteKey && <Tabs activeSiteKey={activeSiteKey} sharePointService={sharePointService} disableCreateNewRecord={disableCreateNewRecord} />}
        </div>
    );
};

export default SpfxDevExpressPoC;
