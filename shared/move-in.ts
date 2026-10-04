export type MoveInPreferences = {
  move_in: string;
  move_in_precision?: "day" | "month" | "range";
  move_in_end?: string | null;
};

export function endOfMonth(dayISO: string): string {
  const date = new Date(`${dayISO}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
}

export function moveInEnd(profile: MoveInPreferences): string {
  return profile.move_in_end || profile.move_in;
}

const monthFormatter = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const dayFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function moveInLabel(profile: MoveInPreferences): string {
  const start = new Date(`${profile.move_in}T00:00:00.000Z`);
  if (profile.move_in_precision === "month")
    return monthFormatter.format(start);
  if (profile.move_in_precision === "range")
    return `${monthFormatter.format(start)} – ${monthFormatter.format(new Date(`${moveInEnd(profile)}T00:00:00.000Z`))}`;
  return dayFormatter.format(start);
}
