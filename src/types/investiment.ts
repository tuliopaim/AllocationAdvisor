export interface PortfolioItem {
    Categoria: string;
    Nota: number;
    Investimento: string;
    Cotacao: number;
    'Total em Reais': number;
}

export interface CategorySummary {
    total: number;
    allocation: number;
}

export interface PortfolioSummary {
    [category: string]: CategorySummary;
}

export interface TargetAllocations {
    [category: string]: number;
}

export interface Recommendation {
    categoria: string;
    ativo: string;
    nota: number;
    alocacaoAtual: number;
    alocacaoMeta: number;
    valor: number;
    percentual: number;
    cotacao?: number;
}

export interface PortfolioTableProps {
    portfolioData: PortfolioItem[];
    formatMoney: (value: number) => string;
}

export interface PortfolioSummaryProps {
    portfolioSummary: PortfolioSummary;
    formatMoney: (value: number) => string;
}

export interface RecommendationsProps {
    recommendations: Recommendation[];
    formatMoney: (value: number) => string;
    portfolioSummary: PortfolioSummary;
    investmentAmount: number;
}

export interface TargetAllocationsProps {
    targetAllocations: TargetAllocations;
    setTargetAllocations: (allocations: TargetAllocations) => void;
    portfolioData: PortfolioItem[] | null;
    portfolioSummary: PortfolioSummary | null;
    calculateRecommendations: (
        data: PortfolioItem[],
        amount: number,
        summary: PortfolioSummary
    ) => void;
    investmentAmount: number;
}
