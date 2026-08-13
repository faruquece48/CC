import { sql } from "@vercel/postgres";

import RegistrationForm from "@/components/registrationFormV2";

import paymentBySSL from "@/components/payments/ssl";

import generateUniqueId from "generate-unique-id";

import { siteConfig } from "@/config/site";

import { Timer } from "@/components/timer";

import Marquee from "react-fast-marquee";

import {
    getRegistrationImpactMessage,
    getRegistrationPhase,
    getRegistrationStartRemainingMessage,
    REGISTRATION_START_DATE,
    REGISTRATION_TEST_START_DATE
} from "@/config/deadline";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/adminSession";
import { findPriorParticipant } from "@/lib/priorRegistration";
import { TRUSS_COURIER_FEE } from "@/config/registrationFee";

export const dynamic = "force-dynamic";

export default function RegistrationPage({ testMode = false }: { testMode?: boolean }) {

    const registrationStartDate = testMode
        ? REGISTRATION_TEST_START_DATE
        : REGISTRATION_START_DATE;
    const registrationPhase = getRegistrationPhase(new Date(), registrationStartDate);
    const isRegistrationVisible = registrationPhase !== "closed";

    const registrationMessage = getRegistrationImpactMessage(new Date(), registrationStartDate);

    // FORM SUBMISSION
    const handleSubmission = async (
        formData: any
    ) => {

        "use server";

        if (
            testMode &&
            !isValidAdminSession(cookies().get(ADMIN_SESSION_COOKIE)?.value)
        ) {
            return {
                status: 401,
                message: "Unauthorized test registration",
                url: ""
            };
        }

        // BLOCK SUBMISSION AFTER DEADLINE
        const submissionPhase = getRegistrationPhase(new Date(), registrationStartDate);

        if (typeof submissionPhase !== "number") {

            return {

                status: 403,

                message: submissionPhase === "not_started"
                    ? getRegistrationStartRemainingMessage(new Date(), registrationStartDate)
                    : "Registration Closed",

                url: ""

            };
        }

        let lastId = 1000;

        let userId = lastId;

        const individualRegistration = formData.individualRegistration;
        const teamRegistrations = Array.isArray(formData.teamRegistrations)
            ? formData.teamRegistrations
            : [];
        const validIndividualEvents = ["cad", "mechamind", "management"];
        const validTeamEvents = ["truss", "poster"];
        const isPersonComplete = (person: any) => person &&
            ["name", "email", "phoneNumber", "department", "university"]
                .every((field) => typeof person[field] === "string" && person[field].trim());

        if (
            (individualRegistration && (
                !isPersonComplete(individualRegistration.participant) ||
                !Array.isArray(individualRegistration.events) ||
                individualRegistration.events.length === 0 ||
                individualRegistration.events.some((event: string) => !validIndividualEvents.includes(event))
            )) ||
            teamRegistrations.some((team: any) =>
                !validTeamEvents.includes(team.event) ||
                typeof team.teamName !== "string" || !team.teamName.trim() ||
                (team.event === "truss" && (
                    typeof team.deliveryAddress !== "string" || !team.deliveryAddress.trim()
                )) ||
                !Array.isArray(team.members) || team.members.length < 2 || team.members.length > 3 ||
                team.members.some((member: any) => !isPersonComplete(member)) ||
                new Set(team.members.map((member: any) => member.email.trim().toLowerCase())).size !== team.members.length
            ) ||
            (!individualRegistration && teamRegistrations.length === 0)
        ) {
            return {
                status: 400,
                message: "Please complete all participant and event details",
                url: ""
            };
        }

        const entries: Array<{ person: any; event: string }> = [];
        individualRegistration?.events.forEach((event: string) =>
            entries.push({ person: individualRegistration.participant, event })
        );
        teamRegistrations.forEach((team: any) => team.members.forEach((person: any) =>
            entries.push({ person, event: team.event })
        ));

        const people = new Map<string, { person: any; events: Set<string> }>();
        entries.forEach(({ person, event }) => {
            const email = person.email.trim().toLowerCase();
            if (!people.has(email)) people.set(email, { person, events: new Set() });
            people.get(email)!.events.add(event);
        });
        const feeScale = [0, 400, 600, 800, 900, 1000];
        const peopleWithHistory = await Promise.all(
            Array.from(people.entries()).map(async ([email, item]) => ({
                email,
                item,
                previousEvents: new Set((await findPriorParticipant(email))?.previousEvents || [])
            }))
        );
        const duplicateEvent = peopleWithHistory.find(({ item, previousEvents }) =>
            Array.from(item.events).some((event) => previousEvents.has(event))
        );
        if (duplicateEvent) {
            return {
                status: 400,
                message: `${duplicateEvent.item.person.name} has already participated in one of the selected events`,
                url: ""
            };
        }
        const participantCalculatedFee = peopleWithHistory.reduce((total, { item, previousEvents }) => {
            const combinedEvents = new Set([...previousEvents, ...item.events]);
            return total +
                feeScale[Math.min(combinedEvents.size, 5)] -
                feeScale[Math.min(previousEvents.size, 5)];
        }, 0);
        const regularCalculatedFee = participantCalculatedFee +
            (teamRegistrations.some((team: any) => team.event === "truss") ? TRUSS_COURIER_FEE : 0);
        const calculatedFee = regularCalculatedFee;
        const uniquePeople = Array.from(people.values()).map((item) => item.person);
        const primary = individualRegistration?.participant || uniquePeople[0];
        const second = uniquePeople[1];
        const third = uniquePeople[2];
        const selectedEvents = Array.from(new Set(entries.map((entry) => entry.event)));

        // GET LAST USER ID
        try {

            const result =
                await sql`

                    SELECT id

                    FROM registrationData

                    ORDER BY id DESC

                    LIMIT 1

                `;

            userId =
                result.rows[0]?.id + 1 || 1001;

            console.log(
                "User ID:",
                userId
            );

        } catch (error) {

            console.error(
                "SQL ERROR:",
                error
            );
        }

        try {

            await sql`
                ALTER TABLE teamRegistrationData
                ADD COLUMN IF NOT EXISTS delivery_address TEXT NOT NULL DEFAULT ''
            `;

            // GENERATE TRANSACTION ID
            const _tran_id =
                generateUniqueId({

                    length: 12,

                    useLetters: false

                });

            const tran_id =

                'BECMCC' +

                siteConfig.serial.replace('.', '') +

                '-' +

                userId +

                '-' +

                _tran_id;

            // INSERT DATA
            await sql`

                INSERT INTO registrationData (

                    id,

                    isteam,

                    teamname,

                    member_1,

                    member_2,

                    member_2_email,

                    member_2_phonenumber,

                    member_2_department,

                    member_2_university,

                    member_3,

                    member_3_email,

                    member_3_phonenumber,

                    member_3_department,

                    member_3_university,

                    email,

                    phonenumber,

                    department,

                    university,

                    criteria,

                    fee,

                    ispaid,

                    tran_id

                )

                VALUES (

                    ${userId},

                    ${teamRegistrations.length > 0},

                    ${teamRegistrations.map((team: any) => team.teamName).join(" / ")},

                    ${primary.name},

                    ${second?.name || ""},

                    ${second?.email || ""},

                    ${second?.phoneNumber || ""},

                    ${second?.department || ""},

                    ${second?.university || ""},

                    ${third?.name || ""},

                    ${third?.email || ""},

                    ${third?.phoneNumber || ""},

                    ${third?.department || ""},

                    ${third?.university || ""},

                    ${primary.email},

                    ${primary.phoneNumber},

                    ${primary.department},

                    ${primary.university},

                    ${selectedEvents as any},

                    ${calculatedFee},

                    false,

                    ${tran_id}

                )

            `;

            if (individualRegistration) {
                const participant = individualRegistration.participant;
                await sql`
                    INSERT INTO singleRegistrationData (
                        registration_id, name, email, phonenumber,
                        department, university, events
                    ) VALUES (
                        ${userId}, ${participant.name}, ${participant.email},
                        ${participant.phoneNumber}, ${participant.department},
                        ${participant.university}, ${individualRegistration.events as any}
                    )
                `;
            }

            for (const team of teamRegistrations) {
                await sql`
                    INSERT INTO teamRegistrationData (
                        registration_id, event, teamname, delivery_address, members
                    ) VALUES (
                        ${userId}, ${team.event}, ${team.teamName},
                        ${team.event === "truss" ? team.deliveryAddress.trim() : ""},
                        ${JSON.stringify(team.members)}::jsonb
                    )
                `;
            }

            console.log(
                "Registration Submitted"
            );

            // SSL PAYMENT
            const {
                status,
                data,
                message
            } = await paymentBySSL({

                userId: userId,

                tran_id: tran_id,

                ...formData,

                fee: calculatedFee,

                member1: primary.name,

                email: primary.email,

                phoneNumber: primary.phoneNumber

            });

            console.log(
                "SSL PAYMENT RESPONSE:",
                data
            );

            // SUCCESS
            if (

                status === 200 &&

                data?.GatewayPageURL

            ) {

                return {

                    status: 200,

                    message: "Success",

                    url: data.GatewayPageURL

                };
            }

            console.log(
                "SSL PAYMENT FAILED:",
                data
            );

            // Remove the unpaid draft record when no gateway session was created.
            await sql`
                DELETE FROM registrationData
                WHERE id = ${userId} AND ispaid = FALSE
            `;

            return {
                status: 500,
                message: message || "Payment initialization failed",
                url: ""
            };

        } catch (error) {

            console.error(
                "SQL / PAYMENT ERROR:",
                error
            );

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown registration error";

            return {
                status: 500,
                message:
                    process.env.NODE_ENV === "development"
                        ? errorMessage
                        : "Internal Server Error",
                url: ""
            };
        }

        return {

            status: 500,

            message: "Internal Server Error",

            url: ""

        };
    };

    return (

        <div className="flex flex-col w-full">

            {

                isRegistrationVisible ? (

                    <>

                        {/* TIMER */}
                        <Timer registrationStartDate={registrationStartDate} />

                        {/* MARQUEE */}
                        <Marquee
                            className="py-5"
                            gradient={false}
                            gradientColor="white"
                            speed={100}
                            pauseOnHover
                        >

                            <p className="text-2xl font-bold text-center text-rose-600">

                                {registrationMessage}

                            </p>

                        </Marquee>

                        {/* FORM */}
                        <RegistrationForm
                            handleSubmission={handleSubmission}
                            allowPriorRegistration
                        />

                    </>

                ) : (

                    // CLOSED MESSAGE
                    <div className="flex flex-col items-center justify-center py-32 text-center">

                        <h2 className="mt-10 text-4xl font-bold text-rose-600">

                            Registration is Closed Now

                        </h2>

                        <p className="mt-4 text-lg text-gray-600">

                            Stay tuned for more updates.

                        </p>

                       

                    </div>

                )

            }

        </div>
    );
}
