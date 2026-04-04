import { BRIM_POLICY } from "@/lib/policy/brim-policy";
import { formatCurrency, formatPercent } from "@/lib/transactions/format";
import type {
  ComplianceFlag,
  DashboardData,
  NormalizedTransaction,
} from "@/types/transactions";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "by",
  "can",
  "for",
  "from",
  "give",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "or",
  "show",
  "summarize",
  "tell",
  "the",
  "this",
  "to",
  "what",
  "which",
  "with",
]);

const MAX_RELEVANT_TRANSACTIONS = 8;
const MAX_RELEVANT_FLAGS = 8;
const MAX_LARGEST_TRANSACTIONS = 5;
const MAX_FLAG_HIGHLIGHTS = 5;

export function buildAssistantSystemPrompt(
  question: string,
  dashboard: DashboardData,
): string {
  const relevantTransactions = findRelevantTransactions(question, dashboard.transactions);
  const relevantFlags = findRelevantFlags(question, dashboard.compliance.flags);
  const largestTransactions = [...dashboard.transactions]
    .filter((transaction) => transaction.amount > 0)
    .sort((a, b) => b.amount - a.amount || b.date.localeCompare(a.date))
    .slice(0, MAX_LARGEST_TRANSACTIONS);
  const highlightedRiskFlags = dashboard.compliance.flags
    .filter((flag) => flag.classification === "risk")
    .slice(0, MAX_FLAG_HIGHLIGHTS);
  const topFlagTypes = dashboard.compliance.summary.flagTypeCounts.slice(0, 5);
  const countryMix = dashboard.summary.countryBreakdown.slice(0, 5);
  const topMerchants = dashboard.summary.topMerchants.slice(0, 5);

  return [
    "You are the Brim Expense Intelligence finance copilot.",
    "Answer only with facts grounded in the loaded workbook data and the explicit Brim policy rules below.",
    "Do not invent transactions, policy rules, approvals, receipts, employees, or reimbursements.",
    "Treat the compliance classifications and severities as deterministic outputs from the local rule engine.",
    "If the available context does not support a confident answer, say that clearly.",
    "Separate facts from interpretation with phrasing like 'The loaded data shows...' or 'This may suggest...'.",
    "Keep the answer concise and demo-friendly.",
    "",
    "Grounded policy rules:",
    `- ${BRIM_POLICY.preAuthorizationReference}`,
    `- ${BRIM_POLICY.receiptsReference}`,
    `- ${BRIM_POLICY.cardFeeReference}`,
    `- ${BRIM_POLICY.abuseReference}`,
    "",
    "Workbook snapshot:",
    `- Dataset: ${dashboard.source.datasetName}`,
    `- Transactions loaded: ${dashboard.summary.transactionCount}`,
    `- Total spend: ${formatCurrency(dashboard.summary.totalSpend)}`,
    `- Date range: ${dashboard.summary.startDate} to ${dashboard.summary.endDate}`,
    `- Countries covered: ${dashboard.summary.countryCount}`,
    "",
    "Top merchants by spend:",
    ...topMerchants.map(
      (merchant) =>
        `- ${merchant.merchant}: ${formatCurrency(merchant.totalSpend)} (${formatPercent(
          merchant.shareOfSpend,
        )} of spend)`,
    ),
    "",
    "Country mix:",
    ...countryMix.map(
      (country) =>
        `- ${country.country}: ${formatCurrency(country.totalSpend)} (${formatPercent(
          country.shareOfSpend,
        )} of spend)`,
    ),
    "",
    "Current dashboard insights:",
    ...dashboard.insights.map((insight) => `- ${insight.title} ${insight.detail}`),
    "",
    "Compliance snapshot:",
    `- Total flags: ${dashboard.compliance.summary.totalFlags}`,
    `- Flagged transactions: ${dashboard.compliance.summary.flaggedTransactionCount}`,
    `- Risk alerts: ${dashboard.compliance.summary.classificationCounts.risk}`,
    `- Workflow items: ${dashboard.compliance.summary.classificationCounts.workflow}`,
    `- Info items: ${dashboard.compliance.summary.classificationCounts.info}`,
    `- High severity flags: ${dashboard.compliance.summary.severityCounts.high}`,
    "",
    "Most common flag types:",
    ...topFlagTypes.map(
      (flagType) => `- ${formatFlagType(flagType.flagType)}: ${flagType.count}`,
    ),
    "",
    "Largest spend transactions:",
    ...largestTransactions.map(summarizeTransaction),
    "",
    "Representative risk alerts:",
    ...highlightedRiskFlags.map(summarizeFlag),
    "",
    relevantTransactions.length > 0
      ? "Relevant transactions for the latest user question:"
      : "Relevant transactions for the latest user question: none matched directly",
    ...relevantTransactions.map(summarizeTransaction),
    "",
    relevantFlags.length > 0
      ? "Relevant compliance flags for the latest user question:"
      : "Relevant compliance flags for the latest user question: none matched directly",
    ...relevantFlags.map(summarizeFlag),
  ].join("\n");
}

function findRelevantTransactions(
  question: string,
  transactions: NormalizedTransaction[],
): NormalizedTransaction[] {
  const keywords = extractKeywords(question);

  if (keywords.length === 0) {
    return [];
  }

  return transactions
    .map((transaction) => ({
      transaction,
      score: scoreTransaction(transaction, keywords),
    }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.transaction.date.localeCompare(a.transaction.date) ||
        b.transaction.amount - a.transaction.amount,
    )
    .slice(0, MAX_RELEVANT_TRANSACTIONS)
    .map((item) => item.transaction);
}

function findRelevantFlags(question: string, flags: ComplianceFlag[]): ComplianceFlag[] {
  const keywords = extractKeywords(question);

  if (keywords.length === 0) {
    return [];
  }

  return flags
    .map((flag) => ({
      flag,
      score: scoreFlag(flag, keywords),
    }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        severityRank(a.flag.severity) - severityRank(b.flag.severity) ||
        b.flag.date.localeCompare(a.flag.date) ||
        b.flag.amount - a.flag.amount,
    )
    .slice(0, MAX_RELEVANT_FLAGS)
    .map((item) => item.flag);
}

function extractKeywords(question: string) {
  return [...new Set(
    question
      .toLowerCase()
      .split(/[^a-z0-9.-]+/)
      .map((part) => part.trim())
      .filter(
        (part) =>
          part.length >= 2 &&
          !STOP_WORDS.has(part),
      ),
  )];
}

function scoreTransaction(transaction: NormalizedTransaction, keywords: string[]) {
  const merchant = transaction.merchant.toLowerCase();
  const description = transaction.description.toLowerCase();
  const category = (transaction.category ?? "").toLowerCase();
  const country = (transaction.country ?? "").toLowerCase();
  const date = transaction.date.toLowerCase();
  const amount = `${transaction.amount}`.toLowerCase();

  return keywords.reduce((score, keyword) => {
    let nextScore = score;

    if (merchant.includes(keyword)) {
      nextScore += 4;
    }

    if (description.includes(keyword)) {
      nextScore += 3;
    }

    if (category.includes(keyword) || country.includes(keyword) || date.includes(keyword)) {
      nextScore += 2;
    }

    if (amount.includes(keyword)) {
      nextScore += 1;
    }

    return nextScore;
  }, 0);
}

function scoreFlag(flag: ComplianceFlag, keywords: string[]) {
  const merchant = flag.merchant.toLowerCase();
  const flagType = formatFlagType(flag.flagType).toLowerCase();
  const explanation = flag.explanation.toLowerCase();
  const details = flag.details.join(" ").toLowerCase();
  const classification = flag.classification.toLowerCase();
  const severity = flag.severity.toLowerCase();
  const date = flag.date.toLowerCase();
  const amount = `${flag.amount}`.toLowerCase();

  return keywords.reduce((score, keyword) => {
    let nextScore = score;

    if (merchant.includes(keyword) || flagType.includes(keyword)) {
      nextScore += 4;
    }

    if (explanation.includes(keyword) || details.includes(keyword)) {
      nextScore += 3;
    }

    if (classification.includes(keyword) || severity.includes(keyword) || date.includes(keyword)) {
      nextScore += 2;
    }

    if (amount.includes(keyword)) {
      nextScore += 1;
    }

    return nextScore;
  }, 0);
}

function summarizeTransaction(transaction: NormalizedTransaction) {
  return `- ${transaction.date} | ${transaction.merchant} | ${formatCurrency(
    transaction.amount,
  )} | ${transaction.category ?? "Unmapped"} | ${transaction.country ?? "Unknown"} | ${
    transaction.description
  }`;
}

function summarizeFlag(flag: ComplianceFlag) {
  return `- ${flag.date} | ${flag.merchant} | ${formatCurrency(flag.amount)} | ${formatClassification(
    flag.classification,
  )} | ${capitalize(flag.severity)} | ${formatFlagType(flag.flagType)} | ${flag.explanation}`;
}

function formatFlagType(value: ComplianceFlag["flagType"]) {
  return value
    .split("_")
    .map(capitalize)
    .join(" ");
}

function formatClassification(value: ComplianceFlag["classification"]) {
  return capitalize(value);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function severityRank(value: ComplianceFlag["severity"]) {
  switch (value) {
    case "high":
      return 0;
    case "medium":
      return 1;
    case "low":
      return 2;
  }
}
