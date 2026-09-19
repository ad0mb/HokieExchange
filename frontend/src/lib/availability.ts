export type DayAvailability = {
  dateLabel: string;
  times: string[];
};

const SLOT_START_TIMES: Array<[hour: number, minute: number]> = [
  [10, 0],
  [10, 30],
  [11, 0],
  [14, 0],
  [14, 30],
  [15, 0],
  [15, 30],
];

function ordinal(day: number): string {
  if (day % 10 === 1 && day !== 11) return `${day}st`;
  if (day % 10 === 2 && day !== 12) return `${day}nd`;
  if (day % 10 === 3 && day !== 13) return `${day}rd`;
  return `${day}th`;
}

function formatDateLabel(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${weekday}, ${month} ${ordinal(date.getDate())}`;
}

function formatTime(date: Date): string {
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute === 0 ? `${hour12}${period}` : `${hour12}:${minute}${period}`;
}

export function getUpcomingAvailability(days = 7): DayAvailability[] {
  const today = new Date();

  return Array.from({ length: days }, (_, dayOffset) => {
    const day = new Date(today);
    day.setDate(today.getDate() + dayOffset);

    const times = SLOT_START_TIMES.map(([hour, minute]) => {
      const start = new Date(day);
      start.setHours(hour, minute, 0, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      return `${formatTime(start)} - ${formatTime(end)}`;
    });

    return { dateLabel: formatDateLabel(day), times };
  });
}
