// Type definitions for the report analysis — no external dependency needed

export type ReportAnalysis = {
  investmentSnapshot: InvestmentSnapshot;
  executiveSummary: ExecutiveSummary;
  keyDrivers: KeyDrivers;
  bullCase: BullBearCase;
  bearCase: BullBearCase;
  variantPerception: VariantPerception;
  managementQuality: ManagementQuality;
  capitalAllocation: CapitalAllocation;
  financialQuality: FinancialQuality;
  accountingFlags: AccountingFlags;
  governanceReview: GovernanceReview;
  remunerationAnalysis: RemunerationAnalysis;
  riskMatrix: RiskMatrix;
  catalysts: Catalysts;
  managementQuestions: ManagementQuestions;
  investmentMemo: InvestmentMemo;
  overallScore: OverallScore;
};

export type InvestmentSnapshot = {
  companyDescription: string;
  sector: string;
  keyProducts: string[];
  geographicExposure: string[];
  investmentRelevance: string;
  attractivenessScore: number;
  attractivenessRationale: string;
};

export type ExecutiveSummary = {
  whatHappened: string;
  whatMattersMost: string;
  whyInvestorsCare: string;
};

export type KeyDrivers = { drivers: Driver[] };

export type Driver = {
  category: "Revenue" | "Margin" | "Cost" | "Capital Allocation" | "Industry";
  name: string;
  mechanism: string;
  upside: string;
  downside: string;
  rank: number;
};

export type BullBearCase = { points: BullBearPoint[] };

export type BullBearPoint = {
  title: string;
  evidence: string;
  catalyst?: string;
  timeline?: string;
  confidence?: "High" | "Medium" | "Low";
  severity?: "High" | "Medium" | "Low";
  likelihood?: "High" | "Medium" | "Low";
  impact?: string;
};

export type VariantPerception = {
  exists: boolean;
  category?: string;
  thesis?: string;
  evidence?: string;
  magnitude?: string;
};

export type ManagementQuality = {
  ceoCredibility: string;
  strategicConsistency: string;
  capitalAllocationQuality: string;
  shareholderAlignment: string;
  communicationQuality: string;
  score: number;
  evidence: string;
};

export type CapitalAllocation = {
  buybacks: string;
  dividends: string;
  acquisitions: string;
  debtManagement: string;
  reinvestment: string;
  rating: "Excellent" | "Good" | "Average" | "Poor";
  rationale: string;
};

export type FinancialQuality = {
  revenueGrowth: string;
  margins: string;
  cashConversion: string;
  roicIndicators: string;
  leverage: string;
  liquidity: string;
  score: number;
};

export type AccountingFlags = { flags: AccountingFlag[] };

export type AccountingFlag = {
  concern: string;
  detail: string;
  severity: "High" | "Medium" | "Low";
};

export type GovernanceReview = {
  boardStructure: string;
  independence: string;
  governanceQuality: string;
  executiveInfluence: string;
  potentialConflicts: string;
  score: number;
};

export type RemunerationAnalysis = {
  incentiveAlignment: string;
  performanceMetrics: string;
  potentialValueDestruction: string;
  orientation: "Long-term value creation" | "Short-term earnings management" | "Mixed";
  assessment: string;
};

export type RiskMatrix = { risks: Risk[] };

export type Risk = {
  category: "Operational" | "Financial" | "Regulatory" | "Competitive" | "Technological" | "Management";
  name: string;
  description: string;
  severity: "High" | "Medium" | "Low";
};

export type Catalysts = {
  threeMonths: string[];
  sixMonths: string[];
  twelveMonths: string[];
  twentyFourMonths: string[];
};

export type ManagementQuestions = { questions: string[] };

export type InvestmentMemo = {
  thesis: string;
  keyPositives: string[];
  keyRisks: string[];
  catalysts: string[];
  furtherWork: string[];
};

export type OverallScore = {
  total: number;
  businessQuality: number;
  financialQuality: number;
  managementQuality: number;
  governanceQuality: number;
  riskProfile: number;
  capitalAllocationQuality: number;
  explanation: string;
};
