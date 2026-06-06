import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react'
import axios from 'axios';
import { useEffect, useState } from 'react';
import CsvDownloadButton from 'react-json-to-csv';

export default function AlumniDataTable({ password }: { password: string }) {
    const [realTimeData, setRealTimeData] = useState<string[] | null>(null);

    axios.post('/api/fetchRegData', { password, table: 'alumni' })
        .then((response) => {
            setRealTimeData(response.data.data);
        })
        .catch((error) => {
            console.log("error: ", error);
        });


    if (!realTimeData) {
        return (
            <div className='flex gap-2 m-5'>
                <Spinner size='md' />
                <span className='text-2xl'>Loading...</span>
            </div>
        )
    }

    if (realTimeData) {

        return (
            <div className=''>
                <>
                    <h1 className='text-center text-2xl font-bold my-3'>Alumni Registration Data</h1>
                    <CsvDownloadButton
                        className='align-right'
                        data={realTimeData}
                        delimiter=';'
                    >
                        Download CSV
                    </CsvDownloadButton>

                    <Table className='pb-10' classNames={{
                        tr: 'border-b',
                        td: 'border-x',
                    }}>
                        <TableHeader>
                            <TableColumn>ID</TableColumn>
                            <TableColumn>Member Name</TableColumn>
                            <TableColumn>Roll No</TableColumn>
                            <TableColumn>Email</TableColumn>
                            <TableColumn>Phone Number</TableColumn>

                            <TableColumn>Current Position</TableColumn>
                            <TableColumn>Affiliation</TableColumn>
                            <TableColumn>Organization/Department/Company</TableColumn>

                            <TableColumn>Program Name</TableColumn>
                            <TableColumn>University</TableColumn>
                            <TableColumn>Country</TableColumn>

                            <TableColumn>Fee</TableColumn>
                            <TableColumn>Payment Status</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {realTimeData.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.rollno}</TableCell>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>{item.phonenumber}</TableCell>

                                    <TableCell>{item.currentposition}</TableCell>
                                    <TableCell>{item.affiliation}</TableCell>
                                    <TableCell>{item.company}</TableCell>

                                    <TableCell>{item.programname}</TableCell>
                                    <TableCell>{item.university}</TableCell>
                                    <TableCell>{item.country}</TableCell>
                                    <TableCell>{item.fee}</TableCell>
                                    <TableCell>{item.ispaid ? "Paid" : "Unpaid"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            </div>
        )
    }

    return (
        <div>
            <h1 className='text-center text-2xl font-bold'>No data available</h1>
        </div>
    )
}
