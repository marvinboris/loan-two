export interface SubmitInput {
  amount: number;
  id: number;
  mode: 'app' | 'merchant-code';
  screenshot?: string;
  customerId: number;
}
