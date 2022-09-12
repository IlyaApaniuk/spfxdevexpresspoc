import config from "../../config/config";
import { IRecord } from "../../models/records/IRecord";

export function parseRecordsResponse(response: { value: unknown[] }): IRecord[] {
    try {
        const records = response?.value?.filter(r => r[config.lists.AudioFiles.fields.name].indexOf(".mp3") > 0 || r[config.lists.AudioFiles.fields.name].indexOf(".wav") > 0);

        return records.map(r => {
            return {
                url: r[config.lists.AudioFiles.fields.serverRelativeUrl],
                label: r[config.lists.AudioFiles.fields.name],
                modified: new Date(r[config.lists.AudioFiles.fields.timeLastModified])
            } as IRecord;
        });
    } catch (e) {
        console.error(e);

        return [];
    }
}

export function parseRecordsResponseUseEscalationSecurity(response: { value: unknown[] }): IRecord[] {
    try {
        const records = response?.value?.filter(
            r => r[config.lists.AudioFiles.fields.graphName].indexOf(".mp3") > 0 || r[config.lists.AudioFiles.fields.graphName].indexOf(".wav") > 0
        );

        return records.map(r => {
            return {
                url: r[config.lists.AudioFiles.fields.graphUrl],
                label: r[config.lists.AudioFiles.fields.graphName],
                modified: new Date(r[config.lists.AudioFiles.fields.graphTimeLastModified]),
                id: r["id"]
            } as IRecord;
        });
    } catch (e) {
        console.error(e);

        return [];
    }
}
