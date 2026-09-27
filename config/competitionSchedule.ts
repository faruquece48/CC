export const examSchedule = [
  { key: "cad", title: "CAD Expert", start: 14 * 60, end: 14 * 60 + 40, time: "2:00 PM — 2:40 PM" },
  { key: "mechamind", title: "Mechamind", start: 15 * 60, end: 15 * 60 + 40, time: "3:00 PM — 3:40 PM" },
  { key: "management", title: "Management Maestro", start: 16 * 60, end: 16 * 60 + 40, time: "4:00 PM — 4:40 PM" },
] as const;

export const trussSlots = [14, 15, 16, 17].map((hour) => ({
  start: hour * 60,
  end: (hour + 1) * 60,
  label: `${hour - 12}:00–${hour - 11}:00 PM`,
}));
