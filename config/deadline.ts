// Keep registration timing fixed to Bangladesh Standard Time, regardless of
// the deployment server's timezone.
export const REGISTRATION_START_DATE = "2026-08-15T00:00:00+06:00";
export const REGISTRATION_TEST_START_DATE = "2026-08-05T00:00:00+06:00";

export const REGISTRATION_DEADLINES = [
  "2026-09-10T23:59:59+06:00",
  "2026-09-15T23:59:59+06:00",
  "2026-09-15T23:59:59+06:00",
] as const;

export type RegistrationPhase = "not_started" | 1 | 2 | 3 | "closed";

export function haveSameSecondAndThirdDeadline() {
  return (
    new Date(REGISTRATION_DEADLINES[1]).getTime() ===
    new Date(REGISTRATION_DEADLINES[2]).getTime()
  );
}

export function getRegistrationPhase(
  now = new Date(),
  startDate = REGISTRATION_START_DATE
): RegistrationPhase {
  if (now < new Date(startDate)) return "not_started";
  if (now <= new Date(REGISTRATION_DEADLINES[0])) return 1;
  if (now <= new Date(REGISTRATION_DEADLINES[1])) return 2;

  // When deadlines 2 and 3 are the same, phase 3 is intentionally skipped.
  if (haveSameSecondAndThirdDeadline()) return "closed";

  if (now <= new Date(REGISTRATION_DEADLINES[2])) return 3;

  return "closed";
}

export function getRegistrationImpactMessage(
  now = new Date(),
  startDate = REGISTRATION_START_DATE
) {
  const phase = getRegistrationPhase(now, startDate);

  if (phase === "not_started") {
    const formattedStartDate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Dhaka"
    }).format(new Date(startDate));
    return `Registration will open on ${formattedStartDate} at 12:00 AM.`;
  }

  if (phase === 2) {
    return "The registration deadline has been extended in response to students’ requests.";
  }

  if (phase === 3) {
    return "The registration deadline has been extended once again to allow students additional time to complete their registration.";
  }

  return "Registration is Live Now!";
}

export function getRegistrationStartRemainingMessage(
  now = new Date(),
  startDate = REGISTRATION_START_DATE
) {
  const remaining = Math.max(
    0,
    new Date(startDate).getTime() - now.getTime()
  );
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);
  const seconds = Math.floor((remaining / 1_000) % 60);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `Registration has not started yet. Try again in ${pad(days)} days ${pad(hours)} hours ${pad(minutes)} minutes ${pad(seconds)} seconds.`;
}

export function getActiveRegistrationDeadline(
  now = new Date(),
  startDate = REGISTRATION_START_DATE
) {
  const phase = getRegistrationPhase(now, startDate);

  return typeof phase === "number" ? REGISTRATION_DEADLINES[phase - 1] : null;
}

// Kept for compatibility: registration closes after the third deadline.
export const REGISTRATION_DEADLINE = REGISTRATION_DEADLINES[2];
