// eslint-disable-next-line import/named
import { ITag } from "@fluentui/react/lib/Pickers";

export default function parseActiveSitesResponse(response: { value: unknown[] }, sites?: string[]): ITag[] {
    try {
        const values = sites === undefined ? response.value : response.value.filter(v => sites.indexOf(v["A365_SiteURL"]?.Url) >= 0);

        return values.map(site => {
            return {
                name: site["Title"],
                key: site["A365_SiteURL"]?.Url
            } as ITag;
        });
    } catch (ex) {
        throw ex;
    }
}
