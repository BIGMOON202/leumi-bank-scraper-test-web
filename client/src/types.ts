export type TxnRow = {
  type: string;
  identifier?: number;
  date: string;
  processedDate: string;
  originalAmount: number;
  originalCurrency: string;
  chargedAmount: number;
  description: string;
  memo: string | null;
  installments?: { number: number; total: number };
  status: string;
};

export type AccountRow = {
  accountNumber: string;
  balance?: number;
  txns: TxnRow[];
};

export type ScrapeSuccess = {
  success: true;
  accounts: AccountRow[];
};

export type ScrapeFailure = {
  success: false;
  errorType: string;
  errorMessage?: string;
};

export type ScrapeResult = ScrapeSuccess | ScrapeFailure;
