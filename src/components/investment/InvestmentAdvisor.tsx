import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import Papa from 'papaparse';
import { groupBy, sumBy } from 'lodash';
import { Download } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import Recommendations from './Recommendations';
import TargetAllocations from './TargetAllocations';
import PortfolioTable from './PortfolioTable';
import type {
    PortfolioItem,
    PortfolioSummary as PortfolioSummaryType,
    TargetAllocations as TargetAllocationsType,
    Recommendation,
} from '../../types/investiment';

interface RawPortfolioItem {
    Categoria: string;
    Nota: string;
    Investimento: string;
    'Cotação': string;
    'Total em Reais': string;
    [key: string]: string;
}

const InvestmentAdvisor: React.FC = () => {
    const [portfolioData, setPortfolioData] = useState<PortfolioItem[] | null>(null);
    const [showPortfolioTable, setShowPortfolioTable] = useState(true);
    const [targetAllocations, setTargetAllocations] = useState<TargetAllocationsType>({
        'Cripto': 5,
        'ETF': 30,
        'Ações BR': 20,
        'FII': 5,
        'Renda Fixa BRL': 40
    });
    const [investmentAmount, setInvestmentAmount] = useState<number>(5000);
    const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
    const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummaryType | null>(null);

    const formatMoney = (value: number): string => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const cleanMoneyValue = (value: string | number): number => {
        if (typeof value === 'string') {
            const cleanStr = value.replace(/[R$\s]/g, '');
            if (cleanStr.includes(',')) {
                const parts = cleanStr.split(',');
                const reais = parts[0].replace(/\./g, '');
                const centavos = parts[1].slice(0, 2);
                return Number(`${reais}.${centavos}`);
            }
            return Number(cleanStr);
        }
        return value || 0;
    };

    const getTemplateContent = (): string => {
        const headers = ['Categoria', 'Nota', 'Investimento', 'Cotação', 'Total em Reais'];
        return Papa.unparse({
            fields: headers,
            data: [
                ['ETF', '9', 'IWDA', 110.3, '15000.00'],
                ['ETF', '8', 'EIMI', 34.43, '10000.00'],
                ['Ações BR', '9', 'WEGE3', 54, '8000.00'],
                ['Ações BR', '7', 'ITSA4', 9.43, '5000.00'],
                ['FII', '8', 'KNRI11', 129.5, '6000.00'],
                ['Renda Fixa BRL', '7', 0, 'Tesouro IPCA+ 2026', '4000.00'],
                ['Cripto', '6', 'Bitcoin', 0, '2000.00']
            ]
        });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    Papa.parse<RawPortfolioItem>(result, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const processedData = results.data.map(row => ({
                                category: row.Categoria,
                                investment: row.Investimento,
                                price: cleanMoneyValue(row['Cotação']),
                                totalAmount: cleanMoneyValue(row['Total em Reais']),
                                score: Number(row.Nota || 0)
                            })) as PortfolioItem[];

                            const totalPortfolio = sumBy(processedData, 'totalAmount');
                            const categoryTotals = groupBy(processedData, 'category');
                            const summary: PortfolioSummaryType = {};

                            Object.entries(categoryTotals).forEach(([category, assets]) => {
                                const categoryTotal = sumBy(assets, 'totalAmount');
                                summary[category] = {
                                    total: categoryTotal,
                                    allocation: (categoryTotal / totalPortfolio) * 100
                                };
                            });

                            setPortfolioSummary(summary);
                            setPortfolioData(processedData);
                            calculateRecommendations(processedData, investmentAmount, summary);
                        }
                    });
                }
            };
            reader.readAsText(file);
        }
    };

    function calculatePortfolioTotals(
        summary: PortfolioSummaryType,
        additionalAmount: number
    ): { currentTotal: number; futureTotal: number } {
        const currentTotal = sumBy(Object.values(summary), 'total') || 0.01;
        return { currentTotal, futureTotal: currentTotal + additionalAmount };
    }

    function calculateCategoryDeficits(
        targetAllocations: Record<string, number>,
        portfolioFutureTotal: number,
        summary: PortfolioSummaryType
    ): { deficits: Record<string, number>; totalDeficit: number } {
        const deficits: Record<string, number> = {};
        let totalDeficit = 0;

        Object.entries(targetAllocations).forEach(([category, targetPercent]) => {
            const targetValue = (targetPercent / 100) * portfolioFutureTotal;
            const currentValue = summary[category]?.total || 0;
            const deficit = Math.max(0, targetValue - currentValue);

            if (deficit > 0) {
                deficits[category] = deficit;
                totalDeficit += deficit;
            }
        });

        return { deficits, totalDeficit };
    }

    function calculateCategoryAllocations(
        deficits: Record<string, number>,
        totalDeficit: number,
        totalInvestment: number,
        data: PortfolioItem[],
        targetAllocations: Record<string, number>
    ): Record<string, number> {
        const allocations: Record<string, number> = {};
        let remainingInvestment = totalInvestment;

        if (totalDeficit > 0) {
            Object.entries(deficits).forEach(([category, deficit]) => {
                const categoryAssets = data.filter(item => item.category === category);
                const totalScore = sumBy(categoryAssets, 'score');

                if (totalScore > 0) {
                    const initialAllocation = (deficit / totalDeficit) * totalInvestment;
                    allocations[category] = initialAllocation;
                    remainingInvestment -= initialAllocation;
                }
            });
        }

        if (remainingInvestment > 0) {
            const validCategories = Object.entries(targetAllocations)
                .filter(([category]) => {
                    const categoryAssets = data.filter(item => item.category === category);
                    return sumBy(categoryAssets, 'score') > 0;
                })
                .map(([category]) => category);

            if (validCategories.length > 0) {
                const remainingPerCategory = remainingInvestment / validCategories.length;
                validCategories.forEach(category => {
                    allocations[category] = (allocations[category] || 0) + remainingPerCategory;
                });
            }
        }

        return allocations;
    }

    function processWholeCategory(
        category: string,
        categoryAmount: number,
        assets: PortfolioItem[],
        summary: PortfolioSummaryType,
        targetAllocation: number,
        portfolioFutureTotal: number,
        totalInvestment: number
    ): { recommendations: Recommendation[]; totalAdjusted: number } {
        const recommendations: Recommendation[] = [];
        let totalAdjusted = 0;

        if (assets.length === 0) {
            return { recommendations, totalAdjusted };
        }

        const totalScore = sumBy(assets, 'score');
        if (totalScore === 0) {
            return { recommendations, totalAdjusted };
        }

        const categoryTargetValue = (targetAllocation / 100) * portfolioFutureTotal;

        const assetDeficits = assets.map((asset) => {
            const idealAllocation = (asset.score / totalScore) * categoryTargetValue;
            const currentAssetValue = asset.totalAmount || 0;
            return {
                asset,
                deficit: Math.max(0, idealAllocation - currentAssetValue),
            };
        });
        const totalAssetDeficit = assetDeficits.reduce(
            (sum, { deficit }) => sum + deficit,
            0
        );

        assetDeficits.forEach(({ asset, deficit }) => {
            const recommendedAllocation = totalAssetDeficit > 0
                ? (deficit / totalAssetDeficit) * categoryAmount
                : 0;
            const price = asset.price;
            let adjustedAllocation = 0;
            if (price > 0) {
                const shares = Math.floor(recommendedAllocation / price);
                adjustedAllocation = shares * price;
            }
            if (adjustedAllocation > 0) {
                recommendations.push({
                    category: category,
                    asset: asset.investment,
                    score: asset.score,
                    currentAllocation: summary[category]?.allocation || 0,
                    targetAllocation: targetAllocation,
                    value: adjustedAllocation,
                    percentage: (adjustedAllocation / totalInvestment) * 100,
                    price: price,
                });
                totalAdjusted += adjustedAllocation;
            }
        });

        return { recommendations, totalAdjusted };
    }

    function processNonWholeCategory(
        category: string,
        categoryAmount: number,
        assets: PortfolioItem[],
        summary: PortfolioSummaryType,
        targetAllocation: number,
        portfolioFutureTotal: number,
        totalInvestment: number
    ): Recommendation[] {
        const recommendations: Recommendation[] = [];

        if (assets.length === 0) {
            return recommendations;
        }

        const totalScore = sumBy(assets, 'score');
        if (totalScore === 0) {
            return recommendations;
        }

        const categoryTargetValue = (targetAllocation / 100) * portfolioFutureTotal;

        const assetDeficits = assets.map((asset) => {
            const idealAllocation = (asset.score / totalScore) * categoryTargetValue;
            const currentAssetValue = asset.totalAmount || 0;
            return {
                asset,
                deficit: Math.max(0, idealAllocation - currentAssetValue),
            };
        });
        const totalAssetDeficit = assetDeficits.reduce(
            (sum, { deficit }) => sum + deficit,
            0
        );

        assetDeficits.forEach(({ asset, deficit }) => {
            const recommendedAllocation = totalAssetDeficit > 0
                ? (deficit / totalAssetDeficit) * categoryAmount
                : (asset.score / totalScore) * categoryAmount;

            recommendations.push({
                category: category,
                asset: asset.investment,
                score: asset.score,
                currentAllocation: summary[category]?.allocation || 0,
                targetAllocation: targetAllocation,
                value: recommendedAllocation,
                percentage: (recommendedAllocation / totalInvestment) * 100,
                price: asset.price,
            });
        });

        return recommendations;
    }

    const calculateRecommendations = (
        data: PortfolioItem[],
        amount: number,
        summary: PortfolioSummaryType
    ): void => {
        const { futureTotal } = calculatePortfolioTotals(summary, amount);
        const { deficits, totalDeficit } = calculateCategoryDeficits(
            targetAllocations,
            futureTotal,
            summary
        );

        const categoryAllocations = calculateCategoryAllocations(
            deficits,
            totalDeficit,
            amount,
            data,
            targetAllocations
        );

        const allRecommendations: Recommendation[] = [];

        Object.entries(categoryAllocations).forEach(([category, categoryAmount]) => {
            const categoryAssets = data.filter(item => item.category === category);
            const targetAllocation = targetAllocations[category];

            if (['FII', 'Ações BR'].includes(category)) {
                const { recommendations: wholeRecommendations } = processWholeCategory(
                    category,
                    categoryAmount,
                    categoryAssets,
                    summary,
                    targetAllocation,
                    futureTotal,
                    amount
                );
                allRecommendations.push(...wholeRecommendations);
            } else {
                const nonWholeRecommendations = processNonWholeCategory(
                    category,
                    categoryAmount,
                    categoryAssets,
                    summary,
                    targetAllocation,
                    futureTotal,
                    amount
                );
                allRecommendations.push(...nonWholeRecommendations);
            }
        });

        setRecommendations(allRecommendations);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex flex-col space-y-2 mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                        Meu Consultor de Investimentos
                    </h1>
                    <p className="text-slate-600">
                        Análise inteligente e recomendações personalizadas para seu portfólio
                    </p>
                </div>

                <div className="space-y-8">
                    <Card className="bg-white shadow-sm border-slate-100">
                        <CardHeader>
                            <div className="bg-slate-50/50 p-6 rounded-lg border border-slate-100 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-2">Modelo de Planilha</h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Baixe o modelo de planilha e preencha com seus investimentos atuais
                                        </p>
                                        <a
                                            href={"data:text/csv;charset=utf-8," + encodeURIComponent(getTemplateContent())}
                                            download="modelo_carteira.csv"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors shadow-sm hover:shadow-md"
                                        >
                                            <Download size={18} />
                                            <span>Baixar Modelo CSV</span>
                                        </a>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-2">Upload da Carteira</h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Faça o upload da sua planilha preenchida (formato CSV)
                                        </p>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-md file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-slate-50 file:text-slate-700
                                                        hover:file:bg-slate-10
                                                        cursor-pointer border border-slate-200 rounded-md
                                                        focus:outline-none focus:border-slate-300
                                                        transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">

                                {portfolioData && portfolioData.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-semibold">Portfolio</h3>
                                            <button
                                                onClick={() => setShowPortfolioTable(!showPortfolioTable)}
                                                className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                                            >
                                                {showPortfolioTable ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                        </div>
                                        {showPortfolioTable && (
                                            <PortfolioTable portfolioData={portfolioData} formatMoney={formatMoney} />
                                        )}
                                    </div>
                                )}

                                <TargetAllocations
                                    targetAllocations={targetAllocations}
                                    setTargetAllocations={setTargetAllocations}
                                    portfolioData={portfolioData}
                                    portfolioSummary={portfolioSummary}
                                    calculateRecommendations={calculateRecommendations}
                                    investmentAmount={investmentAmount}
                                />

                                <div className="bg-slate-50/50 p-6 rounded-lg border border-slate-100">
                                    <h3 className="text-xl font-semibold mb-2">Valor do aporte</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Digite o valor que você deseja investir para receber recomendações personalizadas
                                    </p>
                                    <div className="relative">
                                        <NumericFormat
                                            value={investmentAmount}
                                            onValueChange={(values) => {
                                                const newAmount = values.floatValue || 0;
                                                setInvestmentAmount(newAmount);
                                                if (portfolioData && portfolioSummary) {
                                                    calculateRecommendations(portfolioData, newAmount, portfolioSummary);
                                                }
                                            }}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="R$ "
                                            decimalScale={2}
                                            fixedDecimalScale
                                            className="block w-full p-3 pl-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all"
                                            placeholder="R$ 0,00"
                                        />
                                    </div>
                                </div>

                                {recommendations && recommendations.length > 0 ? (
                                    <Recommendations
                                        recommendations={recommendations}
                                        formatMoney={formatMoney}
                                        portfolioSummary={portfolioSummary!}
                                        investmentAmount={investmentAmount}
                                    />
                                ) : (
                                    <div className="mt-6">
                                        <p className="text-gray-500">
                                            {portfolioData ?
                                                "Não há recomendações de aporte no momento. Verifique se existem ativos com nota maior que 0 e se as categorias desses ativos estão abaixo das metas configuradas." :
                                                "Faça upload do arquivo CSV para ver as recomendações de aporte."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InvestmentAdvisor;
