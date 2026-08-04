'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function UserDataTable({
    password
}: {
    password: string;
}) {

    const [data, setData] = useState<any[]>([]);
    const [supportData, setSupportData] = useState<any[]>([]);

    // Registration ID starts from 1001
    const formatRegistrationId = (id: number) => {
        return 1000 + Number(id);
    };

    // Event Mapping
    const getEventName = (key: string) => {

        const eventMap: any = {
            cad: "CAD Expert",
            mechamind: "Mechamind",
            truss: "Truss Combat",
            management: "Management Maestro",
            poster: "Poster Presentation"
        };

        return eventMap[key] || key;
    };

    // Format Multiple Events
    const formatCriteria = (criteria: string[]) => {

        if (!criteria || criteria.length === 0) {
            return "No Event";
        }

        return criteria
            .map((item) => getEventName(item))
            .join(", ");
    };

    // Fetch Registration Data
    useEffect(() => {

        axios.post("/api/fetchRegData", {
            password,
            table: "registration"
        })
            .then((response) => {
                setData(response.data.data);
            })
            .catch((error) => {
                console.log(error);
            });

    }, [password]);

    // Fetch Support Data
    useEffect(() => {

        axios.post("/api/fetchRegData", {
            password,
            table: "support"
        })
            .then((response) => {
                setSupportData(response.data.data);
            })
            .catch((error) => {
                console.log("Support fetch error:", error);
            });

    }, [password]);

    // Separate Individual & Team Data
    const individualData = data.filter(
        (item) => !item.isteam
    );

    const teamData = data.filter(
        (item) => item.isteam
    );

    // Individual Summary
    const individualPaid = individualData.filter(
        (i) => i.ispaid
    );

    const individualUnpaid = individualData.filter(
        (i) => !i.ispaid
    );

    const individualFeeCollected =
        individualPaid.reduce(
            (sum, i) => sum + Number(i.fee),
            0
        );

    const individualFeePending =
        individualUnpaid.reduce(
            (sum, i) => sum + Number(i.fee),
            0
        );

    // Team Summary
    const teamPaid = teamData.filter(
        (i) => i.ispaid
    );

    const teamUnpaid = teamData.filter(
        (i) => !i.ispaid
    );

    const teamFeeCollected =
        teamPaid.reduce(
            (sum, i) => sum + Number(i.fee),
            0
        );

    const teamFeePending =
        teamUnpaid.reduce(
            (sum, i) => sum + Number(i.fee),
            0
        );

    // Excel Export Function
    const exportToExcel = (
        exportData: any[],
        fileName: string
    ) => {

        const worksheet =
            XLSX.utils.json_to_sheet(exportData);

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Participants"
        );

        const excelBuffer = XLSX.write(
            workbook,
            {
                bookType: "xlsx",
                type: "array"
            }
        );

        const fileData = new Blob(
            [excelBuffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );

        saveAs(
            fileData,
            `${fileName}.xlsx`
        );
    };

    // Individual Excel Data
    const formattedIndividualData =
        individualData.map((item) => ({
            ID: formatRegistrationId(item.id),
            "Participant Name": item.member_1,
            Email: item.email,
            Phone: item.phonenumber,
            Department: item.department,
            University: item.university,
            Events: formatCriteria(item.criteria),
            Fee: item.fee,
            Payment: item.ispaid
                ? "Paid"
                : "Unpaid"
        }));

    // Team Excel Data
    const formattedTeamData =
        teamData.map((item) => ({
            ID: formatRegistrationId(item.id),
            "Team Name": item.teamname,
            "Member 1": item.member_1,
            "Member 2": item.member_2,
            Email: item.email,
            Phone: item.phonenumber,
            Department: item.department,
            University: item.university,
            Events: formatCriteria(item.criteria),
            Fee: item.fee,
            Payment: item.ispaid
                ? "Paid"
                : "Unpaid"
        }));

    // Support Excel Data
    const formattedSupportData =
        supportData.map((item, index) => ({
            "Sl. No.": index + 1,
            Name: item.name,
            Email: item.email,
            Phone: item.phone,
            "Company Name":
                item.company_name ||
                item.company ||
                "—",
            Amount: item.amount,
            "Payment Status":
                item.ispaid
                    ? "Paid"
                    : "Unpaid"
        }));

    // Summary Card Component
    const SummaryCards = ({
        total,
        paid,
        unpaid,
        feeCollected,
        feePending,
        color
    }: {
        total: number;
        paid: number;
        unpaid: number;
        feeCollected: number;
        feePending: number;
        color: "blue" | "green";
    }) => {

        const accent =
            color === "blue"
                ? {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    text: "text-blue-700"
                }
                : {
                    bg: "bg-green-50",
                    border: "border-green-200",
                    text: "text-green-700"
                };

        return (

            <div className="flex flex-wrap gap-4 mb-6">

                <div className={`${accent.bg} border ${accent.border} rounded-xl px-6 py-4 text-center`}>
                    <p className="text-sm text-gray-500">
                        Total
                    </p>

                    <p className={`text-3xl font-bold ${accent.text}`}>
                        {total}
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 text-center">
                    <p className="text-sm text-gray-500">
                        Paid
                    </p>

                    <p className="text-3xl font-bold text-green-700">
                        {paid}
                    </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-center">
                    <p className="text-sm text-gray-500">
                        Unpaid
                    </p>

                    <p className="text-3xl font-bold text-red-600">
                        {unpaid}
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 text-center">
                    <p className="text-sm text-gray-500">
                        Collected (BDT)
                    </p>

                    <p className="text-3xl font-bold text-green-700">
                        {feeCollected.toLocaleString()}
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 text-center">
                    <p className="text-sm text-gray-500">
                        Pending (BDT)
                    </p>

                    <p className="text-3xl font-bold text-yellow-600">
                        {feePending.toLocaleString()}
                    </p>
                </div>

            </div>
        );
    };

    return (

        <div className="w-full overflow-x-auto p-5">

            {/* ===================== INDIVIDUAL REGISTRATION ===================== */}

            <div className="flex justify-between items-center mb-4">

                <h1 className="text-4xl font-bold">
                    Individual Registration
                </h1>

                <button
                    onClick={() =>
                        exportToExcel(
                            formattedIndividualData,
                            "individual_registration"
                        )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Download Excel
                </button>

            </div>

            <SummaryCards
                total={individualData.length}
                paid={individualPaid.length}
                unpaid={individualUnpaid.length}
                feeCollected={individualFeeCollected}
                feePending={individualFeePending}
                color="green"
            />

            <div className="overflow-x-auto">

                <table className="min-w-full border-collapse border border-gray-400 mb-16">

                    <thead>

                        <tr className="bg-gray-200">

                            <th className="border p-3 text-center">ID</th>

                            <th className="border p-3 text-center">
                                Participant Name
                            </th>

                            <th className="border p-3 text-center">
                                Email
                            </th>

                            <th className="border p-3 text-center">
                                Phone
                            </th>

                            <th className="border p-3 text-center">
                                Department
                            </th>

                            <th className="border p-3 text-center">
                                University
                            </th>

                            <th className="border p-3 text-center">
                                Events
                            </th>

                            <th className="border p-3 text-center">
                                Fee
                            </th>

                            <th className="border p-3 text-center">
                                Payment
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {individualData.map((item) => (

                            <tr
                                key={item.id}
                                className="even:bg-gray-50"
                            >

                                {/* CENTER */}
                                <td className="border p-3 text-center">
                                    {formatRegistrationId(item.id)}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {item.member_1}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 break-all text-left">
                                    {item.email}
                                </td>

                                {/* CENTER */}
                                <td className="border p-3 text-center">
                                    {item.phonenumber}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {item.department}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {item.university}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {formatCriteria(item.criteria)}
                                </td>

                                {/* CENTER */}
                                <td className="border p-3 text-center">
                                    {item.fee}
                                </td>

                                {/* CENTER */}
                                <td
                                    className={`border p-3 font-semibold text-center ${
                                        item.ispaid
                                            ? "text-green-700"
                                            : "text-red-600"
                                    }`}
                                >
                                    {item.ispaid
                                        ? "Paid"
                                        : "Unpaid"}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* ===================== TEAM REGISTRATION ===================== */}

            <div className="flex justify-between items-center mb-4">

                <h1 className="text-4xl font-bold">
                    Team Registration
                </h1>

                <button
                    onClick={() =>
                        exportToExcel(
                            formattedTeamData,
                            "team_registration"
                        )
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Download Excel
                </button>

            </div>

            <SummaryCards
                total={teamData.length}
                paid={teamPaid.length}
                unpaid={teamUnpaid.length}
                feeCollected={teamFeeCollected}
                feePending={teamFeePending}
                color="blue"
            />

            <div className="overflow-x-auto">

                <table className="min-w-full border-collapse border border-gray-400 mb-20">

                    <thead>

                        <tr className="bg-gray-200">

                            <th className="border p-3 text-center">ID</th>

                            <th className="border p-3 text-center">
                                Team Name
                            </th>

                            <th className="border p-3 text-center">
                                Member 1
                            </th>

                            <th className="border p-3 text-center">
                                Member 2
                            </th>

                            <th className="border p-3 text-center">
                                Email
                            </th>

                            <th className="border p-3 text-center">
                                Phone
                            </th>

                            <th className="border p-3 text-center">
                                Department
                            </th>

                            <th className="border p-3 text-center">
                                University
                            </th>

                            <th className="border p-3 text-center">
                                Events
                            </th>

                            <th className="border p-3 text-center">
                                Fee
                            </th>

                            <th className="border p-3 text-center">
                                Payment
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {teamData.map((item) => (

                            <tr
                                key={item.id}
                                className="even:bg-gray-50"
                            >

                                {/* CENTER */}
                                <td className="border p-3 text-center">
                                    {formatRegistrationId(item.id)}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {item.teamname}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {item.member_1}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {item.member_2}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 break-all text-left">
                                    {item.email}
                                </td>

                                {/* CENTER */}
                                <td className="border p-3 text-center">
                                    {item.phonenumber}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {item.department}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {item.university}
                                </td>

                                {/* LEFT */}
                                <td className="border p-3 text-left">
                                    {formatCriteria(item.criteria)}
                                </td>

                                {/* CENTER */}
                                <td className="border p-3 text-center">
                                    {item.fee}
                                </td>

                                {/* CENTER */}
                                <td
                                    className={`border p-3 font-semibold text-center ${
                                        item.ispaid
                                            ? "text-green-700"
                                            : "text-red-600"
                                    }`}
                                >
                                    {item.ispaid
                                        ? "Paid"
                                        : "Unpaid"}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* ===================== SUPPORT DATA ===================== */}

            <div className="mt-16">

                <div className="flex justify-between items-center mb-4">

                    <h1 className="text-4xl font-bold text-emerald-700">
                        💚 Support Contributions
                    </h1>

                    <button
                        onClick={() =>
                            exportToExcel(
                                formattedSupportData,
                                "support_contributions"
                            )
                        }
                        className="bg-emerald-600 text-white px-4 py-2 rounded"
                    >
                        Download Excel
                    </button>

                </div>

                {/* SUPPORT SUMMARY */}

                <div className="flex flex-wrap gap-4 mb-6">

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 text-center">

                        <p className="text-sm text-gray-500">
                            Total Supporters
                        </p>

                        <p className="text-3xl font-bold text-emerald-700">
                            {supportData.length}
                        </p>

                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 text-center">

                        <p className="text-sm text-gray-500">
                            Total Collected (BDT)
                        </p>

                        <p className="text-3xl font-bold text-emerald-700">
                            {supportData
                                .filter((s) => s.ispaid)
                                .reduce(
                                    (sum, s) =>
                                        sum +
                                        Number(s.amount),
                                    0
                                )
                                .toLocaleString()}
                        </p>

                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 text-center">

                        <p className="text-sm text-gray-500">
                            Pending (BDT)
                        </p>

                        <p className="text-3xl font-bold text-yellow-600">
                            {supportData
                                .filter((s) => !s.ispaid)
                                .reduce(
                                    (sum, s) =>
                                        sum +
                                        Number(s.amount),
                                    0
                                )
                                .toLocaleString()}
                        </p>

                    </div>

                </div>

                {/* SUPPORT TABLE */}

                <div className="overflow-x-auto">

                    <table className="min-w-full border-collapse border border-gray-400 mb-20">

                        <thead>

                            <tr className="bg-emerald-100">

                                <th className="border p-3 text-center">
                                    Sl. No.
                                </th>

                                <th className="border p-3 text-center">
                                    Name
                                </th>

                                <th className="border p-3 text-center">
                                    Email
                                </th>

                                <th className="border p-3 text-center">
                                    Phone
                                </th>

                                <th className="border p-3 text-center">
                                    Company Name
                                </th>

                                <th className="border p-3 text-center">
                                    Amount
                                </th>

                                <th className="border p-3 text-center">
                                    Payment
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {supportData.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className="border p-5 text-center text-gray-400"
                                    >
                                        No support contributions yet.
                                    </td>

                                </tr>

                            ) : (

                                supportData.map((item, index) => (

                                    <tr
                                        key={item.id}
                                        className="even:bg-gray-50"
                                    >

                                        {/* CENTER */}
                                        <td className="border p-3 text-center">
                                            {item.id}
                                        </td>

                                        {/* LEFT */}
                                        <td className="border p-3 text-left">
                                            {item.name || "—"}
                                        </td>

                                        {/* LEFT */}
                                        <td className="border p-3 break-all text-left">
                                            {item.email || "—"}
                                        </td>

                                        {/* CENTER */}
                                        <td className="border p-3 text-center">
                                            {item.phone || "—"}
                                        </td>

                                        {/* LEFT */}
                                        <td className="border p-3 text-center">
                                            {item.company_name ||
                                                item.company ||
                                                "—"}
                                        </td>

                                        {/* CENTER */}
                                        <td className="border p-3 font-semibold text-center">
                                            {Number(
                                                item.amount || 0
                                            ).toLocaleString()}
                                        </td>

                                        {/* CENTER */}
                                        <td
                                            className={`border p-3 font-semibold text-center ${
                                                item.ispaid
                                                    ? "text-green-700"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {item.ispaid
                                                ? "Paid"
                                                : "Unpaid"}
                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}