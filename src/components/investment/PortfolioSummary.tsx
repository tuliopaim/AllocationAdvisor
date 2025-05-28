import React from 'react';
import type { PortfolioSummaryProps } from '../../types/investiment';

interface SummaryCardProps {
    title: string;
    value: number;
    formatMoney: (value: number) => string;
    className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, formatMoney, className = '' }) => (
    <div className={`flex flex-col p-6 bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md transition-all ${className}`}>
        <div className="flex justify-between items-center">
            <div>
                <div className="text-slate-600 mb-1.5 font-medium">{title}</div>
                <div className="text-lg font-bold text-slate-900">
                    {formatMoney(value)}
                </div>
            </div>
        </div>
    </div>
);

interface CategoryCardProps {
    category: string;
    total: number;
    allocation: number;
    formatMoney: (value: number) => string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, total, allocation, formatMoney }) => (
    <div className="flex flex-col p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
        <div className="flex justify-between items-start mb-3">
            <span className="font-semibold text-slate-900">{category}</span>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                {allocation.toFixed(1)}%
            </span>
        </div>
        <div className="text-lg font-semibold text-slate-900">
            {formatMoney(total)}
        </div>
    </div>
);

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolioSummary, formatMoney }) => {
    const totalPortfolio = Object.values(portfolioSummary).reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold">Resumo do Portfolio</h3>

            <div className="space-y-4">
                <SummaryCard
                    title="Total do Portfolio"
                    value={totalPortfolio}
                    formatMoney={formatMoney}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(portfolioSummary)
                        .sort(([, a], [, b]) => b.total - a.total)
                        .map(([category, data]) => (
                            <CategoryCard
                                key={category}
                                category={category}
                                total={data.total}
                                allocation={data.allocation}
                                formatMoney={formatMoney}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default PortfolioSummary;
