import config from "../../config/config";
import { IRecord } from "../../models/records/IRecord";

export default function parseRecordsResponse(response: { value: unknown[] }): IRecord[] {
    try {
        const records = response?.value?.filter(r => r[config.lists.AudioFiles.fields.Name].indexOf(".mp3") > 0 || r[config.lists.AudioFiles.fields.Name].indexOf(".wav") > 0);

        return records.map(r => {
            return {
                url: r[config.lists.AudioFiles.fields.ServerRelativeUrl],
                label: r[config.lists.AudioFiles.fields.Name],
                modified: new Date(r[config.lists.AudioFiles.fields.TimeLastModified])
            } as IRecord;
        });
    } catch (e) {
        console.error(e);

        return [];
    }
}
