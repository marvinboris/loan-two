export interface KycValidationInput {
  id: number;
  validated: boolean;
  reason?: string;
}

export interface BorrowValidationInput {
  id: number;
  validated: boolean;
  externalId?: string;
  reason?: string;
}

export interface BorrowCancellationInput {
  id: number;
}

export interface BorrowRepaymentInput {
  id: number;
  amount: number;
  ref: string;
}

export interface UnblockClientInput {
  id: number;
}
