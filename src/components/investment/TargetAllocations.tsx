import React, { useMemo } from 'react';
import type { TargetAllocationsProps } from '../../types/investiment';

interface AllocationInputProps {
    category: string;
    value: number;
    onChange: (category: string, value: number) => void;
}

const AllocationInput: React.FC<AllocationInputProps> = ({
    category,
    value,
    onChange
}) => (
    <div className="bg-white/50 p-5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-600">
                {category}
            </label>
        </div>
        <div className="relative">
            <div className="relative flex items-center">
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={value || ''}
                    onChange={(e) => onChange(category, e.target.value === '' ? 0 : Number(e.target.value))}
                    className="block w-full p-3 border rounded-lg
                        focus:ring-2 focus:ring-slate-300 focus:border-slate-300 
                        transition-colors
                        hover:border-slate-300
                        [appearance:textfield]
                        [&::-webkit-outer-spin-button]:appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none
                        pr-8
                        border-slate-200 text-slate-700"
                />
                <span className="absolute right-3 pointer-events-none text-slate-400">
                    %
                </span>
            </div>
        </div>
    </div>
);

const TargetAllocations: React.FC<TargetAllocationsProps> = ({
    targetAllocations,
    setTargetAllocations,
    portfolioData,
    portfolioSummary,
    calculateRecommendations,
    investmentAmount
}) => {
    const totalAllocation = useMemo(() => {
        return Object.values(targetAllocations).reduce((sum, value) => sum + value, 0);
    }, [targetAllocations]);

    const handleAllocationChange = (category: string, value: number) => {
        const newAllocations = {
            ...targetAllocations,
            [category]: value
        };
        setTargetAllocations(newAllocations);

        if (portfolioData && portfolioSummary) {
            calculateRecommendations(portfolioData, investmentAmount, portfolioSummary);
        }
    };

    return (
        <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-800">Metas por Categoria</h3>
                <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${totalAllocation === 100
                        ? 'text-emerald-700 bg-emerald-50/50'
                        : 'text-amber-700 bg-amber-50/50'
                        }`}>
                        {totalAllocation}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(targetAllocations).map(([category, target]) => (
                    <AllocationInput
                        key={category}
                        category={category}
                        value={target}
                        onChange={handleAllocationChange}
                    />
                ))}
            </div>

            {totalAllocation !== 100 && (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                    <p className="text-sm text-amber-700">
                        A soma das alocações deve ser igual a 100%
                    </p>
                </div>
            )}
        </div>
    );
};

export default TargetAllocations;
