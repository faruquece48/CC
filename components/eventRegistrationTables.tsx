'use client';

import axios from "axios";
import { useEffect, useState } from "react";

const eventNames: Record<string, string> = {
    cad: "CAD Expert",
    mechamind: "Mechamind",
    management: "Management Maestro",
    truss: "Truss Combat",
    poster: "Poster Presentation"
};

export default function EventRegistrationTables({ password }: { password: string }) {
    const [singleRows, setSingleRows] = useState<any[]>([]);
    const [teamRows, setTeamRows] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            axios.post("/api/fetchRegData", { password, table: "singleRegistration" }),
            axios.post("/api/fetchRegData", { password, table: "teamRegistration" })
        ]).then(([single, team]) => {
            setSingleRows(single.data.data);
            setTeamRows(team.data.data);
        }).catch((requestError) => {
            setError(requestError.response?.data?.message || "Unable to load registration data");
        });
    }, [password]);

    return (
        <div className="space-y-14">
            {error && <p className="rounded-xl bg-red-50 p-4 text-center font-semibold text-red-600">{error}</p>}

            <DataSection title="Individual Event Registrations" count={singleRows.length}>
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-[#083b66] text-white"><tr>
                        {['ID', 'Name', 'Email', 'Phone', 'Department', 'University', 'Events', 'Total Fee', 'Payment'].map((heading) =>
                            <th key={heading} className="border border-blue-900 p-3 text-left">{heading}</th>)}
                    </tr></thead>
                    <tbody>{singleRows.map((row) => <tr key={row.id} className="even:bg-blue-50/50">
                        <Cell>{row.registration_id}</Cell><Cell>{row.name}</Cell><Cell>{row.email}</Cell>
                        <Cell>{row.phonenumber}</Cell><Cell>{row.department}</Cell><Cell>{row.university}</Cell>
                        <Cell>{row.events?.map((event: string) => eventNames[event] || event).join(', ')}</Cell>
                        <Cell>{row.total_fee} TK</Cell><Cell><PaymentStatus paid={row.ispaid} /></Cell>
                    </tr>)}</tbody>
                </table>
            </DataSection>

            <DataSection title="Team Event Registrations" count={teamRows.length}>
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white"><tr>
                        {['ID', 'Event', 'Team Name', 'Member', 'Email', 'Phone', 'Department', 'University', 'Total Fee', 'Payment'].map((heading) =>
                            <th key={heading} className="border border-orange-700 p-3 text-left">{heading}</th>)}
                    </tr></thead>
                    <tbody>{teamRows.flatMap((row) => (row.members || []).map((member: any, index: number) =>
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
        </div>
    );
}

function DataSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
    return <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between p-6">
            <h2 className="text-2xl font-bold text-[#083b66]">{title}</h2>
            <span className="rounded-full bg-blue-50 px-4 py-2 font-semibold text-[#083b66]">{count} records</span>
        </div>
        <div className="overflow-x-auto">{children}</div>
    </section>;
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
