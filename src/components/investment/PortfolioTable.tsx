import React from 'react';
import type { PortfolioItem } from '../../types/investiment';

interface PortfolioTableProps {
    portfolioData: PortfolioItem[];
    formatMoney: (value: number) => string;
}

interface TableHeaderProps {
    columns: string[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
    <thead className="bg-slate-50 sticky top-0">
        <tr>
            {columns.map((column, index) => (
                <th
                    key={index}
                    className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${index === columns.length - 1 ? 'text-right' : ''}`}
                >
                    {column}
                </th>
            ))}
        </tr>
    </thead>
);

interface TableRowProps {
    item: PortfolioItem;
    formatMoney: (value: number) => string;
}

const TableRow: React.FC<TableRowProps> = ({ item, formatMoney }) => (
    <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
            {item.category}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
            {item.investment}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
            {item.score}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
            {item.price > 0 ? formatMoney(item.price) : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">
            {formatMoney(item.totalAmount)}
        </td>
    </tr>
);

const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolioData, formatMoney }) => {
    const columns = [
        'Categoria',
        'Investimento',
        'Nota',
        'Cotação',
        'Total'
    ];

    return (
        <div className="mt-8 space-y-6">
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <TableHeader columns={columns} />
                        <tbody className="bg-white divide-y divide-slate-200">
                            {portfolioData.map((item, index) => (
                                <TableRow
                                    key={index}
                                    item={item}
                                    formatMoney={formatMoney}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PortfolioTable;
