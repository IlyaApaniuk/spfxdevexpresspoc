import * as React from "react";
import { Shimmer } from "@fluentui/react/lib/Shimmer";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import { IClientHourItem } from "../../models/businessHours/IClientHourItem";
import SharePointService from "../../services/SharePointService";
import { parseTimeToNumber } from "../../utils/time/parseTime";
import { updateItemsOnSelect, updateItemsOnUnselect } from "../../utils/time/updateItems";

import styles from "./BusinessHours.module.scss";
import Hour from "./Hour/Hour";
import TimeSlider from "./TImeSlider/TimeSlider";

export interface IBusinessHoursProps {
    activeSiteKey: string | number | null;
    sharePointService: SharePointService;
}

const BusinessHours: React.FC<IBusinessHoursProps> = ({ activeSiteKey, sharePointService }) => {
    const [businessHoursItems, setBusinessHoursItems] = React.useState<IClientHourItem[]>([]);
    const [changedItems, setChangedItems] = React.useState<IClientHourItem[]>([]);
    const [notification, setNotification] = React.useState<{ message: string; status: boolean } | null>(null);
    const [loading, setLoading] = React.useState<{ type: "loading" | "uploading" } | null>({ type: "loading" });
    const [selectedDays, setSelectedDays] = React.useState<number[]>([]);

    React.useEffect(() => {
        const loadBusinessHoursItems = async () => {
            try {
                const items = await sharePointService.getBusinessHours();

                setBusinessHoursItems(items);
                setChangedItems([...items]);
                setLoading(null);
            } catch (ex) {
                console.error(ex);
                setNotification({ message: strings.BusinessHoursErrorLable, status: false });
                setLoading(null);
            }
        };

        loadBusinessHoursItems();
    }, [sharePointService, loading, activeSiteKey]);

    const onSelectedDayChange = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedDays([...selectedDays, id]);
            const updatedItems = updateItemsOnSelect(selectedDays, id, changedItems);

            setChangedItems([...updatedItems]);
        } else {
            const days = selectedDays;

            days.splice(days.indexOf(id), 1);

            setSelectedDays([...days]);
            const updatedItems = updateItemsOnUnselect(businessHoursItems, id, changedItems);

            setChangedItems([...updatedItems]);
        }
    };

    const onTimeSliderChange = (startTime: string, endTime: string, isAllday?: boolean) => {
        const items = changedItems.map(item => {
            return selectedDays.indexOf(item.id) >= 0 ? { ...item, changed: true, startTime, endTime, allDay: isAllday ? true : false } : item;
        });

        setChangedItems([...items]);
    };

    const onClosed = () => {
        setSelectedDays([]);
    };

    const onUploadChanges = async () => {
        try {
            setLoading({ type: "uploading" });
            const uploaded = await sharePointService.updateBusinessHours(changedItems);

            setNotification({ message: uploaded ? "" : "", status: uploaded });
            setLoading(null);
            setSelectedDays([]);
        } catch (ex) {
            setLoading(null);
            setNotification({ message: strings.BusinessHoursErrorLable, status: false });
        }
    };

    const getSelectedDayStartTime = (type: "start" | "end") => {
        const items = changedItems.filter(item => selectedDays.indexOf(item.id) >= 0);

        return items.length > 0 ? (type === "start" ? parseTimeToNumber(items[0].startTime) : parseTimeToNumber(items[0].endTime)) : undefined;
    };

    return (
        <div className={styles.businessHoursWrapper}>
            {loading?.type === "loading"
                ? [0, 1, 2, 3, 4, 5, 6].map(s => <Shimmer key={s} className={styles.shimmer} width="100%" />)
                : businessHoursItems.map(h => <Hour key={h.id} hour={h} onCheckboxChange={onSelectedDayChange} selected={selectedDays.indexOf(h.id) >= 0} />)}

            {selectedDays.length > 0 && (
                <TimeSlider
                    startTime={getSelectedDayStartTime("start")}
                    endTime={getSelectedDayStartTime("end")}
                    disableUploadButton={changedItems.filter(item => item.changed).length === 0}
                    onClose={onClosed}
                    onUploadChanges={onUploadChanges}
                    onTimeChange={onTimeSliderChange}
                />
            )}
            {notification && <span>{notification.message}</span>}
        </div>
    );
};

export default BusinessHours;
