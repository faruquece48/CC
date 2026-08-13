'use client';

import { Button } from "@nextui-org/button";
import { Checkbox, CheckboxGroup, Input, Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { TRUSS_COURIER_FEE } from "@/config/registrationFee";

type Person = {
    name: string;
    email: string;
    phoneNumber: string;
    department: string;
    university: string;
    previousEvents?: string[];
};

type TeamEventKey = "truss" | "poster";

const emptyPerson = (): Person => ({
    name: "", email: "", phoneNumber: "", department: "", university: "", previousEvents: []
});

const isCompletePerson = (person: Person) =>
    [person.name, person.email, person.phoneNumber, person.department, person.university]
        .every((value) => value.trim() !== "");

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
    handleSubmission,
    forcedTotalFee,
    allowPriorRegistration = false,
    advancedDesign = false,
    otpValidityMinutes = 10
}: {
    handleSubmission: (data: any) => Promise<any>;
    forcedTotalFee?: number;
    allowPriorRegistration?: boolean;
    advancedDesign?: boolean;
    otpValidityMinutes?: number;
}) {
    const [individual, setIndividual] = useState<Person>(emptyPerson());
    const [individualEvents, setIndividualEvents] = useState<string[]>([]);
    const [enabledTeamEvents, setEnabledTeamEvents] = useState<TeamEventKey[]>([]);
    const [teamNames, setTeamNames] = useState<Record<TeamEventKey, string>>({ truss: "", poster: "" });
    const [trussDeliveryAddress, setTrussDeliveryAddress] = useState("");
    const [teamMembers, setTeamMembers] = useState<Record<TeamEventKey, Person[]>>({
        truss: [emptyPerson(), emptyPerson()],
        poster: [emptyPerson(), emptyPerson()]
    });
    const [copyPreviousTeam, setCopyPreviousTeam] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(false);
    const [isPrimaryVerificationPending, setIsPrimaryVerificationPending] = useState(false);

    const hasIndividualEvents = individualEvents.length > 0;
    const hasTeamEvents = enabledTeamEvents.length > 0;
    const availableTeamEvents = (["truss", "poster"] as TeamEventKey[])
        .filter((event) => !individual.previousEvents?.includes(event));
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
                if (typeof draft.trussDeliveryAddress === "string") setTrussDeliveryAddress(draft.trussDeliveryAddress);
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
            trussDeliveryAddress,
            copyPreviousTeam
        }));
    }, [draftLoaded, individual, individualEvents, enabledTeamEvents, teamNames, teamMembers, trussDeliveryAddress, copyPreviousTeam]);

    const clearAllData = () => {
        setIndividual(emptyPerson());
        setIndividualEvents([]);
        setEnabledTeamEvents([]);
        setTeamNames({ truss: "", poster: "" });
        setTrussDeliveryAddress("");
        setTeamMembers({
            truss: [emptyPerson(), emptyPerson()],
            poster: [emptyPerson(), emptyPerson()]
        });
        setCopyPreviousTeam(false);
        setIsPrimaryVerificationPending(false);
        setError("");
        localStorage.removeItem(REGISTRATION_DRAFT_KEY);
    };

    useEffect(() => {
        if (!hasTeamEvents) return;

        setTeamMembers((current) => ({
            truss: [individual, ...current.truss.slice(1)],
            poster: [individual, ...current.poster.slice(1)]
        }));
    }, [hasTeamEvents, individual]);

    useEffect(() => {
        const previousEvents = new Set(individual.previousEvents || []);
        setIndividualEvents((current) => current.filter((event) => !previousEvents.has(event)));
    }, [individual.previousEvents]);

    useEffect(() => {
        if (!firstTeamEvent || !secondTeamEvent) {
            setCopyPreviousTeam(false);
            return;
        }

        if (copyPreviousTeam) {
            setTeamMembers((current) => ({
                ...current,
                [secondTeamEvent]: current[firstTeamEvent].map((member) => ({ ...member }))
            }));
        }
    }, [
        copyPreviousTeam,
        firstTeamEvent,
        secondTeamEvent,
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
                    identity: index === 0
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
        const people = new Map<string, { name: string; events: Set<string>; previousEvents: Set<string> }>();
        allSelectedEntries().forEach(({ person, event, identity }) => {
            const email = person.email.trim().toLowerCase();
            const key = email || identity;
            if (!people.has(key)) people.set(key, {
                name: person.name,
                events: new Set(),
                previousEvents: new Set(person.previousEvents || [])
            });
            people.get(key)!.events.add(event);
        });
        return Array.from(people.entries()).map(([key, item], index) => ({
            key,
            name: item.name.trim() || `Participant ${index + 1}`,
            events: Array.from(item.events),
            fee: feeForEventCount(new Set([...item.previousEvents, ...item.events]).size) -
                feeForEventCount(item.previousEvents.size)
        }));
    };

    const calculateParticipantFee = () =>
        getFeeBreakdown().reduce((total, participant) => total + participant.fee, 0);

    const calculateFee = () => forcedTotalFee ??
        calculateParticipantFee() + (enabledTeamEvents.includes("truss") ? TRUSS_COURIER_FEE : 0);

    const submit = async () => {
        setError("");
        if (hasIndividualEvents && !isCompletePerson(individual)) {
            setError("Complete the individual participant card and select at least one individual event.");
            return;
        }
        if (!hasIndividualEvents && !hasTeamEvents) {
            setError("Select at least one individual or team event.");
            return;
        }
        const activeTeamEvents = enabledTeamEvents;

        if (activeTeamEvents.includes("truss") && !trussDeliveryAddress.trim()) {
            setError("Enter the postal address for Truss Combat materials.");
            return;
        }

        for (const event of activeTeamEvents) {
            const members = teamMembers[event];
            const uniqueEmails = new Set(members.map((member) => member.email.trim().toLowerCase()));
            if (!teamNames[event].trim() || members.length < 2 || members.length > 3 ||
                members.some((member) => !isCompletePerson(member)) || uniqueEmails.size !== members.length) {
                setError(`${eventNames[event]} requires a team name and 2–3 complete, distinct members.`);
                return;
            }
            if (members.some((member) => member.previousEvents?.includes(event))) {
                setError(`A verified member has already participated in ${eventNames[event]}.`);
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
                    deliveryAddress: event === "truss" ? trussDeliveryAddress.trim() : "",
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
        <form className={`registration-form mx-auto mt-5 flex w-full max-w-6xl flex-col gap-5 px-3 sm:px-5 ${advancedDesign ? "registration-form-advanced" : ""}`} onSubmit={(event) => { event.preventDefault(); submit(); }}>
            {(
                <ParticipantCard
                    title="Individual Participant"
                    subtitle="Select one or more individual events"
                    person={individual}
                    isRequired={hasIndividualEvents}
                    allowPriorRegistration={allowPriorRegistration}
                    onChange={(field, value) => setIndividual((current) => updatePerson(current, field, value))}
                    onPriorRegistrationVerified={() => {
                        setIsPrimaryVerificationPending(false);
                        setIndividualEvents([]);
                        setEnabledTeamEvents([]);
                        setCopyPreviousTeam(false);
                    }}
                    onPriorRegistrationSelectionChange={(selected) => {
                        setIsPrimaryVerificationPending(selected);
                        if (selected) {
                            setIndividualEvents([]);
                            setEnabledTeamEvents([]);
                            setCopyPreviousTeam(false);
                        }
                    }}
                    otpValidityMinutes={otpValidityMinutes}
                    headerAction={
                        <Button type="button" size="sm" color="danger" variant="light" onPress={clearAllData}>
                            Clear Data
                        </Button>
                    }
                >
                    <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
                        <CheckboxGroup isDisabled={isPrimaryVerificationPending} label="Individual Events" value={individualEvents} onValueChange={setIndividualEvents} orientation="horizontal">
                            {!individual.previousEvents?.includes("cad") && <Checkbox value="cad">CAD Expert</Checkbox>}
                            {!individual.previousEvents?.includes("mechamind") && <Checkbox value="mechamind">Mechamind</Checkbox>}
                            {!individual.previousEvents?.includes("management") && <Checkbox value="management">Management Maestro</Checkbox>}
                        </CheckboxGroup>
                        <p className="whitespace-nowrap text-sm font-semibold text-blue-700">
                            {forcedTotalFee !== undefined
                                ? `Temporary test total: ${forcedTotalFee} TK`
                                : "1 event: 400 TK · 2 events: 600 TK · 3 events: 800 TK"}
                        </p>
                    </div>
                </ParticipantCard>
            )}

            {availableTeamEvents.length > 0 && (
                <section className="team-event-selector rounded-2xl border border-orange-100 bg-orange-50/40 p-4 shadow-md">
                    <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
                        <div>
                            <h2 className="text-lg font-bold text-[#083b66]">Team Events <span className="text-sm font-normal text-gray-500">(2–3 members per event)</span></h2>
                            <CheckboxGroup
                                isDisabled={isPrimaryVerificationPending}
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
                                {!individual.previousEvents?.includes("truss") && <Checkbox value="truss">Truss Combat</Checkbox>}
                                {!individual.previousEvents?.includes("poster") && <Checkbox value="poster">Poster Presentation</Checkbox>}
                            </CheckboxGroup>
                        </div>
                        <div className="text-left text-sm font-semibold text-orange-600 lg:text-right">
                            <p>
                                {forcedTotalFee !== undefined
                                    ? `Temporary test total: ${forcedTotalFee} TK`
                                    : "Per person: 1 event = 400 TK · 2 events = 600 TK"}
                            </p>
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
                        setTeamMembers((current) => {
                            const members = [...current[event]];
                            members[index] = updatePerson(members[index], field, value);
                            return { ...current, [event]: members };
                        });
                    }}
                    onAdd={() => setTeamMembers({ ...teamMembers, [event]: [...teamMembers[event], emptyPerson()] })}
                    onRemove={() => setTeamMembers({ ...teamMembers, [event]: teamMembers[event].slice(0, -1) })}
                    lockFirstMember
                    showCopyPrevious={eventIndex === 1}
                    copyPrevious={eventIndex === 1 && copyPreviousTeam}
                    onCopyPreviousChange={setCopyPreviousTeam}
                    deliveryAddress={event === "truss" ? trussDeliveryAddress : ""}
                    onDeliveryAddressChange={event === "truss" ? setTrussDeliveryAddress : undefined}
                    allowPriorRegistration={allowPriorRegistration}
                    otpValidityMinutes={otpValidityMinutes}
                />
            ))}

            <section className="registration-total sticky bottom-4 z-50 flex flex-col items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-white p-4 shadow-xl md:flex-row">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Calculated Total</p>
                    <p className="text-2xl font-bold text-[#083b66]">{calculateFee()} TK</p>
                    {enabledTeamEvents.includes("truss") && (
                        <p className="mt-1 text-sm font-medium text-orange-700">
                            Note: Includes a one-time {TRUSS_COURIER_FEE} TK courier charge for Truss Combat materials.
                        </p>
                    )}
                </div>
                <Button type="submit" color="primary" size="lg" isLoading={isLoading} className="w-full font-semibold md:w-auto">Proceed to Payment</Button>
            </section>
            {error && <p className="rounded-xl bg-red-50 p-4 text-center font-semibold text-red-600">{error}</p>}
        </form>
    );
}

function ParticipantCard({ title, subtitle, person, onChange, children, isReadOnly = false, isRequired = true, headerAction, allowPriorRegistration = false, onPriorRegistrationVerified, onPriorRegistrationSelectionChange, registrationEvent, otpValidityMinutes = 10 }: {
    title: string;
    subtitle: string;
    person: Person;
    onChange: (field: keyof Person, value: string) => void;
    children?: React.ReactNode;
    isReadOnly?: boolean;
    isRequired?: boolean;
    headerAction?: React.ReactNode;
    allowPriorRegistration?: boolean;
    onPriorRegistrationVerified?: () => void;
    onPriorRegistrationSelectionChange?: (selected: boolean) => void;
    registrationEvent?: string;
    otpValidityMinutes?: number;
}) {
    const [registeredEarlier, setRegisteredEarlier] = useState(false);
    const [lookupEmail, setLookupEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0);

    useEffect(() => {
        if (!otpSent || otpSecondsRemaining <= 0) return;
        const timer = window.setInterval(() => {
            setOtpSecondsRemaining((remaining) => {
                if (remaining <= 1) {
                    window.clearInterval(timer);
                    setOtpSent(false);
                    setOtp("");
                    setVerificationMessage("Verification code expired. Request a new code.");
                    return 0;
                }
                return remaining - 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
    }, [otpSent, otpSecondsRemaining]);

    useEffect(() => {
        if (person.email) return;
        setRegisteredEarlier(false);
        setLookupEmail("");
        setOtp("");
        setOtpSent(false);
        setIsVerified(false);
        setVerificationMessage("");
    }, [person.email]);

    const requestOtp = async () => {
        setVerificationLoading(true);
        setVerificationMessage("");
        try {
            const response = await fetch("/api/registration-otp/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: lookupEmail, event: registrationEvent, validityMinutes: otpValidityMinutes })
            });
            const data = await response.json();
            setVerificationMessage(data.message);
            if (response.ok) {
                setOtpSent(true);
                setOtpSecondsRemaining(otpValidityMinutes * 60);
            }
        } catch {
            setVerificationMessage("Could not contact the verification service");
        } finally {
            setVerificationLoading(false);
        }
    };

    const verifyOtp = async () => {
        setVerificationLoading(true);
        setVerificationMessage("");
        try {
            const response = await fetch("/api/registration-otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: lookupEmail, otp, event: registrationEvent })
            });
            const data = await response.json();
            if (!response.ok) {
                setVerificationMessage(data.message);
                return;
            }
            (Object.keys(data.participant) as Array<keyof Person>).forEach((field) =>
                (onChange as any)(field, data.participant[field])
            );
            onPriorRegistrationVerified?.();
            setIsVerified(true);
            setVerificationMessage("Email verified. Previous registration information loaded.");
        } catch {
            setVerificationMessage("Could not contact the verification service");
        } finally {
            setVerificationLoading(false);
        }
    };

    return (
        <section className="participant-card rounded-2xl border border-blue-100 bg-white p-4 shadow-md">
            <div className="participant-card-header flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-[#083b66]">{title}</h2>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
                {headerAction}
            </div>
            {allowPriorRegistration && !isReadOnly && (
                <div className="mx-auto mt-3 w-full max-w-3xl rounded-md border border-blue-200 bg-blue-50/30 p-3">
                    <Checkbox
                        isSelected={registeredEarlier}
                        isDisabled={isVerified}
                        onValueChange={(selected) => {
                            setRegisteredEarlier(selected);
                            onPriorRegistrationSelectionChange?.(selected);
                            setOtpSent(false);
                            setOtp("");
                            setVerificationMessage("");
                        }}
                    >
                        Registered earlier
                    </Checkbox>
                    {registeredEarlier && !isVerified && (
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                            <Input
                                type="email"
                                label="Previously registered email"
                                labelPlacement="outside"
                                value={lookupEmail}
                                onValueChange={setLookupEmail}
                                className="w-full sm:w-72 sm:flex-none"
                            />
                            {otpSent && (
                                <div className="flex items-end gap-2">
                                    <Input
                                        inputMode="numeric"
                                        maxLength={6}
                                        label="Verification code"
                                        labelPlacement="outside"
                                        value={otp}
                                        onValueChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
                                        className="w-full sm:w-32 sm:flex-none"
                                    />
                                    <span className="mb-2 min-w-12 font-mono text-sm font-semibold text-rose-700">
                                        {Math.floor(otpSecondsRemaining / 60)}:{String(otpSecondsRemaining % 60).padStart(2, "0")}
                                    </span>
                                </div>
                            )}
                            <Button
                                type="button"
                                color="primary"
                                isLoading={verificationLoading}
                                isDisabled={!lookupEmail || (otpSent && otp.length !== 6)}
                                onPress={otpSent ? verifyOtp : requestOtp}
                            >
                                {otpSent ? "Verify Code" : "Send Code"}
                            </Button>
                        </div>
                    )}
                    {verificationMessage && (
                        <p className={`mt-2 text-sm font-medium ${isVerified || otpSent ? "text-green-700" : "text-rose-600"}`}>
                            {verificationMessage}
                        </p>
                    )}
                </div>
            )}
            <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly || isVerified} label="Full Name" labelPlacement="outside" value={person.name} onValueChange={(value) => onChange("name", value)} classNames={participantInputClasses} />
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly || isVerified} type="email" label="Email" labelPlacement="outside" value={person.email} onValueChange={(value) => onChange("email", value)} classNames={participantInputClasses} />
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly || isVerified} type="tel" label="Phone Number" labelPlacement="outside" value={person.phoneNumber} onValueChange={(value) => onChange("phoneNumber", value)} classNames={participantInputClasses} />
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly || isVerified} label="Department" labelPlacement="outside" value={person.department} onValueChange={(value) => onChange("department", value)} classNames={participantInputClasses} />
                <Input size="lg" isRequired={isRequired} isReadOnly={isReadOnly || isVerified} label="University" labelPlacement="outside" value={person.university} onValueChange={(value) => onChange("university", value)} classNames={participantInputClasses} />
            </div>
            {children && <div className="mt-3 border-t border-gray-100 pt-3">{children}</div>}
        </section>
    );
}

function TeamCard({ event, teamName, members, onTeamNameChange, onMemberChange, onAdd, onRemove, lockFirstMember, showCopyPrevious, copyPrevious, onCopyPreviousChange, deliveryAddress, onDeliveryAddressChange, allowPriorRegistration, otpValidityMinutes }: {
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
    deliveryAddress: string;
    onDeliveryAddressChange?: (value: string) => void;
    allowPriorRegistration: boolean;
    otpValidityMinutes: number;
}) {
    return (
        <section className="team-card overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-lg">
            <div className="team-card-header flex flex-col justify-between gap-2 bg-gradient-to-r from-[#083b66] to-[#0b4d8a] px-5 py-3 text-white sm:flex-row sm:items-center">
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
                <Input size="lg" isRequired label="Team Name" labelPlacement="outside" value={teamName} onValueChange={onTeamNameChange} classNames={participantInputClasses} />
                {event === "truss" && onDeliveryAddressChange && (
                    <Textarea
                        isRequired
                        minRows={3}
                        label="Postal Address"
                        labelPlacement="outside"
                        placeholder="Enter the complete postal address for receiving Truss Combat materials"
                        value={deliveryAddress}
                        onValueChange={onDeliveryAddressChange}
                        classNames={participantInputClasses}
                    />
                )}
                {members.map((member, index) => (
                    <ParticipantCard
                        key={index}
                        title={`Member ${index + 1}`}
                        subtitle={lockFirstMember && index === 0
                            ? "Copied from the individual participant card"
                            : `${eventNames[event]} team member`}
                        person={member}
                        allowPriorRegistration={allowPriorRegistration && index > 0}
                        registrationEvent={event}
                        otpValidityMinutes={otpValidityMinutes}
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
