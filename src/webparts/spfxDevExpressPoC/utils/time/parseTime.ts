export function parseTimeToNumber(time: string): number {
    const splittedTime = time.split(":");
    const hours = parseInt(splittedTime[0].trim());
    const minutes = parseInt(splittedTime[1].trim());

    return hours * 60 + minutes;
}

export function parseNumberToTime(timeValue: number): string {
    let minutes = timeValue % 60;
    const nextHour = minutes > 0 ? timeValue + 60 - minutes : timeValue;
    let hours = nextHour / 60;

    hours = minutes > 0 ? hours - 1 : hours;
    minutes = hours === 24 ? 59 : minutes;
    hours = hours === 24 ? 23 : hours;

    return `${("0" + hours.toString()).slice(-2)}:${("0" + minutes.toString()).slice(-2)}`;
}
