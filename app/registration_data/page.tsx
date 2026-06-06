'use client';

import { useState } from "react";

import UserDataTable from "@/components/userTable";
import AlumniDataTable from "@/components/alumniTable";

export default function RegistrationDataPage() {

    const [inputPassword, setInputPassword] =
        useState("");

    const [authentic, setAuthentic] =
        useState(false);

    const [error, setError] =
        useState("");

    const handlePassword = async () => {

        try {

            const response = await fetch(
                "/api/fetchRegData",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        password: inputPassword,
                        table: "registration"
                    })
                }
            );

            if (response.ok) {

                setAuthentic(true);
                setError("");

            } else {

                setAuthentic(false);

                setError(
                    "Incorrect Password"
                );
            }

        } catch (error) {

            console.log(error);

            setError(
                "Something went wrong"
            );
        }
    };

    if (!authentic) {

        return (

            <div className="flex flex-col items-center mt-20 gap-5">

                <h1 className="text-4xl font-bold">
                    Registration Data Access
                </h1>

                <input
                    type="password"
                    placeholder="Enter Password"
                    className="border p-3 rounded w-80"
                    onChange={(e) =>
                        setInputPassword(
                            e.target.value
                        )
                    }
                />

                <button
                    onClick={handlePassword}
                    className="bg-black text-white px-6 py-3 rounded"
                >
                    Submit
                </button>

                {
                    error && (

                        <p className="text-red-600">
                            {error}
                        </p>
                    )
                }

            </div>
        );
    }

    return (

        <div className="p-10">

            <UserDataTable
                password={inputPassword}
            />

            <AlumniDataTable
                password={inputPassword}
            />

        </div>
    );
}