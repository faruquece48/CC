import { saveAs } from 'file-saver';

export const saveToCSV = (data: any[], filename: string) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
};

const convertToCSV = (data: any[]): string => {
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(','));
    return [header, ...rows].join('\n');
};