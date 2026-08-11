export function formatParticipantName(value: unknown) {
  return String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toLocaleUpperCase()}${word.slice(1).toLocaleLowerCase()}`)
    .join(" ");
}
