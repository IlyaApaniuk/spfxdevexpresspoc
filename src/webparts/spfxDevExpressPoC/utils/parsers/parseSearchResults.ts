import { IRow } from "../../models/search/ISearchResults";

export default function parseSearchResults(rows: IRow[]): string[] {
    try {
        const sites: string[] = [];

        rows.forEach(r => {
            r.Cells.forEach(c => {
                if (c.Key === "SPWebUrl") {
                    sites.push(c.Value);
                }
            });
        });

        return sites;
    } catch (ex) {
        throw ex;
    }
}
