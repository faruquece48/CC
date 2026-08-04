export const REGISTRATION_DEADLINES = [
  "August 2, 2026 23:59:59",
  "August 3, 2026 23:59:59",
  "August 4, 2026 23:59:59",
] as const;

export type RegistrationPhase = 1 | 2 | 3 | "closed";

export function getRegistrationPhase(now = new Date()): RegistrationPhase {
  if (now <= new Date(REGISTRATION_DEADLINES[0])) return 1;
  if (now <= new Date(REGISTRATION_DEADLINES[1])) return 2;
  if (now <= new Date(REGISTRATION_DEADLINES[2])) return 3;

  return "closed";
}

export function getActiveRegistrationDeadline(now = new Date()) {
  const phase = getRegistrationPhase(now);

  return phase === "closed" ? null : REGISTRATION_DEADLINES[phase - 1];
}

// Kept for compatibility: registration closes after the third deadline.
export const REGISTRATION_DEADLINE = REGISTRATION_DEADLINES[2];
