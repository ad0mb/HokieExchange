export type SlotStart = [hour: number, minute: number];

export type TimeSlot = {
  slot: SlotStart;
  label: string;
};

export type DayAvailability = {
  dateLabel: string;
  times: TimeSlot[];
};

export const DEFAULT_SLOT_TIMES: SlotStart[] = [
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

export function formatTime(date: Date): string {
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute === 0 ? `${hour12}${period}` : `${hour12}:${minute}${period}`;
}

export function formatSlotStart([hour, minute]: SlotStart): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return formatTime(d);
}

export function getUpcomingAvailability(
  days = 7,
  slotTimes: SlotStart[] = DEFAULT_SLOT_TIMES
): DayAvailability[] {
  const today = new Date();

  return Array.from({ length: days }, (_, dayOffset) => {
    const day = new Date(today);
    day.setDate(today.getDate() + dayOffset);

    const times = slotTimes.map((slot) => {
      const [hour, minute] = slot;
      const start = new Date(day);
      start.setHours(hour, minute, 0, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      return { slot, label: `${formatTime(start)} - ${formatTime(end)}` };
    });

    return { dateLabel: formatDateLabel(day), times };
  });
}
