import config from "../../config/config";
import { IClientHourItem } from "../../models/businessHours/IClientHourItem";

export default function parseBusinessHoursResponse(response: { value: unknown[] }): IClientHourItem[] {
    try {
        return response.value.map(r => {
            return {
                id: r["Id"],
                day: r[config.lists.Businesshours.fields.day],
                startTime: r[config.lists.Businesshours.fields.start],
                endTime: r[config.lists.Businesshours.fields.end],
                allDay: r[config.lists.Businesshours.fields.allDay]
            } as IClientHourItem;
        });
    } catch (ex) {
        throw ex;
    }
}
