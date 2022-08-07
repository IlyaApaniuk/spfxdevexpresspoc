import { IRecord } from "../models/IRecord";

export default function parseRecordsResponse(response: { value: unknown[] }): IRecord[] {
    try {
        const records = response?.value?.filter(r => r["Name"].indexOf(".mp3") > 0 || r["Name"].indexOf(".wav") > 0);

        return records.map(r => {
            return {
                url: r["ServerRelativeUrl"],
                label: r["Name"],
                modified: new Date(r["TimeLastModified"])
            } as IRecord;
        });
    } catch (e) {
        console.error(e);

        return [];
    }
}
