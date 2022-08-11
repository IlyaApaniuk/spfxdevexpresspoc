export interface IClientHourItem {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
    changed?: boolean;
}
