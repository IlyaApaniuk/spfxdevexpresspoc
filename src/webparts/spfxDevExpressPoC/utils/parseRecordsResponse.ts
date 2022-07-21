import { IRecord } from "../models/IRecord";

export default function parseRecordsResponse(response: { value: unknown[] }): IRecord[] {
    try {
        const records = response?.value?.filter(r => r["Name"].indexOf(".mp3") > 0);

        return records.map(r => {
            return {
                url: r["ServerRelativeUrl"],
                label: r["Name"]
            } as IRecord;
        });
    } catch (e) {
        console.error(e);

        return [];
    }
}
