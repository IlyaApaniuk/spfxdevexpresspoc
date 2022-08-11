import { IClientHourItem } from "../../models/businessHours/IClientHourItem";

export default function parseBusinessHoursResponse(response: { value: unknown[] }): IClientHourItem[] {
    try {
        return response.value.map(r => {
            return {
                id: r["ID"],
                day: r["wsp_ucc_day"],
                startTime: r["wsp_ucc_Start"],
                endTime: r["wsp_ucc_End"],
                allDay: r["wsp_ucc_AllDay"]
            } as IClientHourItem;
        });
    } catch (ex) {
        throw ex;
    }
}
