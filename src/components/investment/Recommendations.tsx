import React from 'react';
import type { RecommendationsProps } from '../../types/investiment';
import { sumBy } from 'lodash';

interface PortfolioSummaryCardProps {
    currentTotal: number;
    afterTotal: number;
    investmentAmount: number;
    formatMoney: (value: number) => string;
}

const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
    currentTotal,
    afterTotal,
    investmentAmount,
    formatMoney
}) => {
    const percentageChange = ((investmentAmount / currentTotal) * 100).toFixed(2);
    const isPositive = investmentAmount > 0;

    return (
        <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-slate-800">Total do Portfólio</h4>
                    <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 bg-slate-50/50'}`}>
                            +{percentageChange}%
                        </span>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 bg-slate-50/50'}`}>
                            +{formatMoney(investmentAmount)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                        <div className="text-slate-500 mb-1.5 font-medium">Atual</div>
                        <div className="text-xl font-bold text-slate-900">
                            {formatMoney(currentTotal)}
                        </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                        <div className="text-slate-500 mb-1.5 font-medium">Após aporte</div>
                        <div className="text-xl font-bold text-slate-900">
                            {formatMoney(afterTotal)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface CategoryCardProps {
    category: string;
    currentTotal: number;
    newTotal: number;
    currentAllocation: number;
    newAllocation: number;
    difference: number;
    valueDifference: number;
    formatMoney: (value: number) => string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, currentTotal, newTotal, currentAllocation, newAllocation, difference, valueDifference, formatMoney }) => {
    const getDifferenceColor = (diff: number) =>
        diff > 0 ? 'text-emerald-700 bg-emerald-50/50' :
            diff < 0 ? 'text-amber-700 bg-amber-50/50' :
                'text-slate-600 bg-slate-50/50';

    return (
        <div className="flex flex-col p-4 hover:bg-slate-50/50 rounded-lg border border-slate-100 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-slate-800">{category}</span>
                <div className="flex flex-col items-end">
                    <span className={`text-sm px-2 py-0.5 rounded-full ${getDifferenceColor(difference)}`}>
                        {difference > 0 ? '+' : ''}{difference.toFixed(2)}%
                    </span>
                    {valueDifference !== 0 && (
                        <span className={`text-sm mt-1 px-2 py-0.5 rounded-full ${getDifferenceColor(valueDifference)}`}>
                            {valueDifference > 0 ? '+' : ''}{formatMoney(valueDifference)}
                        </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="text-slate-500 mb-1">Atual</div>
                    <div className="font-medium text-slate-700">
                        {formatMoney(currentTotal)}
                        <span className="text-slate-400 ml-1">({currentAllocation.toFixed(1)}%)</span>
                    </div>
                </div>
                <div>
                    <div className="text-slate-500 mb-1">Após aporte</div>
                    <div className="font-medium text-slate-700">
                        {formatMoney(newTotal)}
                        <span className="text-slate-400 ml-1">({newAllocation.toFixed(1)}%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface RecommendationCardProps {
    recommendation: any;
    formatMoney: (value: number) => string;
    formatShares: (value: number, price?: number) => string | null;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, formatMoney, formatShares }) => {
    const categoryColors = {
        'ETF': 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50',
        'Ações BR': 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50',
        'FII': 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50',
        'Renda Fixa BRL': 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50',
        'Cripto': 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50'
    };

    const colorClass = categoryColors[recommendation.category as keyof typeof categoryColors] || 'bg-slate-50/50 border-slate-100/50 hover:bg-slate-100/50';

    const categoryBadgeColors = {
        'ETF': 'bg-blue-50/50 text-blue-700/90',
        'Ações BR': 'bg-emerald-50/50 text-emerald-700/90',
        'FII': 'bg-amber-50/50 text-amber-700/90',
        'Renda Fixa BRL': 'bg-violet-50/50 text-violet-700/90',
        'Cripto': 'bg-rose-50/50 text-rose-700/90'
    };

    const badgeColorClass = categoryBadgeColors[recommendation.category as keyof typeof categoryBadgeColors] || 'bg-slate-50/50 text-slate-700/90';

    return (
        <div className={`p-4 rounded-lg border ${colorClass} transition-colors duration-200`}>
            <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                    <span className="font-medium text-slate-800">{recommendation.asset}</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${badgeColorClass}`}>
                        {recommendation.category}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500">Nota:</span>{' '}
                        <span className="font-medium text-slate-700">{recommendation.score}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Alocação:</span>{' '}
                        <span className="font-medium text-slate-700">
                            {recommendation.currentAllocation.toFixed(1)}% → {recommendation.targetAllocation.toFixed(1)}%
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-700">Recomendação:</span>
                        {['FII', 'Ações BR'].includes(recommendation.category) && recommendation.price && (
                            <span className="text-sm text-slate-500 mt-1">
                                {formatShares(recommendation.value, recommendation.price)}
                            </span>
                        )}
                    </div>
                    <span className="text-lg font-medium text-slate-800">
                        {formatMoney(recommendation.value)}
                        <span className="text-sm font-normal text-slate-500 ml-1">
                            ({recommendation.percentage.toFixed(1)}%)
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

const Recommendations: React.FC<RecommendationsProps> = ({
    recommendations,
    formatMoney,
    portfolioSummary,
    investmentAmount
}) => {
    const validRecommendations = recommendations.filter(r => r.value > 0);
    const portfolioTotalCurrent = sumBy(Object.values(portfolioSummary), 'total');
    const portfolioTotalAfter = portfolioTotalCurrent + investmentAmount;

    const formatShares = (value: number, price?: number): string | null => {
        if (!price || price <= 0) return null;
        const shares = Math.floor(value / price);
        return `${shares} cota${shares !== 1 ? 's' : ''}`;
    };

    return (
        <div className="mt-8 space-y-6">
            <div className="flex flex-col space-y-2">
                <h3 className="text-2xl font-semibold text-slate-800">
                    Estratégia de Investimento
                </h3>
                <p className="text-slate-600">
                    Recomendações personalizadas para otimizar seu portfólio
                </p>
            </div>

            <div className="space-y-6">
                <PortfolioSummaryCard
                    currentTotal={portfolioTotalCurrent}
                    afterTotal={portfolioTotalAfter}
                    investmentAmount={investmentAmount}
                    formatMoney={formatMoney}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(portfolioSummary)
                        .sort(([, a], [, b]) => b.total - a.total)
                        .map(([category, data]) => {
                            const currentTotal = data.total;
                            const categoryRecs = validRecommendations.filter(r => r.category === category);
                            const aporteCategoria = sumBy(categoryRecs, 'value');
                            const novoTotal = currentTotal + aporteCategoria;
                            const portfolioTotalAtual = sumBy(Object.values(portfolioSummary), 'total');
                            const novoPortfolioTotal = portfolioTotalAtual + investmentAmount;
                            const novaAlocacao = (novoTotal / novoPortfolioTotal) * 100;
                            const alocacaoAtual = data.allocation;
                            const diferencaPercentual = novaAlocacao - alocacaoAtual;
                            const diferencaValor = novoTotal - currentTotal;

                            return (
                                <CategoryCard
                                    key={category}
                                    category={category}
                                    currentTotal={currentTotal}
                                    newTotal={novoTotal}
                                    currentAllocation={alocacaoAtual}
                                    newAllocation={novaAlocacao}
                                    difference={diferencaPercentual}
                                    valueDifference={diferencaValor}
                                    formatMoney={formatMoney}
                                />
                            );
                        })}
                </div>

                <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-4">
                    {validRecommendations.map((recommendation, index) => (
                        <RecommendationCard
                            key={index}
                            recommendation={recommendation}
                            formatMoney={formatMoney}
                            formatShares={formatShares}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Recommendations;
