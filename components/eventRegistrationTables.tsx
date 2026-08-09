'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const eventNames: Record<string, string> = {
    cad: "CAD Expert",
    mechamind: "Mechamind",
    management: "Management Maestro",
    truss: "Truss Combat",
    poster: "Poster Presentation"
};

type PaymentFilter = "paid" | "all";

function downloadExcel(rows: Record<string, unknown>[], fileName: string) {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
        new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }),
        `${fileName}.xlsx`
    );
}

export default function EventRegistrationTables({ password }: { password: string }) {
    const [singleRows, setSingleRows] = useState<any[]>([]);
    const [teamRows, setTeamRows] = useState<any[]>([]);
    const [uniqueParticipantRows, setUniqueParticipantRows] = useState<any[]>([]);
    const [supportRows, setSupportRows] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [singlePaymentFilter, setSinglePaymentFilter] = useState<PaymentFilter>("all");
    const [teamPaymentFilter, setTeamPaymentFilter] = useState<PaymentFilter>("all");
    const [uniquePaymentFilter, setUniquePaymentFilter] = useState<PaymentFilter>("all");
    const [supportPaymentFilter, setSupportPaymentFilter] = useState<PaymentFilter>("all");

    useEffect(() => {
        Promise.all([
            axios.post("/api/fetchRegData", { password, table: "singleRegistration" }),
            axios.post("/api/fetchRegData", { password, table: "teamRegistration" }),
            axios.post("/api/fetchRegData", { password, table: "uniqueParticipants" }),
            axios.post("/api/fetchRegData", { password, table: "support" })
        ]).then(([single, team, uniqueParticipants, support]) => {
            setSingleRows(single.data.data);
            setTeamRows(team.data.data);
            setUniqueParticipantRows(uniqueParticipants.data.data);
            setSupportRows(support.data.data);
        }).catch((requestError) => {
            setError(requestError.response?.data?.message || "Unable to load registration data");
        });
    }, [password]);

    const filteredSingleRows = singlePaymentFilter === "paid"
        ? singleRows.filter((row) => row.ispaid)
        : singleRows;
    const filteredTeamRows = teamPaymentFilter === "paid"
        ? teamRows.filter((row) => row.ispaid)
        : teamRows;
    const filteredUniqueParticipantRows = uniquePaymentFilter === "paid"
        ? uniqueParticipantRows.filter((row) => row.ispaid)
        : uniqueParticipantRows;
    const filteredSupportRows = supportPaymentFilter === "paid"
        ? supportRows.filter((row) => row.ispaid)
        : supportRows;

    return (
        <div className="space-y-14">
            {error && <p className="rounded-xl bg-red-50 p-4 text-center font-semibold text-red-600">{error}</p>}

            <DataSection
                title="Individual Event Registrations"
                count={filteredSingleRows.length}
                filter={singlePaymentFilter}
                onFilterChange={setSinglePaymentFilter}
                onDownload={() => downloadExcel(
                    filteredSingleRows.map((row) => ({
                        "Registration ID": row.registration_id,
                        Name: row.name,
                        Email: row.email,
                        Phone: row.phonenumber,
                        Department: row.department,
                        University: row.university,
                        Events: row.events?.map((event: string) => eventNames[event] || event).join(", "),
                        "Total Fee": row.total_fee,
                        Payment: row.ispaid ? "Paid" : "Unpaid"
                    })),
                    "individual-event-registrations"
                )}
            >
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-[#083b66] text-white"><tr>
                        {['ID', 'Name', 'Email', 'Phone', 'Department', 'University', 'Events', 'Total Fee', 'Payment'].map((heading) =>
                            <th key={heading} className="border border-blue-900 p-3 text-left">{heading}</th>)}
                    </tr></thead>
                    <tbody>{filteredSingleRows.map((row) => <tr key={row.id} className="even:bg-blue-50/50">
                        <Cell>{row.registration_id}</Cell><Cell>{row.name}</Cell><Cell>{row.email}</Cell>
                        <Cell>{row.phonenumber}</Cell><Cell>{row.department}</Cell><Cell>{row.university}</Cell>
                        <Cell>{row.events?.map((event: string) => eventNames[event] || event).join(', ')}</Cell>
                        <Cell>{row.total_fee} TK</Cell><Cell><PaymentStatus paid={row.ispaid} /></Cell>
                    </tr>)}</tbody>
                </table>
            </DataSection>

            <DataSection
                title="Team Event Registrations"
                count={filteredTeamRows.length}
                filter={teamPaymentFilter}
                onFilterChange={setTeamPaymentFilter}
                onDownload={() => downloadExcel(
                    filteredTeamRows.flatMap((row) => (row.members || []).map((member: any) => ({
                        "Registration ID": row.registration_id,
                        Event: eventNames[row.event] || row.event,
                        "Team Name": row.teamname,
                        Member: member.name,
                        Email: member.email,
                        Phone: member.phoneNumber,
                        Department: member.department,
                        University: member.university,
                        "Total Fee": row.total_fee,
                        Payment: row.ispaid ? "Paid" : "Unpaid"
                    }))),
                    "team-event-registrations"
                )}
            >
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white"><tr>
                        {['ID', 'Event', 'Team Name', 'Member', 'Email', 'Phone', 'Department', 'University', 'Total Fee', 'Payment'].map((heading) =>
                            <th key={heading} className="border border-orange-700 p-3 text-left">{heading}</th>)}
                    </tr></thead>
                    <tbody>{filteredTeamRows.flatMap((row) => (row.members || []).map((member: any, index: number) =>
                        <tr key={`${row.id}-${index}`} className="even:bg-orange-50/50">
                            {index === 0 && <Cell rowSpan={row.members.length}>{row.registration_id}</Cell>}
                            {index === 0 && <Cell rowSpan={row.members.length}>{eventNames[row.event] || row.event}</Cell>}
                            {index === 0 && <Cell rowSpan={row.members.length}>{row.teamname}</Cell>}
                            <Cell>{member.name}</Cell><Cell>{member.email}</Cell><Cell>{member.phoneNumber}</Cell>
                            <Cell>{member.department}</Cell><Cell>{member.university}</Cell>
                            {index === 0 && <Cell rowSpan={row.members.length}>{row.total_fee} TK</Cell>}
                            {index === 0 && <Cell rowSpan={row.members.length}><PaymentStatus paid={row.ispaid} /></Cell>}
                        </tr>
                    ))}</tbody>
                </table>
            </DataSection>

            <DataSection
                title="Unique Participants"
                count={filteredUniqueParticipantRows.length}
                filter={uniquePaymentFilter}
                onFilterChange={setUniquePaymentFilter}
                onDownload={() => downloadExcel(
                    filteredUniqueParticipantRows.map((row) => ({
                        "Registration ID": row.registration_id,
                        Participant: row.name,
                        Email: row.email,
                        Phone: row.phonenumber,
                        Department: row.department,
                        University: row.university,
                        Events: row.events?.map((event: string) => eventNames[event] || event).join(", "),
                        Payment: row.ispaid ? "Paid" : "Unpaid"
                    })),
                    "unique-participants"
                )}
            >
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white"><tr>
                        {['Registration ID', 'Participant', 'Email', 'Phone', 'Department', 'University', 'Events', 'Payment'].map((heading) =>
                            <th key={heading} className="border border-emerald-800 p-3 text-left">{heading}</th>)}
                    </tr></thead>
                    <tbody>{filteredUniqueParticipantRows.map((row) => (
                        <tr key={`${row.registration_id}-${row.email}`} className="even:bg-emerald-50/50">
                            <Cell>{row.registration_id}</Cell>
                            <Cell>{row.name}</Cell>
                            <Cell>{row.email}</Cell>
                            <Cell>{row.phonenumber}</Cell>
                            <Cell>{row.department}</Cell>
                            <Cell>{row.university}</Cell>
                            <Cell>{row.events?.map((event: string) => eventNames[event] || event).join(', ')}</Cell>
                            <Cell><PaymentStatus paid={row.ispaid} /></Cell>
                        </tr>
                    ))}</tbody>
                </table>
            </DataSection>

            <DataSection
                title="Support Contributions"
                count={filteredSupportRows.length}
                filter={supportPaymentFilter}
                onFilterChange={setSupportPaymentFilter}
                onDownload={() => downloadExcel(
                    filteredSupportRows.map((row) => ({
                        ID: row.id,
                        Name: row.name,
                        Email: row.email,
                        Phone: row.phone,
                        Company: row.company_name,
                        Amount: row.amount,
                        "Transaction ID": row.tran_id,
                        Payment: row.ispaid ? "Paid" : "Unpaid"
                    })),
                    "support-contributions"
                )}
            >
                <table className="w-max min-w-full border-collapse text-sm">
                    <thead className="bg-[#6b2d84] text-white"><tr>
                        {['ID', 'Name', 'Email', 'Phone', 'Company', 'Amount', 'Transaction ID', 'Payment'].map((heading) =>
                            <th key={heading} className="whitespace-nowrap border border-purple-900 p-3 text-left">{heading}</th>)}
                    </tr></thead>
                    <tbody>{filteredSupportRows.map((row) => (
                        <tr key={row.id} className="even:bg-purple-50/50">
                            <Cell>{row.id}</Cell>
                            <Cell>{row.name}</Cell>
                            <Cell>{row.email}</Cell>
                            <Cell>{row.phone}</Cell>
                            <Cell>{row.company_name}</Cell>
                            <Cell>{row.amount} TK</Cell>
                            <Cell>{row.tran_id}</Cell>
                            <Cell><PaymentStatus paid={row.ispaid} /></Cell>
                        </tr>
                    ))}</tbody>
                </table>
            </DataSection>
        </div>
    );
}

function DataSection({ title, count, filter, onFilterChange, onDownload, children }: {
    title: string;
    count: number;
    filter: PaymentFilter;
    onFilterChange: (filter: PaymentFilter) => void;
    onDownload: () => void;
    children: React.ReactNode;
}) {
    return <section className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        <div className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
            <div>
                <h2 className="text-2xl font-bold text-[#083b66]">{title}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                    <FilterButton active={filter === "paid"} onClick={() => onFilterChange("paid")}>Paid Only</FilterButton>
                    <FilterButton active={filter === "all"} onClick={() => onFilterChange("all")}>Paid &amp; Unpaid</FilterButton>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-50 px-4 py-2 font-semibold text-[#083b66]">{count} records</span>
                <button
                    type="button"
                    onClick={onDownload}
                    disabled={count === 0}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Download Excel
                </button>
            </div>
        </div>
        <div className="w-full min-w-0 max-w-full overflow-x-auto">{children}</div>
    </section>;
}

function FilterButton({ active, onClick, children }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                active
                    ? "bg-[#083b66] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
            {children}
        </button>
    );
}

function Cell({ children, rowSpan }: { children: React.ReactNode; rowSpan?: number }) {
    return <td rowSpan={rowSpan} className="border border-gray-200 p-3 align-top">{children || '-'}</td>;
}

function PaymentStatus({ paid }: { paid: boolean }) {
    return (
        <span className={`font-bold ${paid ? "text-green-600" : "text-red-600"}`}>
            {paid ? "Paid" : "Unpaid"}
        </span>
    );
}
