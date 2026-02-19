export interface GenerateMonthlyPerformanceInput {
  id: number;
  year: number;
  month: number;
}

export interface GenerateDailyPerformanceInput {
  id: number;
  date: string;
}

export interface KycValidationInput {
  id: number;
  validated: boolean;
  reason?: string;
}

export interface BorrowValidationInput {
  id: number;
  validated: boolean;
  reason?: string;
}

export interface BorrowCancellationInput {
  id: number;
}

export interface ManualAssignmentInput {
  id: number;
  selected: number[];
}

export interface ReleaseInput {
  selected: number[];
}
