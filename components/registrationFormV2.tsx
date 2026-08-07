'use client';

import { Button } from "@nextui-org/button";
import { Checkbox, CheckboxGroup, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";

type Person = {
    name: string;
    email: string;
    phoneNumber: string;
    department: string;
    university: string;
};

type TeamEventKey = "truss" | "poster";

const emptyPerson = (): Person => ({
    name: "", email: "", phoneNumber: "", department: "", university: ""
});

const eventNames: Record<string, string> = {
    cad: "CAD Expert",
    mechamind: "Mechamind",
    management: "Management Maestro",
    truss: "Truss Combat",
    poster: "Poster Presentation"
};

const feeForEventCount = (count: number) => [0, 400, 600, 800, 900, 1000][Math.min(count, 5)];

const participantInputClasses = {
    label: "text-lg font-medium text-gray-700",
    input: "text-lg",
    inputWrapper: "min-h-14"
};

const REGISTRATION_DRAFT_KEY = "construct-carnival-registration-draft";

export default function RegistrationFormV2({
    handleSubmission
}: {
    handleSubmission: (data: any) => Promise<any>;
}) {
    const [individual, setIndividual] = useState<Person>(emptyPerson());
    const [individualEvents, setIndividualEvents] = useState<string[]>([]);
    const [enabledTeamEvents, setEnabledTeamEvents] = useState<TeamEventKey[]>([]);
    const [teamNames, setTeamNames] = useState<Record<TeamEventKey, string>>({ truss: "", poster: "" });
    const [teamMembers, setTeamMembers] = useState<Record<TeamEventKey, Person[]>>({
        truss: [emptyPerson(), emptyPerson()],
        poster: [emptyPerson(), emptyPerson()]
    });
    const [copyPreviousTeam, setCopyPreviousTeam] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(false);

    const hasIndividualEvents = individualEvents.length > 0;
    const hasTeamEvents = enabledTeamEvents.length > 0;
    const firstTeamEvent = enabledTeamEvents[0];
    const secondTeamEvent = enabledTeamEvents[1];

    useEffect(() => {
        try {
            const savedDraft = localStorage.getItem(REGISTRATION_DRAFT_KEY);
            if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                if (draft.individual) setIndividual(draft.individual);
                if (Array.isArray(draft.individualEvents)) setIndividualEvents(draft.individualEvents);
                if (Array.isArray(draft.enabledTeamEvents)) setEnabledTeamEvents(draft.enabledTeamEvents);
                if (draft.teamNames) setTeamNames(draft.teamNames);
                if (draft.teamMembers) setTeamMembers(draft.teamMembers);
                if (typeof draft.copyPreviousTeam === "boolean") setCopyPreviousTeam(draft.copyPreviousTeam);
            }
        } catch {
            localStorage.removeItem(REGISTRATION_DRAFT_KEY);
        } finally {
            setDraftLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!draftLoaded) return;
        localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify({
            individual,
            individualEvents,
            enabledTeamEvents,
            teamNames,
            teamMembers,
            copyPreviousTeam
        }));
    }, [draftLoaded, individual, individualEvents, enabledTeamEvents, teamNames, teamMembers, copyPreviousTeam]);

    const clearAllData = () => {
        setIndividual(emptyPerson());
        setIndividualEvents([]);
        setEnabledTeamEvents([]);
        setTeamNames({ truss: "", poster: "" });
        setTeamMembers({
            truss: [emptyPerson(), emptyPerson()],
            poster: [emptyPerson(), emptyPerson()]
        });
        setCopyPreviousTeam(false);
        setError("");
        localStorage.removeItem(REGISTRATION_DRAFT_KEY);
    };

    useEffect(() => {
        if (!hasIndividualEvents || !hasTeamEvents) return;

        setTeamMembers((current) => ({
            truss: [individual, ...current.truss.slice(1)],
            poster: [individual, ...current.poster.slice(1)]
        }));
    }, [hasIndividualEvents, hasTeamEvents, individual]);

    useEffect(() => {
        if (!firstTeamEvent || !secondTeamEvent) {
            setCopyPreviousTeam(false);
            return;
        }

        if (copyPreviousTeam) {
            setTeamNames((current) => ({
                ...current,
                [secondTeamEvent]: current[firstTeamEvent]
            }));
            setTeamMembers((current) => ({
                ...current,
                [secondTeamEvent]: current[firstTeamEvent].map((member) => ({ ...member }))
            }));
        }
    }, [
        copyPreviousTeam,
        firstTeamEvent,
        secondTeamEvent,
        firstTeamEvent ? teamNames[firstTeamEvent] : "",
        firstTeamEvent ? teamMembers[firstTeamEvent] : null
    ]);

    const updatePerson = (person: Person, field: keyof Person, value: string) => ({
        ...person,
        [field]: value
    });

    const allSelectedEntries = () => {
        const entries: Array<{ person: Person; event: string; identity: string }> = [];
        if (hasIndividualEvents) {
            individualEvents.forEach((event) => entries.push({
                person: individual,
                event,
                identity: "individual-participant"
            }));
        }
        if (hasTeamEvents) {
            enabledTeamEvents.forEach((event) => {
                teamMembers[event].forEach((person, index) => entries.push({
                    person,
                    event,
                    identity: hasIndividualEvents && index === 0
                        ? "individual-participant"
                        : copyPreviousTeam && event === secondTeamEvent
                            ? `${firstTeamEvent}-member-${index}`
                            : `${event}-member-${index}`
                }));
            });
        }
        return entries;
    };

    const getFeeBreakdown = () => {
        const people = new Map<string, { name: string; events: Set<string> }>();
        allSelectedEntries().forEach(({ person, event, identity }) => {
            const email = person.email.trim().toLowerCase();
            const key = email || identity;
            if (!people.has(key)) people.set(key, { name: person.name, events: new Set() });
            people.get(key)!.events.add(event);
        });
        return Array.from(people.entries()).map(([key, item], index) => ({
            key,
            name: item.name.trim() || `Participant ${index + 1}`,
            events: Array.from(item.events),
            fee: feeForEventCount(item.events.size)
        }));
    };

    const calculateFee = () =>
        getFeeBreakdown().reduce((total, participant) => total + participant.fee, 0);

    const isPersonComplete = (person: Person) =>
        Object.values(person).every((value) => value.trim() !== "");

    const submit = async () => {
        setError("");
        if (hasIndividualEvents && !isPersonComplete(individual)) {
            setError("Complete the individual participant card and select at least one individual event.");
            return;
        }
        if (!hasIndividualEvents && !hasTeamEvents) {
            setError("Select at least one individual or team event.");
            return;
        }
        const activeTeamEvents = enabledTeamEvents;

        for (const event of activeTeamEvents) {
            const members = teamMembers[event];
            const uniqueEmails = new Set(members.map((member) => member.email.trim().toLowerCase()));
            if (!teamNames[event].trim() || members.length < 2 || members.length > 3 ||
                members.some((member) => !isPersonComplete(member)) || uniqueEmails.size !== members.length) {
                setError(`${eventNames[event]} requires a team name and 2–3 complete, distinct members.`);
                return;
            }
        }

        setIsLoading(true);
        const response = await handleSubmission({
            mode: hasIndividualEvents && hasTeamEvents
                ? "both"
                : hasIndividualEvents ? "individual" : "team",
            individualRegistration: hasIndividualEvents
                ? { participant: individual, events: individualEvents }
                : null,
            teamRegistrations: activeTeamEvents.map((event) => ({
                    event,
                    teamName: teamNames[event],
                    members: teamMembers[event]
                })),
            fee: calculateFee()
        });
        if (response.status === 200 && response.url) {
            localStorage.removeItem(REGISTRATION_DRAFT_KEY);
            window.location.href = response.url;
            return;
        }
        setError(response.message || "Registration failed. Please try again.");
        setIsLoading(false);
    };

    return (
        <form className="mx-auto mt-5 flex w-full flex-col gap-5" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            {(
                <ParticipantCard
                    title="Individual Participant"
                    subtitle="Select one or more individual events"
                    person={individual}
                    isRequired={hasIndividualEvents}
                    onChange={(field, value) => setIndividual(updatePerson(individual, field, value))}
                    headerAction={
                        <Button type="button" size="sm" color="danger" variant="light" onPress={clearAllData}>
                            Clear Data
                        </Button>
                    }
                >
                    <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
                        <CheckboxGroup label="Individual Events" value={individualEvents} onValueChange={setIndividualEvents} orientation="horizontal">
                            <Checkbox value="cad">CAD Expert</Checkbox>
                            <Checkbox value="mechamind">Mechamind</Checkbox>
                            <Checkbox value="management">Management Maestro</Checkbox>
                        </CheckboxGroup>
                        <p className="whitespace-nowrap text-sm font-semibold text-blue-700">
                            1 event: 400 TK · 2 events: 600 TK · 3 events: 800 TK
                        </p>
                    </div>
                </ParticipantCard>
            )}

            {(
                <section className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 shadow-md">
                    <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
                        <div>
                            <h2 className="text-lg font-bold text-[#083b66]">Team Events <span className="text-sm font-normal text-gray-500">(2–3 members per event)</span></h2>
                            <CheckboxGroup
                                value={enabledTeamEvents}
                                onValueChange={(values) => {
                                    const selected = values as TeamEventKey[];
                                    setEnabledTeamEvents((current) => [
                                        ...current.filter((event) => selected.includes(event)),
                                        ...selected.filter((event) => !current.includes(event))
                                    ]);
                                }}
                                orientation="horizontal"
                                className="mt-2"
                            >
                                <Checkbox value="truss">Truss Combat</Checkbox>
                                <Checkbox value="poster">Poster Presentation</Checkbox>
                            </CheckboxGroup>
                        </div>
                        <div className="text-left text-sm font-semibold text-orange-600 lg:text-right">
                            <p>Per person: 1 event = 400 TK · 2 events = 600 TK</p>
                            <p>Use the same email when a member joins both events.</p>
                        </div>
                    </div>
                </section>
            )}

            {enabledTeamEvents.map((event, eventIndex) => (
                <TeamCard
                    key={event}
                    event={event}
                    teamName={teamNames[event]}
                    members={teamMembers[event]}
                    onTeamNameChange={(value) => setTeamNames({ ...teamNames, [event]: value })}
                    onMemberChange={(index, field, value) => {
                        const members = [...teamMembers[event]];
                        members[index] = updatePerson(members[index], field, value);
                        setTeamMembers({ ...teamMembers, [event]: members });
                    }}
                    onAdd={() => setTeamMembers({ ...teamMembers, [event]: [...teamMembers[event], emptyPerson()] })}
                    onRemove={() => setTeamMembers({ ...teamMembers, [event]: teamMembers[event].slice(0, -1) })}
                    lockFirstMember={hasIndividualEvents}
                    showCopyPrevious={eventIndex === 1}
                    copyPrevious={eventIndex === 1 && copyPreviousTeam}
                    onCopyPreviousChange={setCopyPreviousTeam}
                />
            ))}

            <section className="sticky bottom-4 z-50 flex flex-col items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-white p-4 shadow-xl md:flex-row">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Calculated Total</p>
                    <p className="text-2xl font-bold text-[#083b66]">{calculateFee()} TK</p>
                </div>
                <Button type="submit" color="primary" size="lg" isLoading={isLoading} className="w-full font-semibold md:w-auto">Proceed to Payment</Button>
            </section>
            {error && <p className="rounded-xl bg-red-50 p-4 text-center font-semibold text-red-600">{error}</p>}
        </form>
    );
}

function ParticipantCard({ title, subtitle, person, onChange, children, isReadOnly = false, isRequired = true, headerAction }: {
    title: string;
    subtitle: string;
    person: Person;
    onChange: (field: keyof Person, value: string) => void;
    children?: React.ReactNode;
    isReadOnly?: boolean;
    isRequired?: boolean;
    headerAction?: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-md">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#083b66]">{title}</h2>
                {headerAction}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly} label="Full Name" labelPlacement="outside" value={person.name} onValueChange={(value) => onChange("name", value)} classNames={participantInputClasses} />
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly} type="email" label="Email" labelPlacement="outside" value={person.email} onValueChange={(value) => onChange("email", value)} classNames={participantInputClasses} />
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly} type="tel" label="Phone Number" labelPlacement="outside" value={person.phoneNumber} onValueChange={(value) => onChange("phoneNumber", value)} classNames={participantInputClasses} />
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly} label="Department" labelPlacement="outside" value={person.department} onValueChange={(value) => onChange("department", value)} classNames={participantInputClasses} />
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly} label="University" labelPlacement="outside" value={person.university} onValueChange={(value) => onChange("university", value)} classNames={participantInputClasses} />
            </div>
            {children && <div className="mt-3 border-t border-gray-100 pt-3">{children}</div>}
        </section>
    );
}

function TeamCard({ event, teamName, members, onTeamNameChange, onMemberChange, onAdd, onRemove, lockFirstMember, showCopyPrevious, copyPrevious, onCopyPreviousChange }: {
    event: TeamEventKey;
    teamName: string;
    members: Person[];
    onTeamNameChange: (value: string) => void;
    onMemberChange: (index: number, field: keyof Person, value: string) => void;
    onAdd: () => void;
    onRemove: () => void;
    lockFirstMember: boolean;
    showCopyPrevious: boolean;
    copyPrevious: boolean;
    onCopyPreviousChange: (selected: boolean) => void;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-lg">
            <div className="flex flex-col justify-between gap-2 bg-gradient-to-r from-[#083b66] to-[#0b4d8a] px-5 py-3 text-white sm:flex-row sm:items-center">
                <h2 className="text-xl font-bold">{eventNames[event]}</h2>
                {showCopyPrevious && (
                    <Checkbox
                        isSelected={copyPrevious}
                        onValueChange={onCopyPreviousChange}
                        classNames={{ label: "text-sm font-semibold text-white" }}
                    >
                        Same as previous event information
                    </Checkbox>
                )}
            </div>
            <div className="space-y-4 p-4">
                <Input size="lg" isRequired isReadOnly={copyPrevious} label="Team Name" labelPlacement="outside" value={teamName} onValueChange={onTeamNameChange} classNames={participantInputClasses} />
                {members.map((member, index) => (
                    <ParticipantCard
                        key={index}
                        title={`Member ${index + 1}`}
                        subtitle={lockFirstMember && index === 0
                            ? "Copied from the individual participant card"
                            : `${eventNames[event]} team member`}
                        person={member}
                        isReadOnly={copyPrevious || (lockFirstMember && index === 0)}
                        onChange={(field, value) => onMemberChange(index, field, value)}
                    />
                ))}
                <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap gap-3">
                        {!copyPrevious && members.length < 3 && <Button type="button" color="primary" variant="flat" onPress={onAdd}>+ Add Third Member</Button>}
                        {!copyPrevious && members.length > 2 && <Button type="button" color="danger" variant="flat" onPress={onRemove}>Remove Third Member</Button>}
                    </div>
                </div>
            </div>
        </section>
    );
}
