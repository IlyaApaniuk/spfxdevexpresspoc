// eslint-disable-next-line import/named
import { ITag } from "@fluentui/react/lib/Pickers";

export default function parseActiveSitesRespose(response: { value: unknown[] }): ITag[] {
    try {
        return response.value.map(site => {
            return {
                name: site["Title"],
                key: site["A365_SiteURL"]?.Url
            } as ITag;
        });
    } catch (ex) {
        throw ex;
    }
}
