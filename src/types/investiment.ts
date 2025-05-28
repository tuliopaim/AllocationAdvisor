export interface PortfolioItem {
    category: string;
    score: number;
    investment: string;
    price: number;
    totalAmount: number;
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
    category: string;
    asset: string;
    score: number;
    currentAllocation: number;
    targetAllocation: number;
    value: number;
    percentage: number;
    price?: number;
}

export interface PortfolioTableProps {
    portfolioData: PortfolioItem[];
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
