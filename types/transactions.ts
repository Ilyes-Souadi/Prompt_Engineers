export type TransactionType = "purchase" | "credit" | "fee" | "payment";

export type RawTransactionRecord = Record<string, string>;

export type NormalizedTransaction = {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  description: string;
  category?: string;
  country?: string;
  currency: string;
  type: TransactionType;
  raw: RawTransactionRecord;
};

export type MerchantSummary = {
  merchant: string;
  totalSpend: number;
  shareOfSpend: number;
};

export type CountryBreakdown = {
  country: string;
  totalSpend: number;
  shareOfSpend: number;
};

export type DashboardInsight = {
  id: string;
  label: string;
  title: string;
  detail: string;
};

export type DashboardData = {
  source: {
    datasetName: string;
    recordCount: number;
  };
  summary: {
    transactionCount: number;
    totalSpend: number;
    startDate: string;
    endDate: string;
    countryCount: number;
    topMerchants: MerchantSummary[];
    countryBreakdown: CountryBreakdown[];
  };
  insights: DashboardInsight[];
  transactions: NormalizedTransaction[];
};
