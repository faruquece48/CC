import { title } from "@/components/primitives";

import { sql } from "@vercel/postgres";

import RegistrationForm from "@/components/registrationForm";

import paymentBySSL from "@/components/payments/ssl";

import generateUniqueId from "generate-unique-id";

import { siteConfig } from "@/config/site";

import { Timer } from "@/components/timer";

import Marquee from "react-fast-marquee";

import { getRegistrationPhase } from "@/config/deadline";

import AdsterraBanner from "@/components/AdsterraBanner";

export default function Page() {

    const registrationPhase = getRegistrationPhase();
    const isRegistrationClosed = registrationPhase === "closed";

    const registrationMessage =
        registrationPhase === 2
            ? "The registration deadline has been extended in response to students’ requests."
            : registrationPhase === 3
                ? "The registration deadline has been extended once again to allow students additional time to complete their registration."
                : "Registration is Live Now!";

    // FORM SUBMISSION
    const handleSubmission = async (
        formData: any
    ) => {

        "use server";

        // BLOCK SUBMISSION AFTER DEADLINE
        if (isRegistrationClosed) {

            return {

                status: 403,

                message: "Registration Closed",

                url: ""

            };
        }

        let lastId = 1000;

        let userId = lastId;

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

                    ${formData.isTeamSelected},

                    ${formData.teamName || ""},

                    ${formData.member1},

                    ${formData.member2 || ""},

                    ${formData.member2Email || ""},

                    ${formData.member2PhoneNumber || ""},

                    ${formData.member2Department || ""},

                    ${formData.member2University || ""},

                    ${formData.email},

                    ${formData.phoneNumber},

                    ${formData.department},

                    ${formData.university},

                    ${formData.criteria},

                    ${formData.fee},

                    false,

                    ${tran_id}

                )

            `;

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

                ...formData

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

                !isRegistrationClosed ? (

                    <>

                        {/* TIMER */}
                        <Timer />

                        {/* TITLE */}
                        <h1 className={title()}>

                            Registration

                        </h1>

                        {/* MARQUEE */}
                        <Marquee
                            className="py-10"
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
                        />

                        {/* AD BANNER */}
                        <div className="mt-14 flex justify-center">
                            <AdsterraBanner
                                adKey="23cf8dbb69977b0d73645731506658fb"
                                width={728}
                                height={90}
                            />
                        </div>

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
