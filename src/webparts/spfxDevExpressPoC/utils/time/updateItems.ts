import { IClientHourItem } from "../../models/businessHours/IClientHourItem";

export function updateItemsOnSelect(selectedDays: number[], newItemId: number, items: IClientHourItem[]): IClientHourItem[] {
    if (selectedDays.length === 0) {
        return items;
    }

    if (selectedDays.length > 0) {
        const initValue = items.filter(item => item.id === selectedDays[0]);
        const startTime = initValue[0].startTime;
        const endTime = initValue[0].endTime;
        const allDay = initValue[0].allDay;

        const changedItems = items.map(item => (selectedDays.indexOf(item.id) >= 0 || item.id === newItemId ? { ...item, changed: true, startTime, endTime, allDay } : item));

        return changedItems;
    }

    return items;
}

export function updateItemsOnUnselect(defaultItemsValues: IClientHourItem[], deletedItemId: number, items: IClientHourItem[]): IClientHourItem[] {
    const originalItem = defaultItemsValues.filter(item => item.id === deletedItemId);
    const startTime = originalItem[0].startTime;
    const endTime = originalItem[0].endTime;
    const allDay = originalItem[0].allDay;

    const updatedItems = items.map(item => (item.id === deletedItemId ? { ...item, changed: false, startTime, endTime, allDay } : item));

    return updatedItems;
}
