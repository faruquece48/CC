import { examSchedule, trussSlots } from "../config/competitionSchedule";

export type Member = { name: string; email: string };
export type SingleRegistration = { email: string; events: string[]; ispaid: boolean };
export type TeamRegistration = {
  id: number; registration_id: number; teamname: string; event: string;
  members: Member[]; ispaid: boolean;
};
export type ScheduledTeam = TeamRegistration & {
  participants: (Member & { events: string[] })[];
  available: number[];
};
const normalizeEmail = (email: string) => (email || "").replace(/\s+/g, "").toLowerCase();

export function buildTrussSchedule(singles: SingleRegistration[], teams: TeamRegistration[], paidOnly = true) {
  const eventsByEmail = new Map<string, Set<string>>();
  const add = (email: string, events: string[]) => {
    const key = normalizeEmail(email);
    if (!key) return;
    const existing = eventsByEmail.get(key) || new Set<string>();
    events.forEach((event) => existing.add(event));
    eventsByEmail.set(key, existing);
  };
  singles.filter((row) => !paidOnly || row.ispaid).forEach((row) => add(row.email, row.events || []));
  teams.filter((row) => !paidOnly || row.ispaid).forEach((row) =>
    (row.members || []).forEach((member) => add(member.email, [row.event])));

  const candidates: ScheduledTeam[] = teams.filter((row) => row.event === "truss" && (!paidOnly || row.ispaid))
    .map((team) => {
      const participants = (team.members || []).map((member) => ({
        ...member, events: Array.from(eventsByEmail.get(normalizeEmail(member.email)) || []),
      }));
      const verified = participants.length > 0 && participants.every((member) => normalizeEmail(member.email));
      const available = trussSlots.flatMap((slot, index) => verified && !participants.some((member) =>
        examSchedule.some((exam) => member.events.includes(exam.key) && exam.start < slot.end && exam.end > slot.start)) ? [index] : []);
      return { ...team, participants, available };
    }).sort((a, b) => a.available.length - b.available.length || a.registration_id - b.registration_id || a.id - b.id);

  // Augmenting paths can relocate earlier teams, so a flexible team never
  // prevents a more constrained team from taking its only available hour.
  let groups: ScheduledTeam[][] = [];
  let unassigned: ScheduledTeam[] = [];
  const initialCapacity = Math.min(42, Math.max(1, Math.ceil(candidates.length / 4)));
  for (let capacity = initialCapacity; capacity <= 42; capacity++) {
    groups = trussSlots.map(() => []);
    unassigned = [];
    const place = (team: ScheduledTeam, visited: Set<number>): boolean => {
      const choices = [...team.available].sort((a, b) => groups[a].length - groups[b].length || a - b);
      for (const slot of choices) {
        if (visited.has(slot)) continue;
        visited.add(slot);
        if (groups[slot].length < capacity) { groups[slot].push(team); return true; }
        for (let i = 0; i < groups[slot].length; i++) {
          if (place(groups[slot][i], visited)) { groups[slot][i] = team; return true; }
        }
      }
      return false;
    };
    candidates.forEach((team) => { if (!place(team, new Set())) unassigned.push(team); });
    if (unassigned.every((team) => team.available.length === 0)) break;
  }
  groups.forEach((group) => group.sort((a, b) => a.registration_id - b.registration_id || a.id - b.id));
  return { groups, unassigned, total: candidates.length };
}
