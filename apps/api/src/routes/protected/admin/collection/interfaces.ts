export interface GenerateMonthlyPerformanceInput {
  id: number;
  year: number;
  month: number;
}

export interface GenerateDailyPerformanceInput {
  id: number;
  date: string;
}

export interface DistributionInput {
  id: number;
  selected: number[];
}
